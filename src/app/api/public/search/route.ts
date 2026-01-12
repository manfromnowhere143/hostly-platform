/**
 * MARKETPLACE SEARCH API - Multi-Organization Property Search
 *
 * Aggregates available properties across ALL organizations.
 * Uses REAL Boom PMS pricing from days_rates for accurate prices.
 *
 * Query params:
 * - checkIn: YYYY-MM-DD (required)
 * - checkOut: YYYY-MM-DD (required)
 * - adults: number (default: 2)
 * - children: number (default: 0)
 * - location: string (optional, future: filter by location)
 *
 * Architecture Notes:
 * - Scalable: Parallel queries to all organizations
 * - Multi-tenancy: Each org's data is queried independently
 * - Boom Integration: Real pricing from PMS for each property
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/client'
import { boomSyncService } from '@/lib/services/boom-sync.service'
import { bookingService } from '@/lib/services/booking.service'
import { getImagesByBoomId, getImagesByName } from '@/lib/utils/curated-images'

interface PropertyResult {
  id: string
  slug: string
  name: string
  organizationSlug: string
  organizationName: string
  location: string | null
  type: string
  bedrooms: number | null
  beds: number | null
  bathrooms: number | null
  maxGuests: number | null
  photos: Array<{
    id: string
    url: string
    thumbnailUrl: string | null
    caption: string | null
    isPrimary: boolean
  }>
  pricing: {
    nights: number
    accommodation: number
    cleaningFee: number
    serviceFee: number
    taxes: number
    total: number
    currency: string
    averageNightlyRate: number
    source: 'boom' | 'hostly'
  } | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const adults = parseInt(searchParams.get('adults') || '2')
    const children = parseInt(searchParams.get('children') || '0')
    // Future: const location = searchParams.get('location')

    // Validate required params
    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_DATES', message: 'checkIn and checkOut are required' } },
        { status: 400 }
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

    // Generate array of dates to check
    const datesToCheck: Date[] = []
    for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
      datesToCheck.push(new Date(d))
    }
    const nights = datesToCheck.length

    // ═══════════════════════════════════════════════════════════════════════════
    // SCALABLE: Get ALL active organizations
    // Future: Can add filtering by location, category, etc.
    // ═══════════════════════════════════════════════════════════════════════════
    const organizations = await prisma.organization.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    })

    console.log(`[Search] Searching across ${organizations.length} organizations`)

    // ═══════════════════════════════════════════════════════════════════════════
    // PARALLEL: Query all organizations simultaneously for maximum performance
    // ═══════════════════════════════════════════════════════════════════════════
    const allResults: PropertyResult[] = []

    await Promise.all(
      organizations.map(async (org) => {
        try {
          // Get all active properties for this org
          const properties = await prisma.property.findMany({
            where: {
              organizationId: org.id,
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
              metadata: true,
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

          // Get blocked calendar days for this org
          const blockedCalendar = await prisma.calendarDay.findMany({
            where: {
              organizationId: org.id,
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
            },
          })

          const blockedPropertyIds = new Set(blockedCalendar.map(b => b.propertyId))

          // Get overlapping reservations
          const overlappingReservations = await prisma.reservation.findMany({
            where: {
              organizationId: org.id,
              status: { in: ['confirmed', 'pending'] },
              AND: [
                { checkIn: { lt: checkOutDate } },
                { checkOut: { gt: checkInDate } },
              ],
            },
            select: { propertyId: true },
          })

          for (const res of overlappingReservations) {
            blockedPropertyIds.add(res.propertyId)
          }

          // Filter to available properties
          const availableProperties = properties.filter(property => {
            if (blockedPropertyIds.has(property.id)) return false

            const totalGuests = adults + children
            if (property.maxGuests && totalGuests > property.maxGuests) return false

            if (property.minNights && nights < property.minNights) return false

            return true
          })

          // Calculate pricing for each available property
          await Promise.all(
            availableProperties.map(async (property) => {
              try {
                const boomId = (property as any).metadata?.boomId as number | undefined
                let pricing = null

                // Try Boom pricing first
                if (boomId) {
                  const boomPricing = await boomSyncService.calculatePricingFromBoom(
                    boomId,
                    checkIn,
                    checkOut,
                    adults + children
                  )

                  if (boomPricing && boomPricing.available) {
                    pricing = {
                      nights: boomPricing.nights,
                      accommodation: boomPricing.accommodationTotal,
                      cleaningFee: boomPricing.cleaningFee,
                      serviceFee: boomPricing.serviceFee,
                      taxes: boomPricing.taxes,
                      total: boomPricing.grandTotal,
                      currency: boomPricing.currency,
                      averageNightlyRate: boomPricing.averageNightlyRate,
                      source: 'boom' as const,
                    }
                  } else if (boomPricing && !boomPricing.available) {
                    // Boom says unavailable - skip this property
                    return
                  }
                }

                // Fallback to Hostly pricing if no Boom pricing
                if (!pricing) {
                  const quote = await bookingService.generateQuote(org.id, {
                    propertyId: property.id,
                    checkIn,
                    checkOut,
                    adults,
                    children,
                  })

                  pricing = {
                    nights: quote.nights,
                    accommodation: quote.pricing.accommodationTotal,
                    cleaningFee: quote.pricing.cleaningFee,
                    serviceFee: quote.pricing.serviceFee,
                    taxes: quote.pricing.taxes,
                    total: quote.pricing.grandTotal,
                    currency: quote.pricing.currency,
                    averageNightlyRate: Math.round(quote.pricing.accommodationTotal / quote.nights),
                    source: 'hostly' as const,
                  }
                }

                // Get curated images if available (preferred over database photos)
                let photos = property.photos.map(p => ({
                  id: p.id,
                  url: p.url,
                  thumbnailUrl: p.thumbnailUrl,
                  caption: p.caption,
                  isPrimary: p.isPrimary,
                }))

                // Try to get curated images from our mapping
                if (boomId) {
                  const curatedImages = getImagesByBoomId(boomId)
                  if (curatedImages.length > 0) {
                    photos = curatedImages.map((url, idx) => ({
                      id: `curated-${idx}`,
                      url,
                      thumbnailUrl: null,
                      caption: null,
                      isPrimary: idx === 0,
                    }))
                  }
                }

                // Fallback: try to match by name if no boomId images
                if (photos.length === 0 || !photos[0].url.startsWith('/')) {
                  const nameImages = getImagesByName(property.name)
                  if (nameImages.length > 0) {
                    photos = nameImages.map((url, idx) => ({
                      id: `name-${idx}`,
                      url,
                      thumbnailUrl: null,
                      caption: null,
                      isPrimary: idx === 0,
                    }))
                  }
                }

                allResults.push({
                  id: property.id,
                  slug: property.slug,
                  name: property.name,
                  organizationSlug: org.slug,
                  organizationName: org.name,
                  location: typeof property.address === 'string' ? property.address : null,
                  type: property.type,
                  bedrooms: property.bedrooms,
                  beds: property.beds,
                  bathrooms: property.bathrooms,
                  maxGuests: property.maxGuests,
                  photos,
                  pricing,
                })
              } catch (error) {
                console.warn(`[Search] Pricing failed for ${property.name}:`, error)

                // Get curated images even for error case
                const boomIdFallback = (property as any).metadata?.boomId as number | undefined
                let fallbackPhotos = property.photos.map(p => ({
                  id: p.id,
                  url: p.url,
                  thumbnailUrl: p.thumbnailUrl,
                  caption: p.caption,
                  isPrimary: p.isPrimary,
                }))

                if (boomIdFallback) {
                  const curatedImages = getImagesByBoomId(boomIdFallback)
                  if (curatedImages.length > 0) {
                    fallbackPhotos = curatedImages.map((url, idx) => ({
                      id: `curated-${idx}`,
                      url,
                      thumbnailUrl: null,
                      caption: null,
                      isPrimary: idx === 0,
                    }))
                  }
                }

                // Still include property but without pricing
                allResults.push({
                  id: property.id,
                  slug: property.slug,
                  name: property.name,
                  organizationSlug: org.slug,
                  organizationName: org.name,
                  location: typeof property.address === 'string' ? property.address : null,
                  type: property.type,
                  bedrooms: property.bedrooms,
                  beds: property.beds,
                  bathrooms: property.bathrooms,
                  maxGuests: property.maxGuests,
                  photos: fallbackPhotos,
                  pricing: null,
                })
              }
            })
          )
        } catch (error) {
          console.error(`[Search] Error querying org ${org.slug}:`, error)
          // Continue with other orgs
        }
      })
    )

    // Sort results by price (lowest first), then by those without pricing at the end
    allResults.sort((a, b) => {
      if (!a.pricing && !b.pricing) return 0
      if (!a.pricing) return 1
      if (!b.pricing) return -1
      return a.pricing.total - b.pricing.total
    })

    console.log(`[Search] Found ${allResults.length} available properties`)

    return NextResponse.json({
      success: true,
      data: {
        checkIn,
        checkOut,
        nights,
        guests: { adults, children },
        available: allResults.length,
        results: allResults,
      },
    })

  } catch (error) {
    console.error('[Search] Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Search failed' } },
      { status: 500 }
    )
  }
}
