/**
 * PUBLIC PROPERTIES API
 *
 * List all active properties for an organization
 * No authentication required - this is called by public websites
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/client'

export async function GET(
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

    // Get all active properties with photos
    const properties = await prisma.property.findMany({
      where: {
        organizationId: organization.id,
        status: 'active',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        type: true,
        address: true,
        coordinates: true,
        bedrooms: true,
        beds: true,
        bathrooms: true,
        maxGuests: true,
        basePrice: true,
        cleaningFee: true,
        currency: true,
        minNights: true,
        maxNights: true,
        checkInTime: true,
        checkOutTime: true,
        photos: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            caption: true,
            isPrimary: true,
            sortOrder: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        amenities: {
          select: {
            amenity: {
              select: {
                id: true,
                name: true,
                icon: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Transform the response to flatten amenities
    const transformedProperties = properties.map((p) => ({
      ...p,
      amenities: p.amenities.map((a) => a.amenity),
    }))

    return NextResponse.json({
      success: true,
      data: {
        organization: {
          name: organization.name,
          slug: organization.slug,
        },
        properties: transformedProperties,
      },
    })
  } catch (error) {
    console.error('Properties list error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list properties' } },
      { status: 500 }
    )
  }
}
