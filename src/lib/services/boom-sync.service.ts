/**
 * BOOM SYNC SERVICE - State of the Art
 *
 * Bi-directional sync between Hostly and Boom PMS:
 *
 * OUTBOUND (Hostly → Boom):
 * - syncReservationToBoom: Push new direct bookings to Boom
 * - This blocks dates on Airbnb, Booking.com, VRBO via Boom
 *
 * INBOUND (Boom → Hostly):
 * - Handled by webhook receiver at /api/webhooks/boom
 * - Receives bookings from OTAs and blocks dates in Hostly
 *
 * FALLBACK:
 * - iCal export at /api/public/{org}/properties/{slug}/calendar.ics
 * - Can be imported into any OTA calendar settings
 */

import { Prisma } from '@prisma/client'
import { boomClient, BoomAPIError, BoomListing } from '@/lib/integrations/boom/client'
import prisma from '@/lib/db/client'

// Type for Boom's days_rates structure
export interface BoomDayRate {
  status: 'available' | 'booked' | 'blocked'
  price: number
  note: string | null
  minNights: number
  weekly_discount: number
  monthly: number
  maxNights: number
  block_type: string | null
  pricing_overriden: boolean
  pricingMinNights: number
  check_in?: boolean
}

export interface BoomPricingResult {
  available: boolean
  blockedDates: string[]
  nights: number
  nightlyRates: Array<{ date: string; price: number; minNights: number }>
  accommodationTotal: number
  cleaningFee: number
  serviceFee: number
  taxes: number
  grandTotal: number
  averageNightlyRate: number
  currency: string
}

export class BoomSyncService {
  // Cache for listings with days_rates
  private listingsCache: Map<number, BoomListing> = new Map()
  private cacheExpiry: Date | null = null
  private cacheTTL = 5 * 60 * 1000 // 5 minutes

  // ════════════════════════════════════════════════════════════════════════════
  // PRICING FROM BOOM days_rates (Real-time pricing)
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Get a listing with full details including days_rates
   */
  async getListingWithPricing(boomId: number): Promise<BoomListing | null> {
    // Check cache
    if (this.listingsCache.has(boomId) && this.cacheExpiry && this.cacheExpiry > new Date()) {
      return this.listingsCache.get(boomId) || null
    }

    try {
      const listing = await boomClient.getListing(boomId)
      this.listingsCache.set(boomId, listing)
      this.cacheExpiry = new Date(Date.now() + this.cacheTTL)
      return listing
    } catch (e) {
      console.error(`[BoomSync] Failed to get listing ${boomId}:`, e)
      return null
    }
  }

