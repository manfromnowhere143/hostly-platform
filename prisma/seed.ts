import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create amenities
  const amenities = [
    { id: 'amenity_wifi', name: 'WiFi', icon: 'wifi', category: 'technology' },
    { id: 'amenity_ac', name: 'Air Conditioning', icon: 'snowflake', category: 'comfort' },
    { id: 'amenity_heating', name: 'Heating', icon: 'flame', category: 'comfort' },
    { id: 'amenity_kitchen', name: 'Kitchen', icon: 'utensils', category: 'comfort' },
    { id: 'amenity_washer', name: 'Washer', icon: 'washer', category: 'comfort' },
    { id: 'amenity_dryer', name: 'Dryer', icon: 'wind', category: 'comfort' },
    { id: 'amenity_tv', name: 'Smart TV', icon: 'tv', category: 'technology' },
    { id: 'amenity_pool', name: 'Pool', icon: 'pool', category: 'outdoor' },
    { id: 'amenity_parking', name: 'Free Parking', icon: 'car', category: 'outdoor' },
    { id: 'amenity_gym', name: 'Gym', icon: 'dumbbell', category: 'outdoor' },
    { id: 'amenity_balcony', name: 'Balcony', icon: 'sun', category: 'outdoor' },
    { id: 'amenity_view', name: 'Sea View', icon: 'waves', category: 'outdoor' },
    { id: 'amenity_security', name: '24/7 Security', icon: 'shield', category: 'safety' },
    { id: 'amenity_elevator', name: 'Elevator', icon: 'elevator', category: 'safety' },
  ]

  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { id: amenity.id },
      update: amenity,
      create: amenity,
    })
  }

  console.log('Created amenities')

  // Create Rently organization
  const passwordHash = await bcrypt.hash('password123', 12)

  const rently = await prisma.organization.upsert({
    where: { slug: 'rently' },
    update: {},
    create: {
      id: 'org_rently',
      name: 'Rently Luxury',
      slug: 'rently',
      plan: 'pro',
      settings: {
        timezone: 'Asia/Jerusalem',
        currency: 'ILS',
        locale: 'he-IL',
      },
      branding: {
        primaryColor: '#B5846D',
        logo: '/logo.png',
      },
    },
  })

  console.log('Created Rently organization')

  // Create owner user
  await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: rently.id,
        email: 'admin@rently.com',
      },
    },
    update: {},
    create: {
      id: 'user_rently_admin',
      organizationId: rently.id,
      email: 'admin@rently.com',
      passwordHash,
      name: 'Rently Admin',
      role: 'owner',
      permissions: ['*'],
      emailVerified: true,
    },
  })

  console.log('Created admin user')

  // Create website
  await prisma.website.upsert({
    where: { organizationId: rently.id },
    update: {},
    create: {
      organizationId: rently.id,
      subdomain: 'rently',
      customDomain: 'rently-luxury.com',
      domainVerified: true,
      template: 'luxury',
      theme: {
        primaryColor: '#B5846D',
        secondaryColor: '#1a1a1a',
        font: 'Cormorant Garamond',
      },
      seo: {
        title: 'Rently Luxury - Premium Vacation Rentals in Eilat',
        description: 'Experience luxury living in Eilat with our premium vacation apartments.',
      },
      status: 'published',
      publishedAt: new Date(),
    },
  })

  console.log('Created website')

  // Create sample properties
  const properties = [
    {
      id: 'prop_penthouse',
      name: 'Penthouse Suite',
      slug: 'penthouse-suite',
      type: 'apartment',
      description: 'Stunning penthouse with panoramic sea views and modern luxury amenities.',
      address: {
        street: '123 Palm Beach Road',
        city: 'Eilat',
        country: 'Israel',
        zip: '88000',
      },
      coordinates: { lat: 29.5581, lng: 34.9482 },
      maxGuests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      basePrice: 150000, // 1500 ILS in cents
      currency: 'ILS',
      cleaningFee: 30000,
      status: 'active',
      publishedAt: new Date(),
    },
    {
      id: 'prop_garden',
      name: 'Garden Villa',
      slug: 'garden-villa',
      type: 'villa',
      description: 'Private villa with beautiful garden and pool access.',
      address: {
        street: '456 Coral Bay',
        city: 'Eilat',
        country: 'Israel',
        zip: '88000',
      },
      coordinates: { lat: 29.5501, lng: 34.9412 },
      maxGuests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3,
      basePrice: 200000,
      currency: 'ILS',
      cleaningFee: 40000,
      status: 'active',
      publishedAt: new Date(),
    },
    {
      id: 'prop_studio',
      name: 'Cozy Studio',
      slug: 'cozy-studio',
      type: 'apartment',
      description: 'Modern studio apartment perfect for couples.',
      address: {
        street: '789 Sunset Boulevard',
        city: 'Eilat',
        country: 'Israel',
        zip: '88000',
      },
      coordinates: { lat: 29.5521, lng: 34.9452 },
      maxGuests: 2,
      bedrooms: 0,
      beds: 1,
      bathrooms: 1,
      basePrice: 60000,
      currency: 'ILS',
      cleaningFee: 15000,
      status: 'active',
      publishedAt: new Date(),
    },
  ]

  for (const prop of properties) {
    await prisma.property.upsert({
      where: {
        organizationId_slug: {
          organizationId: rently.id,
          slug: prop.slug,
        },
      },
      update: {},
      create: {
        ...prop,
        organizationId: rently.id,
        timezone: 'Asia/Jerusalem',
      },
    })
  }

  console.log('Created sample properties')

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
