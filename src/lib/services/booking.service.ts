/**
 * HOSTLY BOOKING ENGINE
 *
 * Complete booking flow:
 * 1. Check Availability
 * 2. Generate Quote (pricing breakdown)
 * 3. Create Booking (with payment)
 * 4. Confirm Reservation
 */

import prisma from '@/lib/db/client'
import { ids, generateConfirmationCode } from '@/lib/utils/id'
import { TenantContext, AvailabilityCheck, AvailabilityResult, BookingRequest } from '@/types'
import { addDays, differenceInDays, eachDayOfInterval, format, parseISO } from 'date-fns'

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface QuoteRequest {
  propertyId: string
  checkIn: string // ISO date
  checkOut: string // ISO date
  adults: number
  children?: number
  promoCode?: string
}

export interface QuoteResult {
  id: string
  propertyId: string
  propertyName: string
  checkIn: string
  checkOut: string
  nights: number
  guests: {
    adults: number
    children: number
    total: number
  }
  pricing: {
    currency: string
    nightlyRates: Array<{
      date: string
      price: number
      reason?: string
    }>
    accommodationTotal: number
    cleaningFee: number
    serviceFee: number
    taxes: number
    discounts: Array<{
      type: string
      description: string
      amount: number
    }>
    discountTotal: number
    grandTotal: number
  }
  expiresAt: string
}

export interface BookingResult {
  id: string
  confirmationCode: string
  status: string
  property: {
    id: string
    name: string
    address: unknown
  }
  dates: {
    checkIn: string
    checkOut: string
    nights: number
  }
  guest: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  pricing: {
    currency: string
    total: number
    paid: number
    balance: number
  }
  createdAt: string
}

// ════════════════════════════════════════════════════════════════════════════
// BOOKING SERVICE
// ════════════════════════════════════════════════════════════════════════════

export class BookingService {

  // ──────────────────────────────────────────────────────────────────────────
  // 1. AVAILABILITY CHECK
  // ──────────────────────────────────────────────────────────────────────────

