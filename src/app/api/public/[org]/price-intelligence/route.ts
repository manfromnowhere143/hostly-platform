/**
 * PRICE INTELLIGENCE API - STATE OF THE ART
 *
 * Airbnb-level pricing intelligence powered by Boom days_rates.
 * Provides smart insights, flexible date suggestions, and value optimization.
 *
 * Features:
 * - Price trend analysis (cheaper/expensive than average)
 * - Flexible date suggestions (+/- 7 days with savings)
 * - Scarcity indicators (booking pressure, availability %)
 * - Best value finder (optimal date combinations)
 * - Price calendar heatmap data
 * - Smart recommendations
 *
 * No authentication required - public API for booking websites.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/client'
import { boomSyncService, BoomDayRate } from '@/lib/services/boom-sync.service'
import { addDays, differenceInDays, format, parseISO, startOfDay, eachDayOfInterval, isWeekend } from 'date-fns'

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface PricePoint {
  date: string
  price: number // in agorot
  available: boolean
  minNights: number
  isWeekend: boolean
  priceLevel: 'low' | 'medium' | 'high' | 'peak'
  percentile: number // 0-100, where price falls in distribution
}

interface DateAlternative {
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  averageNightly: number
  savings: number // compared to requested dates
  savingsPercent: number
  availability: 'full' | 'partial' | 'unavailable'
  badge?: 'best_value' | 'cheapest' | 'most_flexible' | 'recommended'
}

interface ScarcityMetrics {
  availabilityPercent: number // % of next 30 days available
  bookedWeekends: number // count of booked weekends in next 60 days
  totalWeekends: number
  bookingPressure: 'low' | 'medium' | 'high' | 'very_high'
  urgencyMessage?: string
  daysUntilNextAvailable?: number
}

interface PriceInsight {
  type: 'trend' | 'tip' | 'alert' | 'recommendation'
  icon: string
  title: string
  description: string
  impact?: string // e.g., "Save ₪200"
  priority: number // 1-10, for sorting
}

// ════════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ════════════════════════════════════════════════════════════════════════════════

const QuerySchema = z.object({
  propertyId: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.coerce.number().int().positive().default(2),
  flexDays: z.coerce.number().int().min(0).max(14).default(3),
})

// ════════════════════════════════════════════════════════════════════════════════
// INTELLIGENCE ALGORITHMS
// ════════════════════════════════════════════════════════════════════════════════

function calculatePricePercentile(price: number, allPrices: number[]): number {
  const sorted = [...allPrices].sort((a, b) => a - b)
  const index = sorted.findIndex(p => p >= price)
  return Math.round((index / sorted.length) * 100)
}

function getPriceLevel(percentile: number): 'low' | 'medium' | 'high' | 'peak' {
  if (percentile <= 25) return 'low'
  if (percentile <= 50) return 'medium'
  if (percentile <= 75) return 'high'
  return 'peak'
}

function calculateScarcity(
  calendar: Array<{ date: string; available: boolean; isWeekend: boolean }>
): ScarcityMetrics {
  const next30Days = calendar.slice(0, 30)
  const next60Days = calendar.slice(0, 60)

  const availableDays = next30Days.filter(d => d.available).length
  const availabilityPercent = Math.round((availableDays / 30) * 100)

  const weekends = next60Days.filter(d => d.isWeekend)
  const bookedWeekends = weekends.filter(d => !d.available).length
  const totalWeekends = Math.ceil(weekends.length / 2) // pairs of days

  let bookingPressure: ScarcityMetrics['bookingPressure'] = 'low'
  if (availabilityPercent < 30) bookingPressure = 'very_high'
  else if (availabilityPercent < 50) bookingPressure = 'high'
  else if (availabilityPercent < 70) bookingPressure = 'medium'

  let urgencyMessage: string | undefined
  if (bookingPressure === 'very_high') {
    urgencyMessage = `Only ${availableDays} nights available in the next month`
  } else if (bookedWeekends >= totalWeekends * 0.7) {
    const availableWeekends = Math.floor(totalWeekends - bookedWeekends / 2)
    urgencyMessage = `Only ${availableWeekends} weekend${availableWeekends !== 1 ? 's' : ''} left in the next 2 months`
  }

  // Find days until next available
  const firstUnavailableIndex = calendar.findIndex(d => !d.available)
  const daysUntilNextAvailable = firstUnavailableIndex === -1
    ? undefined
    : calendar.slice(firstUnavailableIndex).findIndex(d => d.available)

  return {
    availabilityPercent,
    bookedWeekends: Math.floor(bookedWeekends / 2),
    totalWeekends,
    bookingPressure,
    urgencyMessage,
    daysUntilNextAvailable: daysUntilNextAvailable === -1 ? undefined : daysUntilNextAvailable,
  }
}

function generateInsights(
  pricePoints: PricePoint[],
  scarcity: ScarcityMetrics,
  requestedDates?: { checkIn: string; checkOut: string; totalPrice: number },
  alternatives?: DateAlternative[]
): PriceInsight[] {
  const insights: PriceInsight[] = []

  // Price trend insight
  const avgPrice = pricePoints.reduce((sum, p) => sum + p.price, 0) / pricePoints.length
  const recentAvg = pricePoints.slice(0, 14).reduce((sum, p) => sum + p.price, 0) / 14
  const priceTrend = ((recentAvg - avgPrice) / avgPrice) * 100

  if (priceTrend < -10) {
    insights.push({
      type: 'trend',
      icon: '📉',
      title: 'Prices are lower than usual',
      description: `Current prices are ${Math.abs(Math.round(priceTrend))}% below the 90-day average`,
      priority: 8,
    })
  } else if (priceTrend > 15) {
    insights.push({
      type: 'trend',
      icon: '📈',
      title: 'Peak season pricing',
      description: `Prices are ${Math.round(priceTrend)}% above average - consider flexible dates`,
      priority: 7,
    })
  }

  // Scarcity insight
  if (scarcity.urgencyMessage) {
    insights.push({
      type: 'alert',
      icon: '🔥',
      title: 'High demand',
      description: scarcity.urgencyMessage,
      priority: 9,
    })
  }

  // Best value recommendation
  if (alternatives && alternatives.length > 0) {
    const bestValue = alternatives.find(a => a.badge === 'best_value' || a.badge === 'cheapest')
    if (bestValue && bestValue.savings > 0) {
      insights.push({
        type: 'recommendation',
        icon: '💡',
        title: 'Better dates available',
        description: `Shift to ${format(parseISO(bestValue.checkIn), 'MMM d')} - ${format(parseISO(bestValue.checkOut), 'MMM d')}`,
        impact: `Save ₪${Math.round(bestValue.savings / 100)}`,
        priority: 10,
      })
    }
  }

  // Weekend vs weekday tip
  const weekdayPrices = pricePoints.filter(p => !p.isWeekend && p.available).map(p => p.price)
  const weekendPrices = pricePoints.filter(p => p.isWeekend && p.available).map(p => p.price)

  if (weekdayPrices.length > 0 && weekendPrices.length > 0) {
    const avgWeekday = weekdayPrices.reduce((a, b) => a + b, 0) / weekdayPrices.length
    const avgWeekend = weekendPrices.reduce((a, b) => a + b, 0) / weekendPrices.length
    const weekendPremium = ((avgWeekend - avgWeekday) / avgWeekday) * 100

    if (weekendPremium > 20) {
      insights.push({
        type: 'tip',
        icon: '💰',
        title: 'Weekday savings',
        description: `Weekdays are ${Math.round(weekendPremium)}% cheaper than weekends`,
        priority: 6,
      })
    }
  }

  // Minimum nights tip
  const highMinNights = pricePoints.filter(p => p.minNights >= 3 && p.available)
  if (highMinNights.length > pricePoints.length * 0.3) {
    const avgMinNights = Math.round(highMinNights.reduce((sum, p) => sum + p.minNights, 0) / highMinNights.length)
    insights.push({
      type: 'tip',
      icon: '📅',
      title: 'Minimum stay requirement',
      description: `Most dates require at least ${avgMinNights} nights`,
      priority: 5,
    })
  }

  // Sort by priority
  return insights.sort((a, b) => b.priority - a.priority)
}

function findDateAlternatives(
  pricePoints: PricePoint[],
  requestedCheckIn: string,
  requestedCheckOut: string,
  requestedTotal: number,
  flexDays: number
): DateAlternative[] {
  const alternatives: DateAlternative[] = []
  const nights = differenceInDays(parseISO(requestedCheckOut), parseISO(requestedCheckIn))

  // Generate all possible date combinations within flex range
  for (let startOffset = -flexDays; startOffset <= flexDays; startOffset++) {
    const altCheckIn = addDays(parseISO(requestedCheckIn), startOffset)
    const altCheckOut = addDays(altCheckIn, nights)

    // Skip if same as requested
    if (startOffset === 0) continue

    // Skip if check-in is in the past
    if (altCheckIn < startOfDay(new Date())) continue

    const checkInStr = format(altCheckIn, 'yyyy-MM-dd')
    const checkOutStr = format(altCheckOut, 'yyyy-MM-dd')

    // Get prices for this range
    const rangePrices = pricePoints.filter(p =>
      p.date >= checkInStr && p.date < checkOutStr
    )

    if (rangePrices.length !== nights) continue // Not enough data

    const allAvailable = rangePrices.every(p => p.available)
    const someAvailable = rangePrices.some(p => p.available)

    const totalPrice = rangePrices.reduce((sum, p) => sum + p.price, 0)
    const savings = requestedTotal - totalPrice
    const savingsPercent = Math.round((savings / requestedTotal) * 100)

    alternatives.push({
      checkIn: checkInStr,
      checkOut: checkOutStr,
      nights,
      totalPrice,
      averageNightly: Math.round(totalPrice / nights),
      savings,
      savingsPercent,
      availability: allAvailable ? 'full' : (someAvailable ? 'partial' : 'unavailable'),
    })
  }

  // Sort by savings (best first)
  alternatives.sort((a, b) => b.savings - a.savings)

  // Assign badges
  const available = alternatives.filter(a => a.availability === 'full')
  if (available.length > 0) {
    // Best value = most savings that's fully available
    const bestValue = available[0]
    if (bestValue.savings > 0) {
      bestValue.badge = 'best_value'
    }

    // Cheapest overall
    const cheapest = [...available].sort((a, b) => a.totalPrice - b.totalPrice)[0]
    if (cheapest && cheapest !== bestValue) {
      cheapest.badge = 'cheapest'
    }
  }

  return alternatives.slice(0, 10) // Return top 10
}

// ════════════════════════════════════════════════════════════════════════════════
// API HANDLER
// ════════════════════════════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  try {
    const { org } = await params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)

    const validation = QuerySchema.safeParse(searchParams)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.message } },
        { status: 400 }
      )
    }

    const { propertyId, checkIn, checkOut, guests, flexDays } = validation.data

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

    // Get property (or all properties if not specified)
    const properties = await prisma.property.findMany({
      where: {
        organizationId: organization.id,
        status: 'active',
        ...(propertyId ? { id: propertyId } : {}),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        metadata: true,
        basePrice: true,
        minNights: true,
      },
    })

    if (properties.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_PROPERTIES', message: 'No properties found' } },
        { status: 404 }
      )
    }

    // For now, use first property (or specified one)
    const property = properties[0]
    const boomId = (property.metadata as any)?.boomId as number | undefined

    if (!boomId) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_PRICING', message: 'Property not connected to pricing system' } },
        { status: 400 }
      )
    }

    // Fetch Boom listing with days_rates
    const listing = await boomSyncService.getListingWithPricing(boomId)

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'PRICING_UNAVAILABLE', message: 'Could not fetch pricing data' } },
        { status: 503 }
      )
    }

    const daysRates = (listing as any).days_rates as Record<string, BoomDayRate> | undefined

    if (!daysRates) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_RATES', message: 'No pricing data available' } },
        { status: 503 }
      )
    }

    // Build price points for next 90 days
    const today = startOfDay(new Date())
    const allPrices: number[] = []
    const pricePoints: PricePoint[] = []

    for (let i = 0; i < 90; i++) {
      const date = addDays(today, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayRate = daysRates[dateStr]

      if (dayRate) {
        const priceInAgorot = (dayRate.price || property.basePrice) * 100
        allPrices.push(priceInAgorot)

        pricePoints.push({
          date: dateStr,
          price: priceInAgorot,
          available: dayRate.status === 'available',
          minNights: dayRate.minNights || property.minNights || 1,
          isWeekend: isWeekend(date),
          priceLevel: 'medium', // Will be calculated after
          percentile: 0, // Will be calculated after
        })
      }
    }

    // Calculate percentiles and price levels
    for (const point of pricePoints) {
      point.percentile = calculatePricePercentile(point.price, allPrices)
      point.priceLevel = getPriceLevel(point.percentile)
    }

    // Calculate scarcity metrics
    const scarcity = calculateScarcity(pricePoints)

    // Calculate requested dates pricing and alternatives
    let requestedPricing: { totalPrice: number; nights: number } | undefined
    let alternatives: DateAlternative[] = []

    if (checkIn && checkOut) {
      const requestedNights = differenceInDays(parseISO(checkOut), parseISO(checkIn))
      const requestedPrices = pricePoints.filter(p =>
        p.date >= checkIn && p.date < checkOut
      )

      if (requestedPrices.length === requestedNights) {
        const totalPrice = requestedPrices.reduce((sum, p) => sum + p.price, 0)
        requestedPricing = { totalPrice, nights: requestedNights }

        // Find alternatives
        alternatives = findDateAlternatives(
          pricePoints,
          checkIn,
          checkOut,
          totalPrice,
          flexDays
        )
      }
    }

    // Generate insights
    const insights = generateInsights(
      pricePoints,
      scarcity,
      requestedPricing ? { checkIn: checkIn!, checkOut: checkOut!, totalPrice: requestedPricing.totalPrice } : undefined,
      alternatives
    )

    // Calculate price statistics
    const availablePrices = pricePoints.filter(p => p.available).map(p => p.price)
    const priceStats = availablePrices.length > 0 ? {
      min: Math.min(...availablePrices),
      max: Math.max(...availablePrices),
      average: Math.round(availablePrices.reduce((a, b) => a + b, 0) / availablePrices.length),
      median: availablePrices.sort((a, b) => a - b)[Math.floor(availablePrices.length / 2)],
    } : null

    return NextResponse.json({
      success: true,
      data: {
        property: {
          id: property.id,
          slug: property.slug,
          name: property.name,
        },

        // Price calendar data (for heatmap)
        calendar: pricePoints.map(p => ({
          date: p.date,
          price: p.price,
          available: p.available,
          minNights: p.minNights,
          priceLevel: p.priceLevel,
          isWeekend: p.isWeekend,
        })),

        // Price statistics
        priceStats,

        // Scarcity & urgency
        scarcity,

        // Smart insights
        insights,

        // Requested dates analysis (if provided)
        ...(requestedPricing && {
          requestedDates: {
            checkIn,
            checkOut,
            nights: requestedPricing.nights,
            totalPrice: requestedPricing.totalPrice,
            averageNightly: Math.round(requestedPricing.totalPrice / requestedPricing.nights),
          },
        }),

        // Flexible date alternatives
        alternatives: alternatives.filter(a => a.availability === 'full'),

        // Metadata
        currency: 'ILS',
        generatedAt: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('[Price Intelligence] Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate price intelligence' } },
      { status: 500 }
    )
  }
}
