/**
 * Boom Sync Service
 *
 * Handles bidirectional sync between Hostly and Boom:
 * - Import properties from Boom
 * - Import reservations from Boom
 * - Push availability updates to Boom
 * - Push rate updates to Boom
 */

import prisma from '@/lib/db/client'
import { ids, generateConfirmationCode } from '@/lib/utils/id'
import { boomClient, BoomProperty, BoomReservation } from './client'
import { TenantContext } from '@/types'

export class BoomSyncService {
  // ════════════════════════════════════════════════════════════════════════
  // PROPERTY SYNC
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Import properties from Boom into Hostly
   */
  async importProperties(context: TenantContext): Promise<{
    imported: number
    updated: number
    errors: string[]
  }> {
    const result = { imported: 0, updated: 0, errors: [] as string[] }

    try {
      const boomProperties = await boomClient.getProperties()

      for (const boomProp of boomProperties) {
        try {
          await this.importProperty(context, boomProp)
          result.imported++
        } catch (err) {
          result.errors.push(`${boomProp.name}: ${(err as Error).message}`)
        }
      }
    } catch (err) {
      result.errors.push(`Failed to fetch properties: ${(err as Error).message}`)
    }

    return result
  }

  private async importProperty(
    context: TenantContext,
    boomProp: BoomProperty
  ) {
    // Check if property already exists (by external ID in metadata)
    const existing = await prisma.property.findFirst({
      where: {
        organizationId: context.organizationId,
        metadata: {
          path: ['boomId'],
          equals: boomProp.id,
        },
      },
    })

    // Generate slug
    const slug = boomProp.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const propertyData = {
      name: boomProp.name,
      slug: existing?.slug ?? slug,
      type: this.mapPropertyType(boomProp.type),
      description: boomProp.description,
      address: boomProp.address,
      maxGuests: boomProp.max_guests,
      bedrooms: boomProp.bedrooms,
      bathrooms: boomProp.bathrooms,
      basePrice: Math.round(boomProp.base_rate * 100), // Convert to cents
      currency: boomProp.currency,
      status: boomProp.status === 'active' ? 'active' : 'draft',
      metadata: {
        boomId: boomProp.id,
        lastSyncedAt: new Date().toISOString(),
      },
    }

    if (existing) {
      // Update existing
      await prisma.property.update({
        where: { id: existing.id },
        data: propertyData,
      })
    } else {
      // Create new
      const propertyId = ids.property()
      await prisma.property.create({
        data: {
          id: propertyId,
          organizationId: context.organizationId,
          ...propertyData,
        },
      })

      // Import photos
      if (boomProp.images?.length) {
        await prisma.propertyPhoto.createMany({
          data: boomProp.images.map((img, index) => ({
            id: ids.photo(),
            propertyId,
            organizationId: context.organizationId,
            url: img.url,
            caption: img.caption,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        })
      }
    }
  }

  private mapPropertyType(boomType: string): string {
    const typeMap: Record<string, string> = {
      apartment: 'apartment',
      condo: 'apartment',
      villa: 'villa',
      house: 'house',
      hotel_room: 'hotel_room',
      room: 'hotel_room',
    }
    return typeMap[boomType.toLowerCase()] ?? 'apartment'
  }

  // ════════════════════════════════════════════════════════════════════════
  // RESERVATION SYNC
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Import reservations from Boom into Hostly
   */
  async importReservations(
    context: TenantContext,
    from?: string,
    to?: string
  ): Promise<{
    imported: number
    updated: number
    errors: string[]
  }> {
    const result = { imported: 0, updated: 0, errors: [] as string[] }

    try {
      const boomReservations = await boomClient.getReservations({ from, to })

      for (const boomRes of boomReservations) {
        try {
          const isNew = await this.importReservation(context, boomRes)
          if (isNew) {
            result.imported++
          } else {
            result.updated++
          }
        } catch (err) {
          result.errors.push(
            `${boomRes.confirmation_code}: ${(err as Error).message}`
          )
        }
      }
    } catch (err) {
      result.errors.push(`Failed to fetch reservations: ${(err as Error).message}`)
    }

    return result
  }

  private async importReservation(
    context: TenantContext,
    boomRes: BoomReservation
  ): Promise<boolean> {
    // Find the property by Boom ID
    const property = await prisma.property.findFirst({
      where: {
        organizationId: context.organizationId,
        metadata: {
          path: ['boomId'],
          equals: boomRes.property_id,
        },
      },
    })

    if (!property) {
      throw new Error(`Property not found for Boom ID: ${boomRes.property_id}`)
    }

    // Check if reservation already exists
    const existing = await prisma.reservation.findFirst({
      where: {
        organizationId: context.organizationId,
        OR: [
          { confirmationCode: boomRes.confirmation_code },
          {
            metadata: {
              path: ['boomId'],
              equals: boomRes.id,
            },
          },
        ],
      },
    })

    // Find or create guest
    let guest = await prisma.guest.findFirst({
      where: {
        organizationId: context.organizationId,
        email: boomRes.guest.email,
      },
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          id: ids.guest(),
          organizationId: context.organizationId,
          email: boomRes.guest.email,
          firstName: boomRes.guest.first_name,
          lastName: boomRes.guest.last_name,
          phone: boomRes.guest.phone,
        },
      })
    }

    const reservationData = {
      propertyId: property.id,
      guestId: guest.id,
      confirmationCode: boomRes.confirmation_code,
      checkIn: new Date(boomRes.check_in),
      checkOut: new Date(boomRes.check_out),
      adults: boomRes.guests.adults,
      children: boomRes.guests.children,
      infants: boomRes.guests.infants,
      currency: boomRes.pricing.currency,
      accommodation: Math.round(boomRes.pricing.accommodation * 100),
      cleaningFee: Math.round(boomRes.pricing.cleaning * 100),
      serviceFee: Math.round(boomRes.pricing.fees * 100),
      taxes: Math.round(boomRes.pricing.taxes * 100),
      total: Math.round(boomRes.pricing.total * 100),
      status: this.mapReservationStatus(boomRes.status),
      source: 'boom',
    }

    if (existing) {
      // Update existing
      await prisma.reservation.update({
        where: { id: existing.id },
        data: reservationData,
      })
      return false
    } else {
      // Create new
      await prisma.reservation.create({
        data: {
          id: ids.reservation(),
          organizationId: context.organizationId,
          ...reservationData,
        },
      })

      // Block calendar dates
      const checkIn = new Date(boomRes.check_in)
      const checkOut = new Date(boomRes.check_out)
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
            id: ids.event(),
            organizationId: context.organizationId,
            propertyId: property.id,
            date,
            status: 'booked',
          },
          update: {
            status: 'booked',
          },
        })
      }

      return true
    }
  }

  private mapReservationStatus(boomStatus: string): string {
    const statusMap: Record<string, string> = {
      pending: 'pending',
      confirmed: 'confirmed',
      cancelled: 'cancelled',
      completed: 'completed',
      checked_in: 'confirmed',
      checked_out: 'completed',
    }
    return statusMap[boomStatus.toLowerCase()] ?? 'pending'
  }

  // ════════════════════════════════════════════════════════════════════════
  // PUSH TO BOOM
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Push availability updates to Boom
   */
  async pushAvailability(
    context: TenantContext,
    propertyId: string,
    from: string,
    to: string
  ): Promise<void> {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId: context.organizationId,
      },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    const boomId = (property.metadata as { boomId?: string })?.boomId
    if (!boomId) {
      throw new Error('Property not linked to Boom')
    }

    // Get calendar days
    const calendar = await prisma.calendarDay.findMany({
      where: {
        propertyId,
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    })

    const dates = calendar.map((day) => ({
      date: day.date.toISOString().split('T')[0],
      available: day.status === 'available',
      price: day.price ? day.price / 100 : undefined, // Convert from cents
      min_nights: day.minNights ?? undefined,
    }))

    await boomClient.updateAvailability(boomId, dates)
  }

  /**
   * Push rate updates to Boom
   */
  async pushRates(
    context: TenantContext,
    propertyId: string,
    rates: Array<{ date: string; price: number }>
  ): Promise<void> {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId: context.organizationId,
      },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    const boomId = (property.metadata as { boomId?: string })?.boomId
    if (!boomId) {
      throw new Error('Property not linked to Boom')
    }

    // Convert prices from cents to dollars
    const boomRates = rates.map((r) => ({
      date: r.date,
      price: r.price / 100,
    }))

    await boomClient.updateRates(boomId, boomRates)
  }
}

export const boomSyncService = new BoomSyncService()
