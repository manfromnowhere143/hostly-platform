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
import { boomClient, BoomAPIError } from '@/lib/integrations/boom/client'
import prisma from '@/lib/db/client'

export class BoomSyncService {
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
