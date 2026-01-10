/**
 * STRIPE WEBHOOK HANDLER
 *
 * Handles all Stripe webhook events:
 * - payment_intent.succeeded → Confirm reservation
 * - payment_intent.payment_failed → Mark payment failed
 * - charge.refunded → Process refund
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/services/stripe.service'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify and parse the event
    let event
    try {
      event = stripeService.verifyWebhookSignature(payload, signature)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    await stripeService.handleWebhook(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing - Stripe requires raw body
export const runtime = 'nodejs'