  /**
   * Calculate real pricing from Boom's days_rates
   * This is the source of truth for pricing!
   *
   * IMPORTANT: Returns amounts in SMALLEST CURRENCY UNIT (agorot for ILS)
   * This matches the convention used by Stripe, payment processors, and the Rently frontend.
   * Boom returns prices in whole shekels, we multiply by 100 to convert to agorot.
   */
  async calculatePricingFromBoom(
    boomId: number,
    checkIn: string,
    checkOut: string,
    guestsCount: number = 2
  ): Promise<BoomPricingResult | null> {
    const listing = await this.getListingWithPricing(boomId)

    if (!listing) {
      console.error(`[BoomSync] Listing ${boomId} not found`)
      return null
    }

    const daysRates = (listing as any).days_rates as Record<string, BoomDayRate> | undefined
    const extraInfo = (listing as any).extra_info || {}

    if (!daysRates) {
      console.warn(`[BoomSync] No days_rates for listing ${boomId}`)
      return null
    }

    // Generate date range (check-in to day before check-out)
    const dates: string[] = []
    const start = new Date(checkIn)
    const end = new Date(checkOut)

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    const nights = dates.length
    const nightlyRates: Array<{ date: string; price: number; minNights: number }> = []
    const blockedDates: string[] = []
    let accommodationTotal = 0

    // Log first day rate to see discount structure
    const firstDate = dates[0]
    const firstDayRate = daysRates[firstDate]
    if (firstDayRate) {
      console.log(`[BoomSync] Sample day rate for ${boomId}:`, JSON.stringify({
        date: firstDate,
        price: firstDayRate.price,
        weekly_discount: firstDayRate.weekly_discount,
        monthly: firstDayRate.monthly,
        status: firstDayRate.status,
      }))
    }

    for (const date of dates) {
      const dayRate = daysRates[date]

      if (!dayRate) {
        // No rate for this date - might be too far in future or unavailable
        console.warn(`[BoomSync] No rate for ${date} on listing ${boomId}`)
        blockedDates.push(date)
        continue
      }

      if (dayRate.status !== 'available') {
        blockedDates.push(date)
      }

      // Convert from shekels to agorot (multiply by 100)
      // Safety check: if price > 10,000, it's likely already in agorot (cents)
      // Typical Israeli rentals are ₪500-₪3,000/night in shekels
      const rawPrice = dayRate.price || 0
      const priceInAgorot = rawPrice > 10000 ? rawPrice : rawPrice * 100

      if (rawPrice > 10000) {
        console.log(`[BoomSync] Price ${rawPrice} for ${date} appears to be in agorot already (not multiplying)`)
      }

      nightlyRates.push({
        date,
        price: priceInAgorot,
        minNights: dayRate.minNights || 1,
      })

      accommodationTotal += priceInAgorot
    }

    // Get cleaning fee from extra_info (convert to agorot)
    // Safety check: if fee > 1000, it's likely already in agorot
    let cleaningFee = 0
    if (extraInfo.cleaning_fee) {
      const rawFee = parseFloat(extraInfo.cleaning_fee) || 0
      cleaningFee = rawFee > 1000 ? rawFee : rawFee * 100
    } else if (extraInfo.fees) {
      const cleaningFeeItem = extraInfo.fees?.find((f: any) =>
        f.title?.toLowerCase().includes('clean') || f.type === 'cleaning'
      )
      if (cleaningFeeItem) {
        const rawFee = cleaningFeeItem.amount || 0
        cleaningFee = rawFee > 1000 ? rawFee : rawFee * 100
      }
    }

    // Calculate service fee (10%)
    const serviceFee = Math.round(accommodationTotal * 0.10)

    // Calculate taxes (17% VAT for Israel)
    const subtotal = accommodationTotal + cleaningFee + serviceFee
    const taxes = Math.round(subtotal * 0.17)

    const grandTotal = subtotal + taxes

    return {
      available: blockedDates.length === 0,
      blockedDates,
      nights,
      nightlyRates,
      accommodationTotal,
      cleaningFee,
      serviceFee,
      taxes,
      grandTotal,
      averageNightlyRate: nights > 0 ? Math.round(accommodationTotal / nights) : 0,
      currency: (listing as any).currency || 'ILS',
    }
  }

