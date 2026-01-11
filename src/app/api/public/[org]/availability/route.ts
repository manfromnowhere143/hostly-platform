/**
 * PUBLIC AVAILABILITY API - STATE OF THE ART
 *
 * Check property availability for date range.
 * Uses REAL Boom PMS days_rates for accurate availability.
 * No authentication required - this is called by public websites.
 *
 * Availability Source:
 * 1. Boom days_rates (source of truth)
 * 2. Hostly DB fallback if Boom unavailable
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/client'
import { bookingService } from '@/lib/services/booking.service'
import { boomSyncService } from '@/lib/services/boom-sync.service'

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

    // ════════════════════════════════════════════════════════════════════════════
    // STATE OF THE ART: Check Boom availability first (source of truth)
    // ════════════════════════════════════════════════════════════════════════════
    const boomId = (property.metadata as any)?.boomId as number | undefined

    if (boomId) {
      console.log(`[Availability] Checking Boom for property ${property.name} (Boom ID: ${boomId})`)

      const boomAvailability = await boomSyncService.checkAvailabilityFromBoom(
        boomId,
        checkIn,
        checkOut
      )

      // If Boom says unavailable, return immediately
      if (!boomAvailability.available) {
        return NextResponse.json({
          success: true,
          data: {
            available: false,
            reason: boomAvailability.blockedDates.length > 0
              ? 'Selected dates are not available'
              : `Minimum stay is ${boomAvailability.minNightsRequired} nights`,
            blockedDates: boomAvailability.blockedDates,
            minNightsRequired: boomAvailability.minNightsRequired,
            source: 'boom',
          },
        })
      }

      // Boom says available, also verify against Hostly reservations
      const hostlyResult = await bookingService.checkAvailability(organization.id, {
        propertyId,
        checkIn,
        checkOut,
        adults,
        children,
      })

      // If Hostly has a conflict (shouldn't happen if synced), return unavailable
      if (!hostlyResult.available) {
        return NextResponse.json({
          success: true,
          data: {
            ...hostlyResult,
            source: 'hostly',
          },
        })
      }

      // Both say available
      return NextResponse.json({
        success: true,
        data: {
          available: true,
          minNightsRequired: boomAvailability.minNightsRequired,
          source: 'boom',
        },
      })
    }

    // ════════════════════════════════════════════════════════════════════════════
    // FALLBACK: Use Hostly availability if no Boom ID
    // ════════════════════════════════════════════════════════════════════════════
    const result = await bookingService.checkAvailability(organization.id, {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        source: 'hostly',
      },
    })
  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to check availability' } },
      { status: 500 }
    )
  }
}
