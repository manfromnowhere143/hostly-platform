/**
 * PUBLIC PROPERTY DETAIL API - STATE OF THE ART
 *
 * Get details of a specific property including availability calendar.
 * Uses REAL Boom PMS pricing from days_rates for accurate calendar prices.
 * No authentication required - this is called by public websites.
 *
 * Pricing Source:
 * 1. Boom days_rates (source of truth)
 * 2. Hostly DB fallback if Boom unavailable
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/client'
import { addDays, startOfDay, format } from 'date-fns'
import { boomSyncService, BoomDayRate } from '@/lib/services/boom-sync.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; propertySlug: string }> }
) {
  try {
    const { org, propertySlug } = await params

    // Find organization by slug
    const organization = await prisma.organization.findUnique({
      where: { slug: org },
    })

    if (!organization) {
      return NextResponse.json(
        { success: false, error: { code: 'ORG_NOT_FOUND', message: 'Organization not found' } },
        { status: 404 }
      )
    }

    // Get property with all details (include metadata for Boom ID)
    const property = await prisma.property.findFirst({
      where: {
        organizationId: organization.id,
        slug: propertySlug,
        status: 'active',
      },
      include: {
        photos: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      )
    }

    // Get calendar for next 90 days
    const today = startOfDay(new Date())
    const endDate = addDays(today, 90)

    const calendarDays = await prisma.calendarDay.findMany({
      where: {
        propertyId: property.id,
        date: {
          gte: today,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Get blocked dates from existing reservations
    const reservations = await prisma.reservation.findMany({
      where: {
        propertyId: property.id,
        status: { in: ['pending', 'confirmed'] },
        checkOut: { gte: today },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
    })

    // Build availability map from Hostly reservations
    const blockedDates = new Set<string>()
    for (const res of reservations) {
      let current = startOfDay(res.checkIn)
      while (current < res.checkOut) {
        blockedDates.add(format(current, 'yyyy-MM-dd'))
        current = addDays(current, 1)
      }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // STATE OF THE ART: Get pricing from Boom days_rates (source of truth)
    // ════════════════════════════════════════════════════════════════════════════
    const boomId = (property.metadata as any)?.boomId as number | undefined
    let boomDaysRates: Record<string, BoomDayRate> | null = null
    let pricingSource: 'boom' | 'hostly' = 'hostly'

    if (boomId) {
      try {
        const listing = await boomSyncService.getListingWithPricing(boomId)
        if (listing) {
          boomDaysRates = (listing as any).days_rates || null
          if (boomDaysRates) {
            pricingSource = 'boom'
            console.log(`[Property Detail] Using Boom pricing for ${property.name}`)
          }
        }
      } catch (e) {
        console.warn(`[Property Detail] Boom pricing failed for ${property.name}:`, e)
      }
    }

    // Build calendar with pricing
    const calendar: Array<{
      date: string
      available: boolean
      price?: number
      minNights?: number
      source?: string
    }> = []

    for (let i = 0; i < 90; i++) {
      const date = addDays(today, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const calendarDay = calendarDays.find(
        (cd) => format(cd.date, 'yyyy-MM-dd') === dateStr
      )

      // Check Boom availability first, then Hostly
      let isBlocked = blockedDates.has(dateStr) || calendarDay?.status === 'blocked'
      let price = property.basePrice
      let minNights = property.minNights

      // Use Boom data if available (convert to agorot for frontend)
      if (boomDaysRates && boomDaysRates[dateStr]) {
        const boomDay = boomDaysRates[dateStr]
        // Boom returns shekels, multiply by 100 for agorot
        price = (boomDay.price || property.basePrice) * 100
        minNights = boomDay.minNights || property.minNights

        // Boom says unavailable - override Hostly
        if (boomDay.status !== 'available') {
          isBlocked = true
        }
      } else {
        // Fallback to Hostly pricing (also convert to agorot)
        const isWeekend = date.getDay() === 5 || date.getDay() === 6
        if (calendarDay?.price) {
          price = calendarDay.price * 100
        } else if (isWeekend) {
          price = Math.round(property.basePrice * 1.2) * 100
        } else {
          price = property.basePrice * 100
        }
      }

      calendar.push({
        date: dateStr,
        available: !isBlocked,
        price: isBlocked ? undefined : price,
        minNights,
      })
    }

    // Transform amenities
    const amenities = property.amenities.map((a) => ({
      id: a.amenity.id,
      name: a.amenity.name,
      icon: a.amenity.icon,
      category: a.amenity.category,
    }))

    return NextResponse.json({
      success: true,
      data: {
        property: {
          id: property.id,
          slug: property.slug,
          name: property.name,
          description: property.description,
          type: property.type,
          address: property.address,
          coordinates: property.coordinates,
          bedrooms: property.bedrooms,
          beds: property.beds,
          bathrooms: property.bathrooms,
          maxGuests: property.maxGuests,
          photos: property.photos,
          amenities,
          basePrice: property.basePrice,
          cleaningFee: property.cleaningFee,
          currency: property.currency,
          minNights: property.minNights,
          maxNights: property.maxNights,
          checkInTime: property.checkInTime,
          checkOutTime: property.checkOutTime,
        },
        calendar,
        pricingSource, // 'boom' = real Boom PMS pricing, 'hostly' = fallback
      },
    })
  } catch (error) {
    console.error('Property detail error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get property details' } },
      { status: 500 }
    )
  }
}
