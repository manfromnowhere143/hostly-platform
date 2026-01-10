/**
 * BOOM WEBHOOK RECEIVER
 *
 * Receives real-time events from Boom PMS:
 * - reservation.new: New booking from Airbnb, Booking.com, VRBO, etc.
 * - reservation.updated: Booking modification
 * - reservation.canceled: Booking cancellation
 * - review.created: New guest review
 *
 * This enables bi-directional sync between Hostly and all OTA channels.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/client'
import crypto from 'crypto'

// Webhook event types from Boom
type BoomWebhookEvent =
  | 'reservation.new'
  | 'reservation.updated'
  | 'reservation.canceled'
  | 'review.created'
  | 'review.replied'
  | 'review.removed'

interface BoomWebhookPayload {
  event: BoomWebhookEvent
  timestamp: string
  data: {
    id: string
    listing_id: number
    status: string
    check_in: string
    check_out: string
    guest_name: string
    guest_email?: string
    guest_phone?: string
    guest_count: number
    total_price: number
    currency: string
    source: string // 'airbnb', 'booking_com', 'vrbo', 'direct', etc.
    notes?: string
    confirmation_code?: string
  }
}

// Verify webhook signature (if Boom provides one)
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return true // Skip if not configured

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-boom-signature')
    const webhookSecret = process.env.BOOM_WEBHOOK_SECRET

    // Verify signature if configured
    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('[Boom Webhook] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload: BoomWebhookPayload = JSON.parse(rawBody)

    console.log('[Boom Webhook] Received:', {
      event: payload.event,
      listingId: payload.data?.listing_id,
      checkIn: payload.data?.check_in,
      source: payload.data?.source,
    })

    // Find the Hostly property by Boom listing ID
    const property = await prisma.property.findFirst({
      where: {
        metadata: {
          path: ['boomId'],
          equals: payload.data.listing_id,
        },
      },
    })

    if (!property) {
      console.warn('[Boom Webhook] No property mapped for Boom listing:', payload.data.listing_id)
      // Still return 200 to acknowledge receipt
      return NextResponse.json({
        received: true,
        processed: false,
        reason: 'Property not mapped'
      })
    }

    // Handle different event types
    switch (payload.event) {
      case 'reservation.new':
        await handleNewReservation(property, payload.data)
        break

      case 'reservation.updated':
        await handleUpdatedReservation(property, payload.data)
        break

      case 'reservation.canceled':
        await handleCanceledReservation(property, payload.data)
        break

      case 'review.created':
        await handleNewReview(property, payload.data)
        break

      default:
        console.log('[Boom Webhook] Unhandled event type:', payload.event)
    }

    // Log the webhook event
    await prisma.event.create({
      data: {
        id: `evt_boom_${Date.now()}`,
        organizationId: property.organizationId,
        type: `boom.webhook.${payload.event}`,
        aggregateType: 'Property',
        aggregateId: property.id,
        data: {
          boomListingId: payload.data.listing_id,
          boomReservationId: payload.data.id,
          source: payload.data.source,
          processingTimeMs: Date.now() - startTime,
        },
      },
    })

    return NextResponse.json({
      received: true,
      processed: true,
      processingTimeMs: Date.now() - startTime,
    })

  } catch (error) {
    console.error('[Boom Webhook] Error:', error)

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ════════════════════════════════════════════════════════════════════════════════

async function handleNewReservation(
  property: { id: string; organizationId: string; name: string },
  data: BoomWebhookPayload['data']
) {
  console.log('[Boom Webhook] Processing new reservation from', data.source)

  // Parse guest name
  const nameParts = (data.guest_name || 'Guest').split(' ')
  const firstName = nameParts[0] || 'Guest'
  const lastName = nameParts.slice(1).join(' ') || ''

  // Find or create guest
  let guest = await prisma.guest.findFirst({
    where: {
      organizationId: property.organizationId,
      email: data.guest_email || `${data.id}@boom-import.local`,
    },
  })

  if (!guest) {
    guest = await prisma.guest.create({
      data: {
        id: `guest_boom_${Date.now()}`,
        organizationId: property.organizationId,
        firstName,
        lastName,
        email: data.guest_email || `${data.id}@boom-import.local`,
        phone: data.guest_phone,
        source: `boom_${data.source}`,
      },
    })
  }

  // Check if reservation already exists (by Boom ID in notes)
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      propertyId: property.id,
      internalNotes: {
        contains: `Boom ID: ${data.id}`,
      },
    },
  })

  if (existingReservation) {
    console.log('[Boom Webhook] Reservation already exists:', existingReservation.id)
    return
  }

  // Generate confirmation code
  const confirmationCode = `BOOM-${data.confirmation_code || data.id.slice(-6).toUpperCase()}`

  // Create the reservation
  const reservation = await prisma.reservation.create({
    data: {
      id: `res_boom_${Date.now()}`,
      organizationId: property.organizationId,
      propertyId: property.id,
      guestId: guest.id,
      confirmationCode,
      status: 'confirmed',
      checkIn: new Date(data.check_in),
      checkOut: new Date(data.check_out),
      adults: data.guest_count || 1,
      children: 0,
      infants: 0,
      totalAmount: Math.round((data.total_price || 0) * 100),
      currency: data.currency || 'ILS',
      paymentStatus: 'paid', // Assume paid if coming from OTA
      source: `boom_${data.source}`,
      internalNotes: `Boom ID: ${data.id}\nSource: ${data.source}\nImported: ${new Date().toISOString()}`,
      guestNotes: data.notes,
      confirmedAt: new Date(),
    },
  })

  // Block calendar dates
  const checkIn = new Date(data.check_in)
  const checkOut = new Date(data.check_out)
  const dates: Date[] = []

  for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }

  for (const date of dates) {
    await prisma.calendarDay.upsert({
      where: {
        propertyId_date: {
          propertyId: property.id,
          date,
        },
      },
      create: {
        id: `cal_boom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        organizationId: property.organizationId,
        propertyId: property.id,
        date,
        status: 'booked',
        reservationId: reservation.id,
      },
      update: {
        status: 'booked',
        reservationId: reservation.id,
      },
    })
  }

  console.log('[Boom Webhook] Created reservation:', {
    id: reservation.id,
    confirmationCode,
    property: property.name,
    dates: `${data.check_in} to ${data.check_out}`,
    source: data.source,
  })
}

async function handleUpdatedReservation(
  property: { id: string; organizationId: string },
  data: BoomWebhookPayload['data']
) {
  console.log('[Boom Webhook] Processing reservation update')

  // Find reservation by Boom ID
  const reservation = await prisma.reservation.findFirst({
    where: {
      propertyId: property.id,
      internalNotes: {
        contains: `Boom ID: ${data.id}`,
      },
    },
  })

  if (!reservation) {
    console.warn('[Boom Webhook] Reservation not found for update:', data.id)
    // Treat as new reservation
    await handleNewReservation(property, data)
    return
  }

  // Update reservation dates if changed
  const newCheckIn = new Date(data.check_in)
  const newCheckOut = new Date(data.check_out)

  if (
    reservation.checkIn.getTime() !== newCheckIn.getTime() ||
    reservation.checkOut.getTime() !== newCheckOut.getTime()
  ) {
    // Clear old calendar blocks
    await prisma.calendarDay.updateMany({
      where: { reservationId: reservation.id },
      data: { status: 'available', reservationId: null },
    })

    // Update reservation
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        adults: data.guest_count || reservation.adults,
        totalAmount: Math.round((data.total_price || 0) * 100),
      },
    })

    // Block new dates
    const dates: Date[] = []
    for (let d = new Date(newCheckIn); d < newCheckOut; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d))
    }

    for (const date of dates) {
      await prisma.calendarDay.upsert({
        where: {
          propertyId_date: {
            propertyId: property.id,
            date,
          },
        },
        create: {
          id: `cal_boom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          organizationId: property.organizationId,
          propertyId: property.id,
          date,
          status: 'booked',
          reservationId: reservation.id,
        },
        update: {
          status: 'booked',
          reservationId: reservation.id,
        },
      })
    }
  }

  console.log('[Boom Webhook] Updated reservation:', reservation.id)
}

async function handleCanceledReservation(
  property: { id: string; organizationId: string },
  data: BoomWebhookPayload['data']
) {
  console.log('[Boom Webhook] Processing cancellation')

  // Find reservation by Boom ID
  const reservation = await prisma.reservation.findFirst({
    where: {
      propertyId: property.id,
      internalNotes: {
        contains: `Boom ID: ${data.id}`,
      },
    },
  })

  if (!reservation) {
    console.warn('[Boom Webhook] Reservation not found for cancellation:', data.id)
    return
  }

  // Update reservation status
  await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    },
  })

  // Free up calendar dates
  await prisma.calendarDay.updateMany({
    where: { reservationId: reservation.id },
    data: {
      status: 'available',
      reservationId: null,
    },
  })

  console.log('[Boom Webhook] Canceled reservation:', reservation.id)
}

async function handleNewReview(
  property: { id: string; organizationId: string },
  data: any
) {
  console.log('[Boom Webhook] New review received - logging for manual processing')
  // Reviews can be handled later - just log for now
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'boom-webhook-receiver',
    timestamp: new Date().toISOString(),
    events: [
      'reservation.new',
      'reservation.updated',
      'reservation.canceled',
      'review.created',
    ],
  })
}
