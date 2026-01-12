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
  // Password for info@rently.co.il is: aces1988
  const passwordHash = await bcrypt.hash('aces1988', 12)

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

  // Create owner user (info@rently.co.il / aces1988)
  await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: rently.id,
        email: 'info@rently.co.il',
      },
    },
    update: {
      passwordHash, // Update password if user exists
    },
    create: {
      id: 'user_rently_admin',
      organizationId: rently.id,
      email: 'info@rently.co.il',
      passwordHash,
      name: 'Rently Admin',
      role: 'owner',
      permissions: '*',
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

  // ══════════════════════════════════════════════════════════════════════════
  // RENTLY LUXURY PROPERTIES - Actual Properties from Website
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // Sea Side Residence apartments - SYNCED WITH RENTLY CONFIG
  // ══════════════════════════════════════════════════════════════════════════
  const seasideApartments = [
    { id: 'prop_s3', unit: '3', name: 'Mykonos', slug: 'seaside-mykonos', beds: 2 },
    { id: 'prop_s22', unit: '22', name: 'Poppy', slug: 'seaside-poppy', beds: 1 },
    { id: 'prop_s29', unit: '29', name: 'Lily', slug: 'seaside-lily', beds: 2 },
    { id: 'prop_s33', unit: '33', name: 'Camellia', slug: 'seaside-camellia', beds: 2 },
    { id: 'prop_s49', unit: '49', name: 'Ivy', slug: 'seaside-ivy', beds: 1 },
    { id: 'prop_s62', unit: '62', name: 'Zinnia', slug: 'seaside-zinnia', beds: 2 },
    { id: 'prop_s63', unit: '63', name: 'Daisy', slug: 'seaside-daisy', beds: 1 },
    { id: 'prop_s78', unit: '78', name: 'Clover', slug: 'seaside-clover', beds: 2 },
    { id: 'prop_s79', unit: '79', name: 'Tranquil', slug: 'seaside-tranquil', beds: 1 },
    { id: 'prop_s80', unit: '80', name: 'Rose', slug: 'seaside-rose', beds: 2 },
    { id: 'prop_s81', unit: '81', name: 'Rosy', slug: 'seaside-rosy', beds: 1 },
    { id: 'prop_s86', unit: '86', name: 'Flora', slug: 'seaside-flora', beds: 2 },
    { id: 'prop_s95', unit: '95', name: 'Zinnia II', slug: 'seaside-zinnia-ii', beds: 1 },
    { id: 'prop_s111', unit: '111', name: 'Jasmine', slug: 'seaside-jasmine', beds: 2 },
    { id: 'prop_s129', unit: '129', name: 'Marigold', slug: 'seaside-marigold', beds: 1 },
    { id: 'prop_s140', unit: '140', name: 'Laura', slug: 'seaside-laura', beds: 2 },
    { id: 'prop_s151', unit: '151', name: 'Tulip', slug: 'seaside-tulip', beds: 2 },
    { id: 'prop_s159', unit: '159', name: 'Lavender', slug: 'seaside-lavender', beds: 1 },
    { id: 'prop_s167', unit: '167', name: 'Lotus', slug: 'seaside-lotus', beds: 2 },
    { id: 'prop_s168', unit: '168', name: 'Sunflower', slug: 'seaside-sunflower', beds: 2 },
    { id: 'prop_s172', unit: '172', name: 'Dahlia', slug: 'seaside-dahlia', beds: 1 },
    { id: 'prop_s197', unit: '197', name: 'Violet', slug: 'seaside-violet', beds: 1 },
    { id: 'prop_s199', unit: '199', name: 'Orchid', slug: 'seaside-orchid', beds: 2 },
    { id: 'prop_s205', unit: '205', name: 'Lagoon', slug: 'seaside-lagoon', beds: 2 },
  ]

  // ══════════════════════════════════════════════════════════════════════════
  // Eilat 42 apartments - SYNCED WITH RENTLY CONFIG
  // ══════════════════════════════════════════════════════════════════════════
  const eilat42Apartments = [
    { id: 'prop_e10', unit: '10', building: '1', name: 'Mango', slug: 'eilat42-mango', beds: 1 },
    { id: 'prop_e13', unit: '13', building: '5', name: 'Strawberry', slug: 'eilat42-strawberry', beds: 1 },
    { id: 'prop_e15', unit: '15', building: '7', name: 'Peach', slug: 'eilat42-peach', beds: 1 },
    { id: 'prop_e21', unit: '21', building: '5', name: 'Blueberry', slug: 'eilat42-blueberry', beds: 1 },
  ]

  // Convert to property objects
  const properties = [
    // Sea Side Residence properties - Premium beachfront (₪850-1300/night)
    ...seasideApartments.map((apt) => ({
      id: apt.id,
      name: `${apt.name} - Sea Side #${apt.unit}`,
      slug: apt.slug,
      type: 'apartment',
      description: `Luxurious beachfront apartment in the prestigious Sea Side Residence. Unit ${apt.unit} "${apt.name}" features stunning Red Sea views, premium finishes, and direct beach access.`,
      address: {
        street: `Sea Side Residence, Unit ${apt.unit}`,
        city: 'Eilat',
        country: 'Israel',
        zip: '88000',
      },
      coordinates: { lat: 29.5581, lng: 34.9482 },
      maxGuests: apt.beds * 2 + 1,
      bedrooms: apt.beds,
      beds: apt.beds + 1,
      bathrooms: 1,
      basePrice: 85000, // ₪850/night base rate
      currency: 'ILS',
      cleaningFee: 25000, // ₪250
      minNights: 2,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      status: 'active',
      publishedAt: new Date(),
      metadata: {
        project: 'seaside',
        unit: apt.unit,
        aptName: apt.name,
        weekendRate: 110000, // ₪1,100
        holidayRate: 130000, // ₪1,300
      },
    })),

    // Eilat 42 properties - Modern resort (₪750-1150/night)
    ...eilat42Apartments.map((apt) => ({
      id: apt.id,
      name: `${apt.name} - Eilat 42 #${apt.unit}`,
      slug: apt.slug,
      type: 'apartment',
      description: `Modern luxury apartment in Eilat 42 resort complex. Unit ${apt.unit} "${apt.name}" in Building ${apt.building} with pool views, premium amenities, and resort access.`,
      address: {
        street: `Eilat 42, Building ${apt.building}, Unit ${apt.unit}`,
        city: 'Eilat',
        country: 'Israel',
        zip: '88000',
      },
      coordinates: { lat: 29.5541, lng: 34.9462 },
      maxGuests: 4,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      basePrice: 75000, // ₪750/night base rate
      currency: 'ILS',
      cleaningFee: 25000, // ₪250
      minNights: 2,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      status: 'active',
      publishedAt: new Date(),
      metadata: {
        project: 'eilat42',
        unit: apt.unit,
        building: apt.building,
        aptName: apt.name,
        weekendRate: 95000, // ₪950
        holidayRate: 115000, // ₪1,150
      },
    })),
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
