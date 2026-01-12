/**
 * PUBLIC QUOTE API - STATE OF THE ART
 *
 * Generate pricing quote using REAL Boom PMS pricing.
 * Source of truth: Boom's days_rates for accurate pricing.
 * No authentication required - this is called by public websites.
 *
 * Pricing Flow:
 * 1. Check property → Boom ID mapping
 * 2. Fetch real pricing from Boom days_rates
 * 3. Fall back to Hostly DB if Boom unavailable
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/client'
import { bookingService } from '@/lib/services/booking.service'
import { boomSyncService } from '@/lib/services/boom-sync.service'
import { ids } from '@/lib/utils/id'
import { addDays, differenceInDays, parseISO } from 'date-fns'

const QuoteSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string(), // ISO date string
  checkOut: z.string(), // ISO date string
  adults: z.number().int().positive(),
  children: z.number().int().min(0).default(0),
  promoCode: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  try {
    const { org } = await params

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

    const body = await request.json()
    const validation = QuoteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.message } },
        { status: 400 }
      )
    }

    const { propertyId, checkIn, checkOut, adults, children, promoCode } = validation.data

    // Verify property belongs to this org and is published
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId: organization.id,
        status: 'active',
      },
    })

    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      )
    }

    // ════════════════════════════════════════════════════════════════════════════
    // STATE OF THE ART: Try Boom pricing first (source of truth)
    // ════════════════════════════════════════════════════════════════════════════
    const boomId = (property.metadata as any)?.boomId as number | undefined
    const totalGuests = adults + children
    const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn))

    // Validate guest capacity
    if (property.maxGuests && totalGuests > property.maxGuests) {
      return NextResponse.json(
        { success: false, error: { code: 'GUEST_LIMIT', message: `Maximum ${property.maxGuests} guests allowed` } },
        { status: 400 }
      )
    }

    // Validate minimum nights
    if (property.minNights && nights < property.minNights) {
      return NextResponse.json(
        { success: false, error: { code: 'MIN_NIGHTS', message: `Minimum stay is ${property.minNights} nights` } },
        { status: 400 }
      )
    }

    if (boomId) {
      console.log(`[Quote] Using Boom pricing for property ${property.name} (Boom ID: ${boomId})`)

      const boomPricing = await boomSyncService.calculatePricingFromBoom(
        boomId,
        checkIn,
        checkOut,
        totalGuests
      )

      if (boomPricing) {
        // Check availability
        if (!boomPricing.available) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'NOT_AVAILABLE',
                message: 'Selected dates are not available',
                blockedDates: boomPricing.blockedDates,
              }
            },
            { status: 400 }
          )
        }

        // Apply discounts
        const discounts: Array<{ type: string; description: string; amount: number }> = []

        // Weekly discount (7+ nights = 10% off)
        if (nights >= 7) {
          const weeklyDiscount = Math.round(boomPricing.accommodationTotal * 0.1)
          discounts.push({
            type: 'weekly',
            description: 'Weekly stay discount (10%)',
            amount: weeklyDiscount,
          })
        }

        // Monthly discount (28+ nights = 20% off)
        if (nights >= 28) {
          const monthlyDiscount = Math.round(boomPricing.accommodationTotal * 0.2)
          discounts.push({
            type: 'monthly',
            description: 'Monthly stay discount (20%)',
            amount: monthlyDiscount,
          })
        }

        // Promo code discount
        if (promoCode) {
          const promoDiscount = Math.round(boomPricing.accommodationTotal * 0.05)
          discounts.push({
            type: 'promo',
            description: `Promo code: ${promoCode}`,
            amount: promoDiscount,
          })
        }

        const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0)

        // Recalculate totals with discounts
        const accommodationAfterDiscount = boomPricing.accommodationTotal - discountTotal
        const subtotal = accommodationAfterDiscount + boomPricing.cleaningFee + boomPricing.serviceFee
        const taxes = Math.round(subtotal * 0.17) // 17% VAT
        const grandTotal = subtotal + taxes

        // Create quote record
        const quote = await prisma.quote.create({
          data: {
            id: ids.quote(),
            organizationId: organization.id,
            propertyId,
            checkIn: parseISO(checkIn),
            checkOut: parseISO(checkOut),
            adults,
            children,
            currency: boomPricing.currency,
            nightlyRates: boomPricing.nightlyRates,
            accommodation: boomPricing.accommodationTotal,
            cleaningFee: boomPricing.cleaningFee,
            serviceFee: boomPricing.serviceFee,
            taxes,
            discounts,
            total: grandTotal,
            expiresAt: addDays(new Date(), 1),
          },
        })

        return NextResponse.json({
          success: true,
          data: {
            id: quote.id,
            propertyId: property.id,
            propertyName: property.name,
            checkIn,
            checkOut,
            nights: boomPricing.nights,
            guests: { adults, children, total: totalGuests },
            pricing: {
              currency: boomPricing.currency,
              nightlyRates: boomPricing.nightlyRates.map(r => ({
                date: r.date,
                price: r.price,
                minNights: r.minNights,
              })),
              accommodationTotal: boomPricing.accommodationTotal,
              cleaningFee: boomPricing.cleaningFee,
              serviceFee: boomPricing.serviceFee,
              taxes,
              discounts,
              discountTotal,
              grandTotal,
              averageNightlyRate: boomPricing.averageNightlyRate,
            },
            source: 'boom', // Indicates real Boom pricing
            expiresAt: quote.expiresAt.toISOString(),
          },
        })
      }

      console.log(`[Quote] Boom pricing failed for ${property.name}, falling back to Hostly`)
    }

    // ════════════════════════════════════════════════════════════════════════════
    // FALLBACK: Use Hostly internal pricing if Boom unavailable
    // Convert to agorot (smallest currency unit) for frontend compatibility
    // ════════════════════════════════════════════════════════════════════════════
    console.log(`[Quote] Using Hostly fallback pricing for ${property.name}`)

    const quote = await bookingService.generateQuote(organization.id, {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      promoCode,
    })

    // bookingService.generateQuote returns values already in agorot (property.basePrice is in agorot)
    return NextResponse.json({
      success: true,
      data: {
        ...quote,
        pricing: {
          ...quote.pricing,
          // Values are already in agorot, no conversion needed
        },
        source: 'hostly', // Indicates fallback pricing
      },
    })
  } catch (error) {
    console.error('Quote generation error:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('not available') || error.message.includes('not active')) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_AVAILABLE', message: error.message } },
          { status: 400 }
        )
      }
      if (error.message.includes('guests')) {
        return NextResponse.json(
          { success: false, error: { code: 'GUEST_LIMIT', message: error.message } },
          { status: 400 }
        )
      }
      if (error.message.includes('Minimum') || error.message.includes('nights')) {
        return NextResponse.json(
          { success: false, error: { code: 'MIN_NIGHTS', message: error.message } },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate quote' } },
      { status: 500 }
    )
  }
}