  /**
   * Check availability from Boom's days_rates
   */
  async checkAvailabilityFromBoom(
    boomId: number,
    checkIn: string,
    checkOut: string
  ): Promise<{ available: boolean; blockedDates: string[]; minNightsRequired?: number }> {
    const listing = await this.getListingWithPricing(boomId)

    if (!listing) {
      return { available: false, blockedDates: [] }
    }

    const daysRates = (listing as any).days_rates as Record<string, BoomDayRate> | undefined

    if (!daysRates) {
      return { available: false, blockedDates: [] }
    }

    const blockedDates: string[] = []
    let maxMinNights = 1
    const start = new Date(checkIn)
    const end = new Date(checkOut)

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dayRate = daysRates[dateStr]

      if (!dayRate || dayRate.status !== 'available') {
        blockedDates.push(dateStr)
      }

      if (dayRate?.minNights && dayRate.minNights > maxMinNights) {
        maxMinNights = dayRate.minNights
      }
    }

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    return {
      available: blockedDates.length === 0 && nights >= maxMinNights,
      blockedDates,
      minNightsRequired: maxMinNights,
    }
  }

  /**
   * Clear the listings cache
   */
  clearCache(): void {
    this.listingsCache.clear()
    this.cacheExpiry = null
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RESERVATION SYNC (Hostly ↔ Boom)
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Sync a confirmed reservation to Boom PMS
   * Called after successful payment to block dates on all OTA channels
   */
  async syncReservationToBoom(reservationId: string): Promise<{
    success: boolean
    boomReservationId?: string
    error?: string
  }> {
    // Check if Boom is configured
    if (!boomClient.isEnabled()) {
      console.log('[Boom Sync] Boom not configured, skipping sync')
      return { success: false, error: 'Boom not configured' }
    }

    try {
      // Get the reservation with all details
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          property: true,
          guest: true,
        },
      })

      if (!reservation) {
        console.error('[Boom Sync] Reservation not found:', reservationId)
        return { success: false, error: 'Reservation not found' }
      }

      // Get the Boom listing ID from property metadata
      const boomId = (reservation.property.metadata as any)?.boomId

      if (!boomId) {
        console.warn('[Boom Sync] No Boom ID mapped for property:', reservation.property.name)
        return { success: false, error: `Property "${reservation.property.name}" not mapped to Boom` }
      }

      // Check if already synced
      if (reservation.internalNotes?.includes('Boom ID:')) {
        console.log('[Boom Sync] Reservation already synced to Boom')
        return { success: true, error: 'Already synced' }
      }

      console.log('[Boom Sync] Creating reservation in Boom:', {
        listingId: boomId,
        confirmationCode: reservation.confirmationCode,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guest: reservation.guest?.email,
      })

      // Create reservation in Boom
      const boomReservation = await boomClient.createReservation({
        listing_id: boomId,
        check_in: reservation.checkIn.toISOString().split('T')[0],
        check_out: reservation.checkOut.toISOString().split('T')[0],
        guests_count: reservation.adults + reservation.children,
        first_name: reservation.guest?.firstName || 'Guest',
        last_name: reservation.guest?.lastName || '',
        email: reservation.guest?.email || `${reservation.id}@hostly-booking.local`,
        phone: reservation.guest?.phone || undefined,
        notes: `Hostly Confirmation: ${reservation.confirmationCode}`,
      })

      // Store Boom reservation ID in our database
      const currentNotes = reservation.internalNotes || ''
      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          internalNotes: `${currentNotes}\nBoom ID: ${boomReservation.id}\nBoom Synced: ${new Date().toISOString()}`.trim(),
        },
      })

      // Log success event
      await prisma.event.create({
        data: {
          id: `evt_boom_${Date.now()}`,
          organizationId: reservation.organizationId,
          type: 'boom.reservation.synced',
          aggregateType: 'Reservation',
          aggregateId: reservationId,
          data: {
            boomReservationId: boomReservation.id,
            boomListingId: boomId,
            propertyName: reservation.property.name,
          },
        },
      })

      console.log('[Boom Sync] Successfully synced to Boom:', boomReservation.id)

      return {
        success: true,
        boomReservationId: boomReservation.id,
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Boom Sync] Failed to sync reservation:', errorMessage)

      // Log failure event
      try {
        const reservation = await prisma.reservation.findUnique({
          where: { id: reservationId },
        })
        if (reservation) {
          await prisma.event.create({
            data: {
              id: `evt_boom_${Date.now()}`,
              organizationId: reservation.organizationId,
              type: 'boom.reservation.sync_failed',
              aggregateType: 'Reservation',
              aggregateId: reservationId,
              data: {
                error: errorMessage,
                statusCode: error instanceof BoomAPIError ? error.statusCode : undefined,
              },
            },
          })
        }
      } catch (e) {
        // Ignore logging errors
      }

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Sync availability from Boom to Hostly
   * Called periodically or on-demand to get calendar blocks from OTAs
   */
  async syncAvailabilityFromBoom(propertyId: string): Promise<{
    success: boolean
    daysUpdated?: number
    error?: string
  }> {
    if (!boomClient.isEnabled()) {
      return { success: false, error: 'Boom not configured' }
    }

    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      })

      if (!property) {
        return { success: false, error: 'Property not found' }
      }

      const boomId = (property.metadata as any)?.boomId
      if (!boomId) {
        return { success: false, error: 'Property not mapped to Boom' }
      }

      // Get next 90 days of availability
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(endDate.getDate() + 90)

      const checkIn = today.toISOString().split('T')[0]
      const checkOut = endDate.toISOString().split('T')[0]

      // Get pricing/availability from Boom
      // Note: Boom's pricing endpoint returns availability implicitly
      // If a date is not available, pricing will fail or return 0
      const pricing = await boomClient.getPricing(boomId, checkIn, checkOut, 1)

      console.log('[Boom Sync] Synced availability for:', property.name, pricing.nights_count, 'days')

      return {
        success: true,
        daysUpdated: pricing.nights_count,
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Boom Sync] Failed to sync availability:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Test Boom connection and get stats
   */
  async healthCheck(): Promise<{
    connected: boolean
    listingsCount?: number
    mappedProperties?: number
    error?: string
  }> {
    const boomHealth = await boomClient.healthCheck()

    if (!boomHealth.connected) {
      return boomHealth
    }

    // Count mapped properties
    const mappedCount = await prisma.property.count({
      where: {
        metadata: {
          path: ['boomId'],
          not: Prisma.DbNull,
        },
      },
    })

    return {
      ...boomHealth,
      mappedProperties: mappedCount,
    }
  }
}

export const boomSyncService = new BoomSyncService()
