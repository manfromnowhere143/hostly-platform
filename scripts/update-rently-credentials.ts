// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE RENTLY CREDENTIALS
// ═══════════════════════════════════════════════════════════════════════════════
// Updates the Rently admin user with proper credentials
// Run: npx ts-node scripts/update-rently-credentials.ts
// ═══════════════════════════════════════════════════════════════════════════════

import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating Rently credentials...')

  // New credentials
  const email = 'info@rently.co.il'
  const password = 'aces1988'
  const passwordHash = await bcrypt.hash(password, 12)

  // Get the Rently organization
  const rently = await prisma.organization.findUnique({
    where: { slug: 'rently' },
  })

  if (!rently) {
    console.error('Rently organization not found!')
    return
  }

  // Update existing admin user OR create if not exists
  const existingUser = await prisma.user.findFirst({
    where: {
      organizationId: rently.id,
      role: 'owner',
    },
  })

  if (existingUser) {
    // Update existing user
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        email,
        passwordHash,
        name: 'Rently Admin',
        emailVerified: true,
        status: 'active',
      },
    })
    console.log(`Updated existing user: ${existingUser.id}`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
  } else {
    // Create new user
    await prisma.user.create({
      data: {
        id: 'user_rently_admin',
        organizationId: rently.id,
        email,
        passwordHash,
        name: 'Rently Admin',
        role: 'owner',
        permissions: '*',
        emailVerified: true,
        status: 'active',
      },
    })
    console.log(`Created new admin user`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
  }

  console.log('\nRently credentials updated successfully!')
  console.log('You can now login at /portal/login with:')
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
