/**
 * MANUAL BOOM PROPERTY MAPPING
 *
 * Maps Hostly properties to Boom listings manually.
 * Edit the MAPPINGS array below to link properties.
 *
 * Run with: npx tsx scripts/manual-boom-mapping.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ════════════════════════════════════════════════════════════════════════════════
// EDIT THIS MAPPING
// Format: [Hostly Property Name, Boom Listing ID]
// ════════════════════════════════════════════════════════════════════════════════

const MAPPINGS: [string, number][] = [
  // Sea Side Properties
  ['Mykonos - Sea Side #3', 18250],           // Studio With Balcony And Sea View At Sea Side
  ['Poppy - Sea Side #22', 18270],            // luxury apartment 1 BR with balcony
  ['Lily - Sea Side #29', 19635],             // amazing Studio With Balcony & Sea View
  ['Camellia - Sea Side #33', 22470],         // luxury design apartment with balcony
  ['Ivy - Sea Side #49', 21102],              // luxury apartment 1 BR with balcony
  ['Zinnia - Sea Side #62', 18271],           // luxury apartment 1 BR with balcony
  ['Daisy - Sea Side #63', 18259],            // Studio With Sea View At Sea Side
  ['Clover - Sea Side #78', 18253],           // Studio With Balcony & Sea View
  ['Tranquil - Sea Side #79', 18239],         // Luxury Studio With Balcony & Sea View
  ['Rose - Sea Side #80', 18261],             // luxurious presidential suite
  ['Rosy - Sea Side #81', 18268],             // luxury 2.5 rooms apartment
  ['Flora - Sea Side #86', 18265],            // luxury 2 bedroom apartment
  ['Zinnia II - Sea Side #95', 18267],        // Luxury 2.5 BR apartment
  ['Jasmine - Sea Side #111', 18266],         // luxury 2.5 BR apartment
  ['Marigold - Sea Side #129', 18249],        // Shangri-La premium studio
  ['Laura - Sea Side #140', 18244],           // Luxury Suite With Balcony And Jacuzzi
  ['Tulip - Sea Side #151', 18234],           // Luxury Studio With Balcony & Sea View
  ['Lavender - Sea Side #159', 18272],        // luxury apartment with balcony
  ['Lotus - Sea Side #167', 18248],           // Parter Studio At Sea Side
  ['Sunflower - Sea Side #168', 19651],       // luxury apartment with balcony
  ['Dahlia - Sea Side #172', 18264],          // luxury 2 bedroom apartment
  ['Violet - Sea Side #197', 18233],          // Luxury Studio With Balcony & Sea View
  ['Orchid - Sea Side #199', 18238],          // Luxury Studio With Balcony & Sea View
  ['Lagoon - Sea Side #205', 18243],          // Luxury Studio With Balcony

  // Eilat 42 Properties
  ['Mango - Eilat 42 #10', 21112],            // amazing apartment at eilat 42 complex
  ['Strawberry - Eilat 42 #13', 18391],       // apartment with mountain view
  ['Peach - Eilat 42 #15', 18992],            // luxury apartment at Eilat 42
  ['Blueberry - Eilat 42 #21', 19627],        // premium apartment at eilat 42
]

// ════════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('       MANUAL BOOM PROPERTY MAPPING')
  console.log('═══════════════════════════════════════════════════════════════\n')

  let success = 0
  let failed = 0

  for (const [hostlyName, boomId] of MAPPINGS) {
    try {
      // Find property by name
      const property = await prisma.property.findFirst({
        where: { name: hostlyName },
      })

      if (!property) {
        console.log(`❌ "${hostlyName}" - Not found in Hostly`)
        failed++
        continue
      }

      // Update metadata with boomId
      const currentMetadata = (property.metadata as Record<string, any>) || {}
      await prisma.property.update({
        where: { id: property.id },
        data: {
          metadata: {
            ...currentMetadata,
            boomId: boomId,
            boomSyncedAt: new Date().toISOString(),
          },
        },
      })

      console.log(`✅ "${hostlyName}" → Boom ID ${boomId}`)
      success++

    } catch (error) {
      console.log(`❌ "${hostlyName}" - Error: ${error}`)
      failed++
    }
  }

  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`  SUCCESS: ${success} | FAILED: ${failed}`)
  console.log('═══════════════════════════════════════════════════════════════')

  await prisma.$disconnect()
}

main()
