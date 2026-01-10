/**
 * Test Boom PMS Connection
 *
 * Run with: npx tsx scripts/test-boom.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

const BOOM_API_URL = process.env.BOOM_API_URL || 'https://app.boomnow.com/open_api/v1'
const BOOM_CLIENT_ID = process.env.BOOM_CLIENT_ID
const BOOM_CLIENT_SECRET = process.env.BOOM_CLIENT_SECRET

async function getAccessToken(): Promise<string> {
  console.log('🔐 Getting Boom access token...')
  console.log(`   Client ID: ${BOOM_CLIENT_ID?.slice(0, 10)}...`)

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
    const error = await response.text()
    throw new Error(`Auth failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log('✅ Got access token!')
  return data.access_token
}

async function getProperties(token: string) {
  console.log('\n📋 Fetching listings from Boom...')

  const response = await fetch(`${BOOM_API_URL}/listings`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get properties: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.listings || data
}

async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('       BOOM PMS CONNECTION TEST')
  console.log('═══════════════════════════════════════════════════\n')

  if (!BOOM_CLIENT_ID || !BOOM_CLIENT_SECRET) {
    console.error('❌ BOOM_CLIENT_ID and BOOM_CLIENT_SECRET must be set in .env.local')
    process.exit(1)
  }

  try {
    // Get token
    const token = await getAccessToken()

    // Get properties
    const properties = await getProperties(token)

    console.log(`\n✅ Found ${properties.length} listings in Boom:\n`)

    properties.forEach((prop: any, i: number) => {
      const listing = prop.listing || prop
      console.log(`${i + 1}. ${listing.title || listing.nickname}`)
      console.log(`   ID: ${listing.id}`)
      console.log(`   City: ${listing.city_name}`)
      console.log(`   Beds: ${listing.beds} | Baths: ${listing.baths}`)
      console.log(`   Max Guests: ${listing.accommodates}`)
      console.log('')
    })

    console.log('═══════════════════════════════════════════════════')
    console.log('To sync these with Hostly, add their IDs to property metadata')
    console.log('═══════════════════════════════════════════════════')

  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

main()