  async checkAvailability(
    organizationId: string,
    request: AvailabilityCheck
  ): Promise<AvailabilityResult> {
    const { propertyId, checkIn, checkOut, adults, children = 0 } = request

    // Get property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId,
        status: 'active',
      },
    })

    if (!property) {
      return { available: false, reason: 'Property not found or not active' }
    }

    const checkInDate = parseISO(checkIn)
    const checkOutDate = parseISO(checkOut)
    const nights = differenceInDays(checkOutDate, checkInDate)
    const totalGuests = adults + children

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return { available: false, reason: 'Check-out must be after check-in' }
    }

    if (checkInDate < new Date()) {
      return { available: false, reason: 'Check-in date cannot be in the past' }
    }

    // Check minimum nights
    if (nights < property.minNights) {
      return {
        available: false,
        reason: `Minimum stay is ${property.minNights} nights`
      }
    }

    // Check maximum nights
    if (nights > property.maxNights) {
      return {
        available: false,
        reason: `Maximum stay is ${property.maxNights} nights`
      }
    }

    // Check guest capacity
    if (totalGuests > property.maxGuests) {
      return {
        available: false,
        reason: `Maximum ${property.maxGuests} guests allowed`
      }
    }

    // Check calendar for blocked/booked dates
    const dates = eachDayOfInterval({
      start: checkInDate,
      end: addDays(checkOutDate, -1) // Exclude checkout date
    })

    const blockedDays = await prisma.calendarDay.findMany({
      where: {
        propertyId,
        date: { in: dates },
        status: { in: ['booked', 'blocked'] },
      },
    })

    if (blockedDays.length > 0) {
      // Find alternative dates
      const alternatives = await this.findAlternatives(
        organizationId,
        propertyId,
        checkInDate,
        nights
      )

      return {
        available: false,
        reason: 'Selected dates are not available',
        alternatives,
      }
    }

    return { available: true }
  }

  private async findAlternatives(
    organizationId: string,
    propertyId: string,
    originalCheckIn: Date,
    nights: number
  ): Promise<Array<{ checkIn: string; checkOut: string; price: number }>> {
    const alternatives: Array<{ checkIn: string; checkOut: string; price: number }> = []

    // Look for available dates in the next 30 days
    for (let offset = 1; offset <= 30 && alternatives.length < 3; offset++) {
      const testCheckIn = addDays(originalCheckIn, offset)
      const testCheckOut = addDays(testCheckIn, nights)

      const dates = eachDayOfInterval({
        start: testCheckIn,
        end: addDays(testCheckOut, -1),
      })

      const blockedDays = await prisma.calendarDay.count({
        where: {
          propertyId,
          date: { in: dates },
          status: { in: ['booked', 'blocked'] },
        },
      })

      if (blockedDays === 0) {
        // Get approximate price
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
        })

        if (property) {
          alternatives.push({
            checkIn: format(testCheckIn, 'yyyy-MM-dd'),
            checkOut: format(testCheckOut, 'yyyy-MM-dd'),
            price: property.basePrice * nights,
          })
        }
      }
    }

    return alternatives
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. QUOTE GENERATION (Pricing)
  // ──────────────────────────────────────────────────────────────────────────

  async generateQuote(
    organizationId: string,
    request: QuoteRequest
  ): Promise<QuoteResult> {
    const { propertyId, checkIn, checkOut, adults, children = 0, promoCode } = request

    // First check availability
    const availability = await this.checkAvailability(organizationId, {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
    })

    if (!availability.available) {
      throw new Error(availability.reason || 'Dates not available')
    }

    // Get property
    const property = await prisma.property.findFirst({
      where: { id: propertyId, organizationId },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    const checkInDate = parseISO(checkIn)
    const checkOutDate = parseISO(checkOut)
    const nights = differenceInDays(checkOutDate, checkInDate)
    const dates = eachDayOfInterval({
      start: checkInDate,
      end: addDays(checkOutDate, -1),
    })

    // Get custom pricing from calendar
    const calendarDays = await prisma.calendarDay.findMany({
      where: {
        propertyId,
        date: { in: dates },
      },
    })

    const calendarPrices = new Map(
      calendarDays.map((d) => [format(d.date, 'yyyy-MM-dd'), d.price])
    )

    // Calculate nightly rates
    const nightlyRates = dates.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const customPrice = calendarPrices.get(dateStr)
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 // Fri/Sat

      let price = property.basePrice
      let reason: string | undefined

      if (customPrice) {
        price = customPrice
        reason = 'Custom rate'
      } else if (isWeekend) {
        price = Math.round(property.basePrice * 1.2) // 20% weekend premium
        reason = 'Weekend rate'
      }

      return { date: dateStr, price, reason }
    })

    // Calculate totals
    const accommodationTotal = nightlyRates.reduce((sum, r) => sum + r.price, 0)
    const cleaningFee = property.cleaningFee
    const serviceFee = Math.round(accommodationTotal * 0.1) // 10% service fee
    const subtotal = accommodationTotal + cleaningFee + serviceFee

    // Calculate discounts
    const discounts: Array<{ type: string; description: string; amount: number }> = []

    // Weekly discount (7+ nights = 10% off)
    if (nights >= 7) {
      const weeklyDiscount = Math.round(accommodationTotal * 0.1)
      discounts.push({
        type: 'weekly',
        description: 'Weekly stay discount (10%)',
        amount: weeklyDiscount,
      })
    }

    // Monthly discount (28+ nights = 20% off)
    if (nights >= 28) {
      const monthlyDiscount = Math.round(accommodationTotal * 0.2)
      discounts.push({
        type: 'monthly',
        description: 'Monthly stay discount (20%)',
        amount: monthlyDiscount,
      })
    }

    // Promo code discount
    if (promoCode) {
      // For now, accept any promo code for 5% off
      // In production, validate against promo codes table
      const promoDiscount = Math.round(accommodationTotal * 0.05)
      discounts.push({
        type: 'promo',
        description: `Promo code: ${promoCode}`,
        amount: promoDiscount,
      })
    }

    const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0)

    // Calculate taxes (17% VAT for Israel)
    const taxableAmount = subtotal - discountTotal
    const taxes = Math.round(taxableAmount * 0.17)

    const grandTotal = taxableAmount + taxes

    // Create quote in database
    const quote = await prisma.quote.create({
      data: {
        id: ids.quote(),
        organizationId,
        propertyId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults,
        children,
        currency: property.currency,
        nightlyRates: nightlyRates,
        accommodation: accommodationTotal,
        cleaningFee,
        serviceFee,
        taxes,
        discounts,
        total: grandTotal,
        expiresAt: addDays(new Date(), 1), // Expires in 24 hours
      },
    })

    return {
      id: quote.id,
      propertyId: property.id,
      propertyName: property.name,
      checkIn,
      checkOut,
      nights,
      guests: {
        adults,
        children,
        total: adults + children,
      },
      pricing: {
        currency: property.currency,
        nightlyRates,
        accommodationTotal,
        cleaningFee,
        serviceFee,
        taxes,
        discounts,
        discountTotal,
        grandTotal,
      },
      expiresAt: quote.expiresAt.toISOString(),
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. CREATE BOOKING
  // ──────────────────────────────────────────────────────────────────────────

  async createBooking(
    organizationId: string,
    request: BookingRequest
  ): Promise<BookingResult> {
    const {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children = 0,
      infants = 0,
      guest,
      promoCode,
    } = request

    // Generate quote to get pricing
    const quote = await this.generateQuote(organizationId, {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      promoCode,
    })

    // Get property
    const property = await prisma.property.findFirst({
      where: { id: propertyId, organizationId },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    // Create or find guest
    let guestRecord = await prisma.guest.findFirst({
      where: {
        organizationId,
        email: guest.email,
      },
    })

    if (!guestRecord) {
      guestRecord = await prisma.guest.create({
        data: {
          id: ids.guest(),
          organizationId,
          email: guest.email,
          firstName: guest.firstName,
          lastName: guest.lastName,
          phone: guest.phone,
        },
      })
    }

    const checkInDate = parseISO(checkIn)
    const checkOutDate = parseISO(checkOut)
    const nights = differenceInDays(checkOutDate, checkInDate)

    // Create reservation
    const reservation = await prisma.$transaction(async (tx) => {
      // Create the reservation
      const res = await tx.reservation.create({
        data: {
          id: ids.reservation(),
          organizationId,
          propertyId,
          guestId: guestRecord!.id,
          confirmationCode: generateConfirmationCode(),
          checkIn: checkInDate,
          checkOut: checkOutDate,
          adults,
          children,
          infants,
          currency: quote.pricing.currency,
          accommodation: quote.pricing.accommodationTotal,
          cleaningFee: quote.pricing.cleaningFee,
          serviceFee: quote.pricing.serviceFee,
          taxes: quote.pricing.taxes,
          discounts: quote.pricing.discountTotal,
          total: quote.pricing.grandTotal,
          status: 'pending',
          source: 'direct',
        },
      })

      // Block calendar dates
      const dates = eachDayOfInterval({
        start: checkInDate,
        end: addDays(checkOutDate, -1),
      })

      for (const date of dates) {
        await tx.calendarDay.upsert({
          where: {
            propertyId_date: {
              propertyId,
              date,
            },
          },
          create: {
            id: ids.event(),
            organizationId,
            propertyId,
            date,
            status: 'booked',
            reservationId: res.id,
          },
          update: {
            status: 'booked',
            reservationId: res.id,
          },
        })
      }

      // Update quote as converted
      await tx.quote.update({
        where: { id: quote.id },
        data: {
          status: 'converted',
          convertedTo: res.id,
        },
      })

      // Update guest stats
      await tx.guest.update({
        where: { id: guestRecord!.id },
        data: {
          totalStays: { increment: 1 },
          totalSpent: { increment: quote.pricing.grandTotal },
          lastStayAt: checkInDate,
        },
      })

      // Log event
      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId,
          type: 'reservation.created',
          aggregateType: 'Reservation',
          aggregateId: res.id,
          data: {
            confirmationCode: res.confirmationCode,
            propertyId,
            checkIn,
            checkOut,
            total: quote.pricing.grandTotal,
            source: 'direct',
          },
        },
      })

      return res
    })

    return {
      id: reservation.id,
      confirmationCode: reservation.confirmationCode,
      status: reservation.status,
      property: {
        id: property.id,
        name: property.name,
        address: property.address,
      },
      dates: {
        checkIn,
        checkOut,
        nights,
      },
      guest: {
        id: guestRecord.id,
        firstName: guestRecord.firstName,
        lastName: guestRecord.lastName,
        email: guestRecord.email,
      },
      pricing: {
        currency: reservation.currency,
        total: reservation.total,
        paid: reservation.amountPaid,
        balance: reservation.total - reservation.amountPaid,
      },
      createdAt: reservation.createdAt.toISOString(),
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CONFIRM BOOKING (after payment)
  // ──────────────────────────────────────────────────────────────────────────

  async confirmBooking(
    context: TenantContext,
    reservationId: string,
    paymentIntentId?: string
  ): Promise<BookingResult> {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        organizationId: context.organizationId,
      },
      include: {
        property: true,
        guest: true,
      },
    })

    if (!reservation) {
      throw new Error('Reservation not found')
    }

    // Update reservation status
    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: 'confirmed',
          confirmedAt: new Date(),
          paymentStatus: 'paid',
          amountPaid: reservation.total,
        },
      })

      // Create payment record
      if (paymentIntentId) {
        await tx.payment.create({
          data: {
            id: ids.payment(),
            organizationId: context.organizationId,
            reservationId,
            guestId: reservation.guestId,
            amount: reservation.total,
            currency: reservation.currency,
            stripePaymentIntentId: paymentIntentId,
            status: 'succeeded',
            processedAt: new Date(),
          },
        })
      }

      // Log event
      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId: context.organizationId,
          type: 'reservation.confirmed',
          aggregateType: 'Reservation',
          aggregateId: reservationId,
          data: {
            confirmationCode: reservation.confirmationCode,
            paymentIntentId,
          },
          userId: context.userId,
        },
      })
    })

    const nights = differenceInDays(
      new Date(reservation.checkOut),
      new Date(reservation.checkIn)
    )

    return {
      id: reservation.id,
      confirmationCode: reservation.confirmationCode,
      status: 'confirmed',
      property: {
        id: reservation.property.id,
        name: reservation.property.name,
        address: reservation.property.address,
      },
      dates: {
        checkIn: format(reservation.checkIn, 'yyyy-MM-dd'),
        checkOut: format(reservation.checkOut, 'yyyy-MM-dd'),
        nights,
      },
      guest: {
        id: reservation.guest.id,
        firstName: reservation.guest.firstName,
        lastName: reservation.guest.lastName,
        email: reservation.guest.email,
      },
      pricing: {
        currency: reservation.currency,
        total: reservation.total,
        paid: reservation.total,
        balance: 0,
      },
      createdAt: reservation.createdAt.toISOString(),
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. CANCEL BOOKING
  // ──────────────────────────────────────────────────────────────────────────

  async cancelBooking(
    context: TenantContext,
    reservationId: string,
    reason?: string
  ): Promise<{ success: boolean; refundAmount?: number }> {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        organizationId: context.organizationId,
      },
    })

    if (!reservation) {
      throw new Error('Reservation not found')
    }

    if (reservation.status === 'cancelled') {
      throw new Error('Reservation is already cancelled')
    }

    await prisma.$transaction(async (tx) => {
      // Update reservation
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          internalNotes: reason
            ? `Cancelled: ${reason}`
            : reservation.internalNotes,
        },
      })

      // Free up calendar dates
      await tx.calendarDay.updateMany({
        where: { reservationId },
        data: {
          status: 'available',
          reservationId: null,
        },
      })

      // Log event
      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId: context.organizationId,
          type: 'reservation.cancelled',
          aggregateType: 'Reservation',
          aggregateId: reservationId,
          data: {
            confirmationCode: reservation.confirmationCode,
            reason,
          },
          userId: context.userId,
        },
      })
    })

    // TODO: Process refund if paid
    const refundAmount = reservation.amountPaid > 0 ? reservation.amountPaid : undefined

    return { success: true, refundAmount }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. GET CALENDAR
  // ──────────────────────────────────────────────────────────────────────────

  async getCalendar(
    organizationId: string,
    propertyId: string,
    from: string,
    to: string
  ): Promise<Array<{
    date: string
    status: string
    price: number | null
    minNights: number | null
    reservationId: string | null
  }>> {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, organizationId },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    const fromDate = parseISO(from)
    const toDate = parseISO(to)
    const dates = eachDayOfInterval({ start: fromDate, end: toDate })

    // Get calendar entries
    const calendarDays = await prisma.calendarDay.findMany({
      where: {
        propertyId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
    })

    const calendarMap = new Map(
      calendarDays.map((d) => [format(d.date, 'yyyy-MM-dd'), d])
    )

    return dates.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const entry = calendarMap.get(dateStr)

      return {
        date: dateStr,
        status: entry?.status ?? 'available',
        price: entry?.price ?? property.basePrice,
        minNights: entry?.minNights ?? property.minNights,
        reservationId: entry?.reservationId ?? null,
      }
    })
  }
}

export const bookingService = new BookingService()
