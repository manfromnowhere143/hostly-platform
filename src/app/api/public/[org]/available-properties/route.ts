/**
 * AVAILABLE PROPERTIES API - STATE OF THE ART
 *
 * Returns only properties that are AVAILABLE for the specified date range.
 * Uses REAL Boom PMS pricing from days_rates for accurate prices.
 *
 * Query params:
 * - checkIn: YYYY-MM-DD
 * - checkOut: YYYY-MM-DD
 * - adults: number
 * - children: number (optional)
 *
 * Pricing Source:
 * 1. Boom days_rates (source of truth)
 * 2. Hostly DB fallback if Boom unavailable
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/client'
import { bookingService } from '@/lib/services/booking.service'
import { boomSyncService } from '@/lib/services/boom-sync.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  try {
    const { org } = await params
    const searchParams = request.nextUrl.searchParams

    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const adults = parseInt(searchParams.get('adults') || '2')
    const children = parseInt(searchParams.get('children') || '0')

    // Validate required params
    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_DATES', message: 'checkIn and checkOut are required' } },
        { status: 400 }
      )
    }

    // Find organization
    const organization = await prisma.organization.findUnique({
      where: { slug: org },
    })

    if (!organization) {
      return NextResponse.json(
        { success: false, error: { code: 'ORG_NOT_FOUND', message: 'Organization not found' } },
        { status: 404 }
      )
    }

    // Parse dates
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Validate dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DATES', message: 'Check-in date cannot be in the past' } },
        { status: 400 }
      )
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DATES', message: 'Check-out must be after check-in' } },
        { status: 400 }
      )
    }

    // Get all active properties (include metadata for Boom ID mapping)
    const allProperties = await prisma.property.findMany({
      where: {
        organizationId: organization.id,
        status: 'active',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        type: true,
        address: true,
        bedrooms: true,
        beds: true,
        bathrooms: true,
        maxGuests: true,
        basePrice: true,
        cleaningFee: true,
        currency: true,
        minNights: true,
        metadata: true, // For Boom ID mapping
        photos: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            caption: true,
            isPrimary: true,
            sortOrder: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
          take: 5,
        },
      },
    })

    // Generate array of dates to check
    const datesToCheck: Date[] = []
    for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
      datesToCheck.push(new Date(d))
    }

    const nights = datesToCheck.length

    // Get all calendar blocks for these properties and dates
    const blockedCalendar = await prisma.calendarDay.findMany({
      where: {
        organizationId: organization.id,
        date: {
          gte: checkInDate,
          lt: checkOutDate,
        },
        status: {
          in: ['booked', 'blocked'],
        },
      },
      select: {
        propertyId: true,
        date: true,
        status: true,
      },
    })

    // Create a set of blocked property IDs
    const blockedPropertyIds = new Set<string>()

    for (const block of blockedCalendar) {
      blockedPropertyIds.add(block.propertyId)
    }

    // Also check reservations directly (belt and suspenders)
    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        organizationId: organization.id,
        status: {
          in: ['confirmed', 'pending'],
        },
        // Reservation overlaps with requested dates
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
      select: {
        propertyId: true,
      },
    })

    for (const res of overlappingReservations) {
      blockedPropertyIds.add(res.propertyId)
    }

    // Filter to available properties
    const availableProperties = allProperties.filter(property => {
      // Check if property is blocked
      if (blockedPropertyIds.has(property.id)) {
        return false
      }

      // Check guest capacity
      const totalGuests = adults + children
      if (property.maxGuests && totalGuests > property.maxGuests) {
        return false
      }

      // Check minimum nights
      if (property.minNights && nights < property.minNights) {
        return false
      }

      return true
    })

    // ════════════════════════════════════════════════════════════════════════════
    // STATE OF THE ART: Calculate pricing using Boom days_rates (source of truth)
    // ════════════════════════════════════════════════════════════════════════════
    const propertiesWithPricing = await Promise.all(
      availableProperties.map(async (property) => {
        try {
          const boomId = (property as any).metadata?.boomId as number | undefined

          // Try Boom pricing first (source of truth)
          if (boomId) {
            const boomPricing = await boomSyncService.calculatePricingFromBoom(
              boomId,
              checkIn,
              checkOut,
              adults + children
            )

            if (boomPricing && boomPricing.available) {
              console.log(`[Available Properties] Boom pricing for ${property.name}: ₪${boomPricing.grandTotal}`)
              return {
                ...property,
                pricing: {
                  nights: boomPricing.nights,
                  accommodation: boomPricing.accommodationTotal,
                  cleaningFee: boomPricing.cleaningFee,
                  serviceFee: boomPricing.serviceFee,
                  taxes: boomPricing.taxes,
                  total: boomPricing.grandTotal,
                  currency: boomPricing.currency,
                  averageNightlyRate: boomPricing.averageNightlyRate,
                  source: 'boom',
                },
              }
            }

            // If Boom says unavailable, skip this property
            if (boomPricing && !boomPricing.available) {
              console.log(`[Available Properties] ${property.name} unavailable per Boom`)
              return null // Will be filtered out
            }
          }

          // Fallback to Hostly pricing (convert to agorot for frontend)
          const quote = await bookingService.generateQuote(organization.id, {
            propertyId: property.id,
            checkIn,
            checkOut,
            adults,
            children,
          })

          // bookingService.generateQuote returns values already in agorot
          return {
            ...property,
            pricing: {
              nights: quote.nights,
              accommodation: quote.pricing.accommodationTotal,
              cleaningFee: quote.pricing.cleaningFee,
              serviceFee: quote.pricing.serviceFee,
              taxes: quote.pricing.taxes,
              total: quote.pricing.grandTotal,
              currency: quote.pricing.currency,
              averageNightlyRate: Math.round(quote.pricing.accommodationTotal / quote.nights),
              source: 'hostly',
            },
          }
        } catch (error) {
          // If pricing fails, still include property but without pricing
          console.warn(`[Available Properties] Pricing failed for ${property.name}:`, error)
          return {
            ...property,
            pricing: null,
          }
        }
      })
    )

    // Filter out null entries (properties that Boom marked as unavailable)
    const finalProperties = propertiesWithPricing.filter(p => p !== null)

    return NextResponse.json({
      success: true,
      data: {
        checkIn,
        checkOut,
        nights,
        guests: { adults, children },
        available: finalProperties.length,
        total: allProperties.length,
        properties: finalProperties,
      },
    })

  } catch (error) {
    console.error('[Available Properties] Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get available properties' } },
      { status: 500 }
    )
  }
}
