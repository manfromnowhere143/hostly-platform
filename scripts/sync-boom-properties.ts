/**
 * BOOM PROPERTY SYNC SCRIPT
 *
 * Maps Hostly properties to Boom listings by matching names.
 * Updates property metadata with boomId for calendar sync.
 *
 * Run with: npx tsx scripts/sync-boom-properties.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BOOM_API_URL = process.env.BOOM_API_URL || 'https://app.boomnow.com/open_api/v1'
const BOOM_CLIENT_ID = process.env.BOOM_CLIENT_ID
const BOOM_CLIENT_SECRET = process.env.BOOM_CLIENT_SECRET

interface BoomListing {
  id: number
  title: string
  nickname?: string
  city_name: string
  beds: number
  baths: number
  accommodates: number
}

async function getAccessToken(): Promise<string> {
  const response = await fetch(`${BOOM_API_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: BOOM_CLIENT_ID,
      client_secret: BOOM_CLIENT_SECRET,
    }),
  })

  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

async function getBoomListings(token: string): Promise<BoomListing[]> {
  const response = await fetch(`${BOOM_API_URL}/listings`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get listings: ${response.status}`)
  }

  const data = await response.json()
  return (data.listings || []).map((item: any) => item.listing || item)
}

// Normalize string for comparison
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/seaside|sea side/g, 'seaside')
    .replace(/eilat42|eilat 42/g, 'eilat42')
}

// Find best match between Hostly property and Boom listings
function findBestMatch(
  hostlyName: string,
  boomListings: BoomListing[]
): BoomListing | null {
  const normalizedHostly = normalize(hostlyName)

  // Try exact match first
  for (const listing of boomListings) {
    const normalizedTitle = normalize(listing.title || '')
    const normalizedNickname = normalize(listing.nickname || '')

    if (normalizedTitle === normalizedHostly || normalizedNickname === normalizedHostly) {
      return listing
    }
  }

  // Try partial match
  for (const listing of boomListings) {
    const normalizedTitle = normalize(listing.title || '')
    const normalizedNickname = normalize(listing.nickname || '')

    // Check if key words match
    const hostlyWords = normalizedHostly.split(/\s+/)
    const titleWords = normalizedTitle.split(/\s+/)

    const commonWords = hostlyWords.filter(w =>
      titleWords.includes(w) || normalizedTitle.includes(w)
    )

    if (commonWords.length >= 2) {
      return listing
    }
  }

  return null
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('       BOOM PROPERTY MAPPING')
  console.log('═══════════════════════════════════════════════════════════════\n')

  if (!BOOM_CLIENT_ID || !BOOM_CLIENT_SECRET) {
    console.error('❌ BOOM_CLIENT_ID and BOOM_CLIENT_SECRET must be set')
    process.exit(1)
  }

  try {
    // Get Boom listings
    console.log('📡 Fetching Boom listings...')
    const token = await getAccessToken()
    const boomListings = await getBoomListings(token)
    console.log(`   Found ${boomListings.length} listings in Boom\n`)

    // Get Hostly properties
    console.log('📦 Fetching Hostly properties...')
    const hostlyProperties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        metadata: true,
      },
    })
    console.log(`   Found ${hostlyProperties.length} properties in Hostly\n`)

    // Display Boom listings for reference
    console.log('─── BOOM LISTINGS ─────────────────────────────────────────────')
    boomListings.forEach((l, i) => {
      console.log(`${i + 1}. [${l.id}] ${l.title}`)
    })
    console.log('')

    // Match and update
    console.log('─── MAPPING RESULTS ───────────────────────────────────────────')

    let mapped = 0
    let skipped = 0
    let notFound = 0

    for (const property of hostlyProperties) {
      const existingBoomId = (property.metadata as any)?.boomId

      if (existingBoomId) {
        console.log(`⏭️  ${property.name} - Already mapped to Boom ID ${existingBoomId}`)
        skipped++
        continue
      }

      const match = findBestMatch(property.name, boomListings)

      if (match) {
        console.log(`✅ ${property.name}`)
        console.log(`   → Matched to: [${match.id}] ${match.title}`)

        // Update property metadata with boomId
        const currentMetadata = (property.metadata as Record<string, any>) || {}
        await prisma.property.update({
          where: { id: property.id },
          data: {
            metadata: {
              ...currentMetadata,
              boomId: match.id,
              boomTitle: match.title,
              boomSyncedAt: new Date().toISOString(),
            },
          },
        })

        mapped++
      } else {
        console.log(`❌ ${property.name}`)
        console.log(`   → No match found in Boom`)
        notFound++
      }
    }

    console.log('')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`  SUMMARY`)
    console.log(`  ───────`)
    console.log(`  Mapped:    ${mapped}`)
    console.log(`  Skipped:   ${skipped} (already mapped)`)
    console.log(`  Not found: ${notFound}`)
    console.log('═══════════════════════════════════════════════════════════════')

    if (notFound > 0) {
      console.log('\n⚠️  Some properties could not be auto-matched.')
      console.log('   You can manually set boomId in the property metadata.')
      console.log('   Use the Boom IDs listed above.')
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
