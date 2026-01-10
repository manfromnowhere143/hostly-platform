/**
 * PUBLIC QUOTE API
 *
 * Generate pricing quote for a stay
 * No authentication required - this is called by public websites
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/client'
import { bookingService } from '@/lib/services/booking.service'

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

    // Generate quote
    const quote = await bookingService.generateQuote(organization.id, {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      promoCode,
    })

    return NextResponse.json({
      success: true,
      data: quote,
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
