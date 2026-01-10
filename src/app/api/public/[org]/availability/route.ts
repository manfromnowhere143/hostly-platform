/**
 * PUBLIC AVAILABILITY API
 *
 * Check property availability for date range
 * No authentication required - this is called by public websites
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/client'
import { bookingService } from '@/lib/services/booking.service'

const AvailabilitySchema = z.object({
  propertyId: z.string(),
  checkIn: z.string(), // ISO date string
  checkOut: z.string(), // ISO date string
  adults: z.number().int().positive().default(2),
  children: z.number().int().min(0).default(0),
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
    const validation = AvailabilitySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.message } },
        { status: 400 }
      )
    }

    const { propertyId, checkIn, checkOut, adults, children } = validation.data

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

    // Check availability
    const result = await bookingService.checkAvailability(organization.id, {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to check availability' } },
      { status: 500 }
    )
  }
}
