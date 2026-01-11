/**
 * Boom Sync Service
 *
 * Handles bidirectional sync between Hostly and Boom:
 * - Import properties from Boom
 * - Import reservations from Boom
 * - Push availability updates to Boom
 * - Push rate updates to Boom
 */

import { Prisma } from '@prisma/client'
import prisma from '@/lib/db/client'
import { ids, generateConfirmationCode } from '@/lib/utils/id'
import { boomClient, BoomListing, BoomReservation } from './client'
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
      const boomProperties = await boomClient.getListings()

      for (const boomProp of boomProperties) {
        try {
          await this.importProperty(context, boomProp)
          result.imported++
        } catch (err) {
          result.errors.push(`${boomProp.title}: ${(err as Error).message}`)
        }
      }
    } catch (err) {
      result.errors.push(`Failed to fetch properties: ${(err as Error).message}`)
    }

    return result
  }

  private async importProperty(
    context: TenantContext,
    boomProp: BoomListing
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

    // Generate slug from title
    const slug = boomProp.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Map BoomListing fields to Property fields
    const propertyData = {
      name: boomProp.title,
      slug: existing?.slug ?? slug,
      type: 'apartment' as const, // Default type for Boom imports
      description: boomProp.marketing_content?.description || '',
      address: boomProp.address ? boomProp.address : Prisma.JsonNull,
      maxGuests: boomProp.accommodates,
      bedrooms: boomProp.beds,
      bathrooms: boomProp.baths,
      basePrice: 0, // Will be updated from calendar/rates
      currency: 'ILS', // Default currency
      status: 'active' as const,
      metadata: {
        boomId: boomProp.id,
        city: boomProp.city_name,
        amenities: boomProp.amenities,
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

      // Import photos from pictures array
      if (boomProp.pictures?.length) {
        await prisma.propertyPhoto.createMany({
          data: boomProp.pictures.map((pic, index) => ({
            id: ids.photo(),
            propertyId,
            organizationId: context.organizationId,
            url: pic.picture,
            caption: pic.nickname || null,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        })
      }
    }
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
      const response = await boomClient.getReservations({ from, to })

      for (const boomRes of response.reservations) {
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
    // Find the property by Boom listing ID
    const property = await prisma.property.findFirst({
      where: {
        organizationId: context.organizationId,
        metadata: {
          path: ['boomId'],
          equals: boomRes.listing.id,
        },
      },
    })

    if (!property) {
      throw new Error(`Property not found for Boom listing: ${boomRes.listing.id}`)
    }

    // Generate confirmation code if not provided
    const confirmationCode = boomRes.confirmation_code || `BOOM-${boomRes.id.slice(-8).toUpperCase()}`

    // Check if reservation already exists by confirmation code
    const existing = await prisma.reservation.findFirst({
      where: {
        organizationId: context.organizationId,
        confirmationCode,
      },
    })

    // Parse guest name
    const guestName = boomRes.guest?.name || boomRes.guest_name || 'Guest'
    const nameParts = guestName.split(' ')
    const firstName = nameParts[0] || 'Guest'
    const lastName = nameParts.slice(1).join(' ') || ''
    const guestEmail = boomRes.guest?.email || `${boomRes.id}@boom-import.local`
    const guestPhone = boomRes.guest?.phone || null

    // Find or create guest
    let guest = await prisma.guest.findFirst({
      where: {
        organizationId: context.organizationId,
        email: guestEmail,
      },
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          id: ids.guest(),
          organizationId: context.organizationId,
          email: guestEmail,
          firstName,
          lastName,
          phone: guestPhone,
        },
      })
    }

    // Calculate pricing (convert to cents)
    const totalCents = Math.round((boomRes.total_price || 0) * 100)

    const reservationData = {
      propertyId: property.id,
      guestId: guest.id,
      confirmationCode,
      checkIn: new Date(boomRes.check_in),
      checkOut: new Date(boomRes.check_out),
      adults: boomRes.guest_count || 1,
      children: 0,
      infants: 0,
      currency: boomRes.currency || 'ILS',
      accommodation: totalCents, // Full amount as accommodation
      cleaningFee: 0,
      serviceFee: 0,
      taxes: 0,
      total: totalCents,
      status: this.mapReservationStatus(boomRes.status),
      source: `boom_${boomRes.source || 'unknown'}`,
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
