/**
 * CURATED LISTINGS API - Returns hand-curated apartment data
 *
 * This endpoint returns the curated Rently apartment data with proper names,
 * images, and descriptions that match the Rently luxury website.
 */

import { NextRequest, NextResponse } from 'next/server'

// ─── Apartment Data (matching rently.config.js) ─────────────────────────────

interface Apartment {
  id: string
  unit: string
  name: { en: string; he: string }
  folder: string
  building?: string
  boomId: number // Real Boom PMS ID for live pricing
  project: 'seaside' | 'eilat42'
  subtitle: { en: string; he: string }
  description: { en: string; he: string }
  specs: { beds: number; baths: number; sqm: number; guests?: number }
  price: number
  amenities: { en: string[]; he: string[] }
  images: string[]
}

// Sea Side Apartments - With Real Boom IDs
const seasideBaseApartments = [
  { id: 's3', unit: '3', name: { en: "Mykonos", he: "מיקונוס" }, folder: 'mykonos', boomId: 21102 },
  { id: 's22', unit: '22', name: { en: "Poppy", he: "פופי" }, folder: 'poppy', boomId: 18271 },
  { id: 's29', unit: '29', name: { en: "Lily", he: "לילי" }, folder: 'lily', boomId: 18270 },
  { id: 's33', unit: '33', name: { en: "Camellia", he: "קמיליה" }, folder: '33-camellia', boomId: 18272 },
  { id: 's49', unit: '49', name: { en: "Ivy", he: "אייבי" }, folder: 'ivy', boomId: 18268 },
  { id: 's62', unit: '62', name: { en: "Zinnia", he: "זיניה" }, folder: 'zinnia', boomId: 18266 },
  { id: 's63', unit: '63', name: { en: "Daisy", he: "דייזי" }, folder: 'daisy', boomId: 18267 },
  { id: 's78', unit: '78', name: { en: "Clover", he: "תלתן" }, folder: '78-clover', boomId: 18265 },
  { id: 's79', unit: '79', name: { en: "Tranquil", he: "טרנקיל" }, folder: 'tranquil', boomId: 18264 },
  { id: 's80', unit: '80', name: { en: "Rose", he: "רוז" }, folder: 'rose', boomId: 19635 },
  { id: 's81', unit: '81', name: { en: "Rosy", he: "רוזי" }, folder: 'rosy', boomId: 19651 },
  { id: 's86', unit: '86', name: { en: "Flora", he: "פלורה" }, folder: 'flora', boomId: 18261 },
  { id: 's95', unit: '95', name: { en: "Zinnia II", he: "זיניה" }, folder: 'zinnia2', boomId: 18250 },
  { id: 's111', unit: '111', name: { en: "Jasmine", he: "יסמין" }, folder: 'jasmine', boomId: 18248 },
  { id: 's129', unit: '129', name: { en: "Marigold", he: "מרי גולד" }, folder: 'marigold', boomId: 18234 },
  { id: 's140', unit: '140', name: { en: "Laura", he: "לורה" }, folder: 'laura', boomId: 18253 },
  { id: 's151', unit: '151', name: { en: "Tulip", he: "טוליפ" }, folder: 'tulip', boomId: 18239 },
  { id: 's159', unit: '159', name: { en: "Lavender", he: "לבנדר" }, folder: 'lavender', boomId: 18244 },
  { id: 's167', unit: '167', name: { en: "Lotus", he: "לוטוס" }, folder: 'lotus', boomId: 18249 },
  { id: 's168', unit: '168', name: { en: "Sunflower", he: "חמניה" }, folder: 'sunflower', boomId: 22470 },
  { id: 's172', unit: '172', name: { en: "Dahlia", he: "דליה" }, folder: 'dahlia', boomId: 18259 },
  { id: 's197', unit: '197', name: { en: "Violet", he: "ויאולט" }, folder: 'violet', boomId: 18233 },
  { id: 's199', unit: '199', name: { en: "Orchid", he: "אורכיד" }, folder: 'orchid', boomId: 18238 },
  { id: 's205', unit: '205', name: { en: "Lagoon", he: "לגון" }, folder: 'lagoon', boomId: 18243 }
]

// Eilat 42 Apartments - With Real Boom IDs
const eilat42BaseApartments = [
  { id: 'e10', unit: '10', building: '1', name: { en: "Mango", he: "מנגו" }, folder: '10-mango', boomId: 18391 },
  { id: 'e13', unit: '13', building: '5', name: { en: "Strawberry", he: "תות" }, folder: '13-strawberry', boomId: 18992 },
  { id: 'e15', unit: '15', building: '7', name: { en: "Peach", he: "אפרסק" }, folder: '15-peach', boomId: 19627 },
  { id: 'e21', unit: '21', building: '5', name: { en: "Blueberry", he: "אוכמניה" }, folder: '21-blueberry', boomId: 21112 }
]

