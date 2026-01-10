import prisma from '@/lib/db/client'
import { ids } from '@/lib/utils/id'
import { TenantContext } from '@/types'
import { CreatePropertyInput, UpdatePropertyInput, PropertyQueryInput } from './property.schema'

export class PropertyService {
  // List properties with pagination and filtering
  async list(context: TenantContext, query: PropertyQueryInput) {
    const { page, limit, status, type, search } = query
    const skip = (page - 1) * limit

    const where = {
      organizationId: context.organizationId,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          photos: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: { reservations: true },
          },
        },
      }),
      prisma.property.count({ where }),
    ])

    return {
      properties: properties.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        status: p.status,
        address: p.address,
        maxGuests: p.maxGuests,
        bedrooms: p.bedrooms,
        bathrooms: Number(p.bathrooms),
        basePrice: p.basePrice,
        currency: p.currency,
        primaryPhoto: p.photos[0]?.url ?? null,
        reservationCount: p._count.reservations,
        createdAt: p.createdAt,
      })),
      total,
      page,
      limit,
    }
  }

  // Get single property by ID
  async getById(context: TenantContext, propertyId: string) {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId: context.organizationId,
      },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        amenities: { include: { amenity: true } },
      },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    return {
      ...property,
      bathrooms: Number(property.bathrooms),
      amenities: property.amenities.map((a) => ({
        id: a.amenity.id,
        name: a.amenity.name,
        icon: a.amenity.icon,
        category: a.amenity.category,
      })),
    }
  }

  // Create new property
  async create(context: TenantContext, data: CreatePropertyInput) {
    // Generate slug from name
    let slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists for this org
    const existing = await prisma.property.findFirst({
      where: {
        organizationId: context.organizationId,
        slug,
      },
    })

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const propertyId = ids.property()

    const property = await prisma.$transaction(async (tx) => {
      // Create property
      const prop = await tx.property.create({
        data: {
          id: propertyId,
          organizationId: context.organizationId,
          name: data.name,
          slug,
          type: data.type,
          description: data.description,
          address: data.address,
          coordinates: data.coordinates,
          timezone: data.timezone,
          maxGuests: data.maxGuests,
          bedrooms: data.bedrooms,
          beds: data.beds,
          bathrooms: data.bathrooms,
          basePrice: data.basePrice,
          currency: data.currency,
          cleaningFee: data.cleaningFee,
          checkInTime: data.checkInTime,
          checkOutTime: data.checkOutTime,
          minNights: data.minNights,
          maxNights: data.maxNights,
        },
      })

      // Add amenities if provided
      if (data.amenities?.length) {
        await tx.propertyAmenity.createMany({
          data: data.amenities.map((amenityId) => ({
            propertyId: prop.id,
            amenityId,
            organizationId: context.organizationId,
          })),
        })
      }

      // Log event
      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId: context.organizationId,
          type: 'property.created',
          aggregateType: 'Property',
          aggregateId: prop.id,
          data: { name: prop.name, type: prop.type },
          userId: context.userId,
        },
      })

      return prop
    })

    return this.getById(context, property.id)
  }

  // Update property
  async update(context: TenantContext, propertyId: string, data: UpdatePropertyInput) {
    // Verify property exists and belongs to org
    const existing = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId: context.organizationId,
      },
    })

    if (!existing) {
      throw new Error('Property not found')
    }

    // If name changed, update slug
    let slug = existing.slug
    if (data.name && data.name !== existing.name) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const slugExists = await prisma.property.findFirst({
        where: {
          organizationId: context.organizationId,
          slug,
          NOT: { id: propertyId },
        },
      })

      if (slugExists) {
        slug = `${slug}-${Date.now().toString(36)}`
      }
    }

    await prisma.$transaction(async (tx) => {
      // Update property
      await tx.property.update({
        where: { id: propertyId },
        data: {
          ...data,
          slug,
          address: data.address ?? undefined,
          coordinates: data.coordinates ?? undefined,
        },
      })

      // Update amenities if provided
      if (data.amenities) {
        // Remove existing
        await tx.propertyAmenity.deleteMany({
          where: { propertyId },
        })

        // Add new ones
        if (data.amenities.length) {
          await tx.propertyAmenity.createMany({
            data: data.amenities.map((amenityId) => ({
              propertyId,
              amenityId,
              organizationId: context.organizationId,
            })),
          })
        }
      }

      // Log event
      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId: context.organizationId,
          type: 'property.updated',
          aggregateType: 'Property',
          aggregateId: propertyId,
          data: { changes: Object.keys(data) },
          userId: context.userId,
        },
      })
    })

    return this.getById(context, propertyId)
  }

  // Delete property
  async delete(context: TenantContext, propertyId: string) {
    const existing = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId: context.organizationId,
      },
      include: {
        _count: { select: { reservations: true } },
      },
    })

    if (!existing) {
      throw new Error('Property not found')
    }

    // Don't delete if there are reservations
    if (existing._count.reservations > 0) {
      throw new Error('Cannot delete property with existing reservations')
    }

    await prisma.$transaction(async (tx) => {
      await tx.property.delete({
        where: { id: propertyId },
      })

      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId: context.organizationId,
          type: 'property.deleted',
          aggregateType: 'Property',
          aggregateId: propertyId,
          data: { name: existing.name },
          userId: context.userId,
        },
      })
    })

    return { success: true }
  }

  // Publish property
  async publish(context: TenantContext, propertyId: string) {
    const existing = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId: context.organizationId,
      },
    })

    if (!existing) {
      throw new Error('Property not found')
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        status: 'active',
        publishedAt: new Date(),
      },
    })

    return this.getById(context, propertyId)
  }

  // Unpublish property
  async unpublish(context: TenantContext, propertyId: string) {
    const existing = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId: context.organizationId,
      },
    })

    if (!existing) {
      throw new Error('Property not found')
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { status: 'inactive' },
    })

    return this.getById(context, propertyId)
  }
}

export const propertyService = new PropertyService()
