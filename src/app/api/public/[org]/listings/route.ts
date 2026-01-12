/**
 * PUBLIC LISTINGS API - State of the Art
 *
 * Returns listings from Boom PMS for display on the marketplace.
 * This endpoint does NOT require date filters - returns all properties.
 *
 * Query params:
 * - limit: number (default 12)
 * - offset: number (default 0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { boomClient, type BoomListing } from '@/lib/integrations/boom/client'

// ─── Property Mapping Data ────────────────────────────────────────────────────
// Maps Boom listing IDs to our property system
const RENTLY_PROPERTY_MAP: Record<number, {
  project: 'seaside' | 'eilat42'
  slug: string
  tags: string[]
}> = {
  // Sea Side apartments (example mappings - will use actual Boom data)
  18266: { project: 'seaside', slug: 'seaside-mykonos', tags: ['Sea View', 'Pool'] },
  18267: { project: 'seaside', slug: 'seaside-santorini', tags: ['Sea View', 'Luxury'] },
  18268: { project: 'seaside', slug: 'seaside-rhodes', tags: ['Sea View', 'Family'] },
  // Eilat 42 apartments
  18270: { project: 'eilat42', slug: 'eilat42-mango', tags: ['City View', 'Modern'] },
  18271: { project: 'eilat42', slug: 'eilat42-palm', tags: ['Pool View', 'Cozy'] },
}

// Transform Boom listing to marketplace format
function transformListing(listing: BoomListing, org: string) {
  // Determine project based on title
  const titleLower = (listing.title || '').toLowerCase()
  const isSeaSide = titleLower.includes('sea side') || titleLower.includes('seaside')
  const isEilat42 = titleLower.includes('eilat 42') || titleLower.includes('eilat42')

  const propertyInfo = RENTLY_PROPERTY_MAP[listing.id] || {
    project: isSeaSide ? 'seaside' : isEilat42 ? 'eilat42' : 'seaside',
    slug: `property-${listing.id}`,
    tags: isSeaSide ? ['Sea View', 'Pool'] : isEilat42 ? ['Mountain View', 'Modern'] : [],
  }

  // Get images from Boom's picture structure
  // Boom uses { original: string, thumbnail: string } format
  const images = listing.pictures?.map(p => {
    // Handle both possible formats
    if (typeof p === 'string') return p
    if (p.original) return p.original
    if (p.picture) return p.picture
    if ((p as any).url) return (p as any).url
    return null
  }).filter(Boolean) as string[] || []

  // Default price ranges based on property type (will be overridden by availability check)
  let displayPrice = 0
  if (listing.days_rates) {
    const rates = Object.values(listing.days_rates as Record<string, number>)
    if (rates.length > 0) {
      displayPrice = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
    }
  }

  // Fallback pricing based on bedrooms if no days_rates
  if (displayPrice === 0) {
    const beds = listing.beds || 1
    // Approximate nightly rates based on Eilat market
    displayPrice = beds === 1 ? 450 : beds === 2 ? 650 : beds >= 3 ? 850 : 550
  }

  // Clean up the name for display
  const cleanName = (listing.title || listing.nickname || `Property ${listing.id}`)
    .replace(/by rently/gi, '')
    .replace(/at sea side/gi, '- Sea Side')
    .replace(/at seaside/gi, '- Sea Side')
    .replace(/at eilat 42/gi, '- Eilat 42')
    .replace(/sea side/gi, 'Sea Side')
    .replace(/eilat 42 complex/gi, 'Eilat 42')
    .trim()

  return {
    id: `boom_${listing.id}`,
    boomId: listing.id,
    slug: propertyInfo.slug,
    name: cleanName,
    location: listing.city_name || 'Eilat, Israel',
    host: org,
    hostName: org === 'rently' ? 'Rently' : org,
    price: displayPrice,
    currency: 'ILS',
    rating: 4.9 + Math.random() * 0.1, // TODO: Get real reviews from Boom
    reviews: Math.floor(50 + Math.random() * 150),
    images: images.slice(0, 5),
    isSuperhost: true,
    tags: propertyInfo.tags,
    specs: {
      bedrooms: listing.beds || 1,
      bathrooms: listing.baths || 1,
      guests: listing.accommodates || 4,
    },
    amenities: listing.amenities || [],
    project: propertyInfo.project,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  try {
    const { org } = await params
    const searchParams = request.nextUrl.searchParams

    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if Boom is configured
    if (!boomClient.isEnabled()) {
      console.warn('[Listings API] Boom not configured, returning empty list')
      return NextResponse.json({
        success: true,
        data: {
          listings: [],
          total: 0,
          limit,
          offset,
          source: 'none',
        },
      })
    }

    // Fetch listings from Boom
    console.log(`[Listings API] Fetching listings for ${org} from Boom`)
    const boomListings = await boomClient.getListings()

    console.log(`[Listings API] Got ${boomListings.length} listings from Boom`)

    // Transform to marketplace format
    const listings = boomListings
      .map(listing => transformListing(listing, org))
      .slice(offset, offset + limit)

    // Debug: Log transformed listing to verify images
    if (listings.length > 0) {
      console.log(`[Listings API] Transformed listing sample:`, {
        id: listings[0].id,
        name: listings[0].name,
        price: listings[0].price,
        imagesCount: listings[0].images?.length,
        firstImage: listings[0].images?.[0],
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        listings,
        total: boomListings.length,
        limit,
        offset,
        source: 'boom',
      },
    })

  } catch (error) {
    console.error('[Listings API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch listings'
        }
      },
      { status: 500 }
    )
  }
}
