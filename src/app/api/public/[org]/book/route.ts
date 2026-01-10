/**
 * PUBLIC BOOKING API
 *
 * Create a booking with payment
 * No authentication required - this is called by public websites
 *
 * Flow:
 * 1. Validate guest info and booking details
 * 2. Create reservation (this validates availability and generates pricing)
 * 3. Create Stripe payment intent
 * 4. Return client secret for frontend to complete payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/client'
import { bookingService } from '@/lib/services/booking.service'
import { stripeService } from '@/lib/services/stripe.service'
import { boomSyncService } from '@/lib/services/boom-sync.service'

const BookingSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string(), // ISO date string
  checkOut: z.string(), // ISO date string
  adults: z.number().int().positive(),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  guest: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  promoCode: z.string().optional(),
  specialRequests: z.string().optional(),
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
    const validation = BookingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.message } },
        { status: 400 }
      )
    }

    const {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      infants,
      guest,
      promoCode,
      specialRequests,
    } = validation.data

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

    // Create booking (this validates availability and creates the reservation)
    const booking = await bookingService.createBooking(organization.id, {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      infants,
      guest,
      promoCode,
    })

    // Update reservation with special requests if provided
    if (specialRequests) {
      await prisma.reservation.update({
        where: { id: booking.id },
        data: { guestNotes: specialRequests },
      })
    }

    // Check if Stripe is configured
    const stripeConfigured = process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes('placeholder')

    let paymentResult = {
      clientSecret: 'demo_mode',
      paymentIntentId: `pi_demo_${Date.now()}`,
      amount: Math.round(booking.pricing.total * 100),
      currency: booking.pricing.currency,
    }

    // Create payment intent if Stripe is configured
    if (stripeConfigured) {
      paymentResult = await stripeService.createPaymentIntent({
        organizationId: organization.id,
        reservationId: booking.id,
        amount: Math.round(booking.pricing.total * 100), // Convert to cents
        currency: booking.pricing.currency,
        guestEmail: guest.email,
        guestName: `${guest.firstName} ${guest.lastName}`,
        description: `Booking at ${booking.property.name} - ${checkIn} to ${checkOut}`,
        metadata: {
          propertyName: booking.property.name,
          nights: booking.dates.nights.toString(),
          confirmationCode: booking.confirmationCode,
        },
      })
    } else {
      // In demo mode, auto-confirm the reservation
      await prisma.reservation.update({
        where: { id: booking.id },
        data: {
          status: 'confirmed',
          confirmedAt: new Date(),
          paymentStatus: 'paid',
          amountPaid: Math.round(booking.pricing.total * 100),
        },
      })

      // Sync to Boom PMS (for channel manager sync to Airbnb, Booking.com, etc.)
      boomSyncService.syncReservationToBoom(booking.id).catch((error) => {
        console.error('[Boom Sync] Failed to sync reservation:', error)
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        reservationId: booking.id,
        confirmationCode: booking.confirmationCode,
        status: stripeConfigured ? booking.status : 'confirmed',
        clientSecret: paymentResult.clientSecret,
        paymentIntentId: paymentResult.paymentIntentId,
        property: booking.property,
        dates: booking.dates,
        guest: {
          name: `${guest.firstName} ${guest.lastName}`,
          email: guest.email,
        },
        pricing: {
          ...booking.pricing,
          amountInCents: paymentResult.amount,
        },
        demoMode: !stripeConfigured,
      },
    })
  } catch (error) {
    console.error('Booking creation error:', error)

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
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create booking' } },
      { status: 500 }
    )
  }
}
