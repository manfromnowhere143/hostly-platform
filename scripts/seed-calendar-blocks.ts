/**
 * SEED CALENDAR BLOCKS - Test Data Generator
 *
 * Creates realistic calendar blocks to test availability filtering:
 * - Random OTA bookings (simulating Airbnb, Booking.com, VRBO)
 * - Owner blocks (maintenance, personal use)
 * - Weekend premium periods
 *
 * Run with: npx tsx scripts/seed-calendar-blocks.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { addDays, format, eachDayOfInterval } from 'date-fns'

const prisma = new PrismaClient()

// ════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // How many days ahead to generate data
  daysAhead: 90,

  // Probability of a property having a booking on any given week
  bookingProbability: 0.3,

  // Typical booking lengths
  bookingLengths: [2, 3, 4, 5, 7, 10, 14],

  // OTA sources for variety
  otaSources: ['airbnb', 'booking_com', 'vrbo', 'direct', 'expedia'],

  // Some properties should have more bookings (popular ones)
  popularPropertyBoost: ['prop_s3', 'prop_s80', 'prop_s199', 'prop_e10'],
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════════

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateGuestName(): { firstName: string; lastName: string } {
  const firstNames = ['James', 'Emma', 'Michael', 'Sarah', 'David', 'Rachel', 'Daniel', 'Lisa', 'Robert', 'Maria', 'Yossi', 'Noa', 'Avi', 'Maya']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Cohen', 'Levy', 'Miller', 'Anderson', 'Chen', 'Kim', 'Müller']
  return {
    firstName: randomElement(firstNames),
    lastName: randomElement(lastNames),
  }
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com']
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@${randomElement(domains)}`
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN SEEDER
// ════════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('       CALENDAR BLOCKS SEEDER')
  console.log('═══════════════════════════════════════════════════════════════\n')

  // Get all properties
  const properties = await prisma.property.findMany({
    select: { id: true, name: true, organizationId: true },
  })

  console.log(`📦 Found ${properties.length} properties\n`)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let totalReservations = 0
  let totalBlockedDays = 0

  for (const property of properties) {
    const isPopular = CONFIG.popularPropertyBoost.includes(property.id)
    const probability = isPopular ? CONFIG.bookingProbability * 1.5 : CONFIG.bookingProbability

    // Generate bookings for the next 90 days
    let currentDate = new Date(today)
    const endDate = addDays(today, CONFIG.daysAhead)

    while (currentDate < endDate) {
      // Random chance of having a booking starting around this date
      if (Math.random() < probability) {
        const bookingLength = randomElement(CONFIG.bookingLengths)
        const checkIn = addDays(currentDate, randomInt(0, 3))
        const checkOut = addDays(checkIn, bookingLength)

        // Don't extend past our window
        if (checkOut > endDate) {
          currentDate = addDays(currentDate, 7)
          continue
        }

        // Check if dates are already blocked
        const existingBlock = await prisma.calendarDay.findFirst({
          where: {
            propertyId: property.id,
            date: {
              gte: checkIn,
              lt: checkOut,
            },
            status: { in: ['booked', 'blocked'] },
          },
        })

        if (existingBlock) {
          currentDate = addDays(currentDate, 7)
          continue
        }

        // Create guest
        const { firstName, lastName } = generateGuestName()
        const email = generateEmail(firstName, lastName)
        const source = randomElement(CONFIG.otaSources)

        // Find or create guest (upsert to handle unique constraint)
        let guest = await prisma.guest.findFirst({
          where: {
            organizationId: property.organizationId,
            email,
          },
        })

        if (!guest) {
          guest = await prisma.guest.create({
            data: {
              id: `guest_seed_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              organizationId: property.organizationId,
              firstName,
              lastName,
              email,
              phone: `+972-5${randomInt(0, 9)}-${randomInt(1000000, 9999999)}`,
              tags: `seed,${source}`,
            },
          })
        }

        // Create reservation
        const confirmationCode = `${source.toUpperCase().slice(0, 3)}-${randomInt(100000, 999999)}`
        const totalPrice = randomInt(150000, 450000) // ₪1,500 - ₪4,500

        const reservation = await prisma.reservation.create({
          data: {
            id: `res_seed_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            organizationId: property.organizationId,
            propertyId: property.id,
            guestId: guest.id,
            confirmationCode,
            status: 'confirmed',
            checkIn,
            checkOut,
            adults: randomInt(1, 4),
            children: randomInt(0, 2),
            infants: 0,
            currency: 'ILS',
            accommodation: totalPrice,
            cleaningFee: 25000,
            serviceFee: Math.round(totalPrice * 0.1),
            taxes: Math.round(totalPrice * 0.17),
            total: Math.round(totalPrice * 1.27 + 25000),
            paymentStatus: 'paid',
            source: `seed_${source}`,
            confirmedAt: new Date(),
            internalNotes: `Seeded: ${source} booking`,
          },
        })

        // Block calendar dates
        const dates = eachDayOfInterval({
          start: checkIn,
          end: addDays(checkOut, -1),
        })

        for (const date of dates) {
          await prisma.calendarDay.upsert({
            where: {
              propertyId_date: { propertyId: property.id, date },
            },
            create: {
              id: `cal_seed_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              organizationId: property.organizationId,
              propertyId: property.id,
              date,
              status: 'booked',
              reservationId: reservation.id,
            },
            update: {
              status: 'booked',
              reservationId: reservation.id,
            },
          })
          totalBlockedDays++
        }

        totalReservations++

        // Skip ahead past this booking
        currentDate = addDays(checkOut, randomInt(1, 5))
      } else {
        // Move forward a week
        currentDate = addDays(currentDate, 7)
      }
    }

    // Add some maintenance blocks for variety (10% chance per property)
    if (Math.random() < 0.1) {
      const maintenanceStart = addDays(today, randomInt(30, 60))
      const maintenanceEnd = addDays(maintenanceStart, randomInt(2, 4))

      const maintenanceDates = eachDayOfInterval({
        start: maintenanceStart,
        end: addDays(maintenanceEnd, -1),
      })

      for (const date of maintenanceDates) {
        await prisma.calendarDay.upsert({
          where: {
            propertyId_date: { propertyId: property.id, date },
          },
          create: {
            id: `cal_maint_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            organizationId: property.organizationId,
            propertyId: property.id,
            date,
            status: 'blocked',
            blockReason: 'Maintenance - HVAC service',
          },
          update: {
            status: 'blocked',
            blockReason: 'Maintenance - HVAC service',
          },
        })
        totalBlockedDays++
      }
    }
  }

  // Summary
  console.log('─── RESULTS ───────────────────────────────────────────────────')
  console.log(`✅ Created ${totalReservations} reservations`)
  console.log(`✅ Blocked ${totalBlockedDays} calendar days`)

  // Show sample of blocked dates by date
  console.log('\n─── BLOCKED DATES SAMPLE ──────────────────────────────────────')

  const upcomingBlocks = await prisma.calendarDay.findMany({
    where: {
      date: { gte: today, lte: addDays(today, 14) },
      status: { in: ['booked', 'blocked'] },
    },
    include: {
      property: { select: { name: true } },
    },
    orderBy: { date: 'asc' },
    take: 20,
  })

  upcomingBlocks.forEach((block) => {
    console.log(
      `  ${format(block.date, 'yyyy-MM-dd')} | ${block.property.name.padEnd(25)} | ${block.status}`
    )
  })

  // Count available properties for next weekend
  const nextFriday = addDays(today, ((5 - today.getDay() + 7) % 7) || 7)
  const nextSunday = addDays(nextFriday, 2)

  const blockedPropertyIds = await prisma.calendarDay.findMany({
    where: {
      date: { gte: nextFriday, lt: nextSunday },
      status: { in: ['booked', 'blocked'] },
    },
    select: { propertyId: true },
    distinct: ['propertyId'],
  })

  const availableCount = properties.length - blockedPropertyIds.length

  console.log('\n─── AVAILABILITY TEST ─────────────────────────────────────────')
  console.log(`Next weekend (${format(nextFriday, 'MMM d')} - ${format(nextSunday, 'MMM d')}):`)
  console.log(`  Available: ${availableCount} / ${properties.length} properties`)

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('  SEEDING COMPLETE')
  console.log('═══════════════════════════════════════════════════════════════')

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('❌ Seeding failed:', error)
  prisma.$disconnect()
  process.exit(1)
})
