/**
 * STRIPE PAYMENT SERVICE
 *
 * Handles all payment processing:
 * - Create payment intent
 * - Process payment
 * - Handle webhooks
 * - Refunds
 */

import Stripe from 'stripe'
import prisma from '@/lib/db/client'
import { ids } from '@/lib/utils/id'
import { boomSyncService } from './boom-sync.service'

// Lazy initialize Stripe client to avoid build-time errors
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  }
  return _stripe
}

export interface CreatePaymentIntentParams {
  organizationId: string
  reservationId: string
  amount: number // in cents
  currency: string
  guestEmail: string
  guestName: string
  description: string
  metadata?: Record<string, string>
}

export interface PaymentIntentResult {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
}

export class StripeService {
  // ──────────────────────────────────────────────────────────────────────────
  // CREATE PAYMENT INTENT
  // ──────────────────────────────────────────────────────────────────────────

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const {
      organizationId,
      reservationId,
      amount,
      currency,
      guestEmail,
      guestName,
      description,
      metadata = {},
    } = params

    const stripe = getStripe()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      description,
      receipt_email: guestEmail,
      metadata: {
        organizationId,
        reservationId,
        guestName,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Create pending payment record
    await prisma.payment.create({
      data: {
        id: ids.payment(),
        organizationId,
        reservationId,
        guestId: (await prisma.reservation.findUnique({
          where: { id: reservationId },
        }))!.guestId,
        amount,
        currency,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
      },
    })

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLE WEBHOOK
  // ──────────────────────────────────────────────────────────────────────────

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge)
        break
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { reservationId, organizationId } = paymentIntent.metadata

    if (!reservationId) return

    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: 'succeeded',
          stripeChargeId: paymentIntent.latest_charge as string,
          processedAt: new Date(),
        },
      })

      // Update reservation
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: 'confirmed',
          confirmedAt: new Date(),
          paymentStatus: 'paid',
          amountPaid: paymentIntent.amount,
        },
      })

      // Log event
      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId,
          type: 'payment.succeeded',
          aggregateType: 'Payment',
          aggregateId: paymentIntent.id,
          data: {
            reservationId,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
        },
      })
    })

    // ═══════════════════════════════════════════════════════════════════════════
    // SYNC TO BOOM PMS
    // After successful payment, push reservation to Boom channel manager
    // This runs async - don't block the webhook response
    // ═══════════════════════════════════════════════════════════════════════════
    boomSyncService.syncReservationToBoom(reservationId).catch((error) => {
      console.error('[Stripe Webhook] Boom sync failed (non-blocking):', error)
    })
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { reservationId, organizationId } = paymentIntent.metadata

    if (!reservationId) return

    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: 'failed',
        },
      })

      // Log event
      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId,
          type: 'payment.failed',
          aggregateType: 'Payment',
          aggregateId: paymentIntent.id,
          data: {
            reservationId,
            amount: paymentIntent.amount,
            error: paymentIntent.last_payment_error?.message,
          },
        },
      })
    })
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    const payment = await prisma.payment.findFirst({
      where: { stripeChargeId: charge.id },
    })

    if (!payment) return

    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'refunded' },
      })

      // Update reservation
      await tx.reservation.update({
        where: { id: payment.reservationId },
        data: { paymentStatus: 'refunded' },
      })

      // Log event
      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId: payment.organizationId,
          type: 'payment.refunded',
          aggregateType: 'Payment',
          aggregateId: payment.id,
          data: {
            reservationId: payment.reservationId,
            amount: charge.amount_refunded,
          },
        },
      })
    })
  }

  // ──────────────────────────────────────────────────────────────────────────
  // REFUND
  // ──────────────────────────────────────────────────────────────────────────

  async createRefund(
    paymentIntentId: string,
    amount?: number // partial refund, in cents
  ): Promise<{ refundId: string; amount: number }> {
    const stripe = getStripe()

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount }),
    })

    return {
      refundId: refund.id,
      amount: refund.amount,
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VERIFY WEBHOOK SIGNATURE
  // ──────────────────────────────────────────────────────────────────────────

  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    const stripe = getStripe()

    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  }
}

export const stripeService = new StripeService()