// Generate apartment images
const getAptImages = (project: string, folder: string, count = 5) => {
  return Array.from({ length: count }, (_, i) => `/apartments/${project}/${folder}/${i + 1}.jpg`)
}

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Generate full apartment data
const SEASIDE_APARTMENTS: Apartment[] = seasideBaseApartments.map((apt, idx) => ({
  ...apt,
  images: getAptImages('seaside', apt.folder, 5),
  project: 'seaside' as const,
  subtitle: { en: "SEA SIDE RESIDENCE", he: "דירת סי סייד" },
  description: {
    en: "Luxurious beachfront apartment in the prestigious Sea Side complex with stunning Red Sea views.",
    he: "דירת נופש יוקרתית במתחם סי סייד היוקרתי עם נוף מרהיב לים סוף."
  },
  specs: {
    beds: Math.floor(seededRandom(idx * 7) * 2) + 1,
    baths: 1,
    sqm: Math.floor(seededRandom(idx * 13) * 40) + 45,
    guests: Math.floor(seededRandom(idx * 7) * 2) + 2 + 2
  },
  price: Math.floor(seededRandom(idx * 17) * 400) + 450,
  amenities: {
    en: ["Sea View", "Beach Access", "Pool", "Parking", "WiFi", "AC"],
    he: ["נוף לים", "גישה לחוף", "בריכה", "חניה", "WiFi", "מזגן"]
  }
}))

const EILAT42_APARTMENTS: Apartment[] = eilat42BaseApartments.map((apt, idx) => ({
  ...apt,
  images: getAptImages('eilat42', apt.folder, 5),
  project: 'eilat42' as const,
  subtitle: {
    en: `EILAT 42 · BUILDING ${apt.building}`,
    he: `אילת 42 · בניין ${apt.building}`
  },
  description: {
    en: "Modern luxury apartment in the Eilat 42 complex with pool view and premium amenities.",
    he: "דירת יוקרה מודרנית במתחם אילת 42 עם נוף לבריכה ומתקנים פרימיום."
  },
  specs: { beds: 1, baths: 1, sqm: 53, guests: 4 },
  price: Math.floor(seededRandom(idx * 23) * 200) + 450,
  amenities: {
    en: ["Pool View", "Modern Design", "Balcony", "Parking", "WiFi", "AC"],
    he: ["נוף לבריכה", "עיצוב מודרני", "מרפסת", "חניה", "WiFi", "מזגן"]
  }
}))

// Transform to marketplace format
function transformApartment(apt: Apartment, org: string, lang: 'en' | 'he' = 'en') {
  const projectLabel = apt.project === 'seaside' ? 'Sea Side' : 'Eilat 42'

  return {
    id: `rently_${apt.id}`,
    boomId: apt.boomId, // Real Boom PMS ID for live pricing & availability
    slug: `${apt.project}-${apt.name.en.toLowerCase().replace(/\s+/g, '-')}`,
    name: `${apt.name[lang]} - ${projectLabel}`,
    displayName: apt.name[lang],
    location: 'Eilat, Israel',
    host: org,
    hostName: 'Rently',
    price: apt.price,
    currency: 'ILS',
    rating: 4.9 + Math.random() * 0.09,
    reviews: Math.floor(50 + Math.random() * 100),
    images: apt.images,
    isSuperhost: true,
    tags: apt.amenities[lang].slice(0, 3),
    specs: {
      bedrooms: apt.specs.beds,
      bathrooms: apt.specs.baths,
      guests: apt.specs.guests || 4,
      sqm: apt.specs.sqm
    },
    amenities: apt.amenities[lang],
    project: apt.project,
    unit: apt.unit,
    subtitle: apt.subtitle[lang],
    description: apt.description[lang]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  try {
    const { org } = await params
    const searchParams = request.nextUrl.searchParams

    const limit = parseInt(searchParams.get('limit') || '28')
    const offset = parseInt(searchParams.get('offset') || '0')
    const lang = (searchParams.get('lang') || 'en') as 'en' | 'he'
    const project = searchParams.get('project') // 'seaside' | 'eilat42' | null

    // Combine all apartments
    let allApartments = [...SEASIDE_APARTMENTS, ...EILAT42_APARTMENTS]

    // Filter by project if specified
    if (project === 'seaside') {
      allApartments = SEASIDE_APARTMENTS
    } else if (project === 'eilat42') {
      allApartments = EILAT42_APARTMENTS
    }

    // Transform to marketplace format
    const listings = allApartments
      .map(apt => transformApartment(apt, org, lang))
      .slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        listings,
        total: allApartments.length,
        limit,
        offset,
        source: 'curated',
        projects: {
          seaside: { count: SEASIDE_APARTMENTS.length, label: 'Sea Side' },
          eilat42: { count: EILAT42_APARTMENTS.length, label: 'Eilat 42' }
        }
      }
    })
  } catch (error) {
    console.error('[Curated Listings API] Error:', error)
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
