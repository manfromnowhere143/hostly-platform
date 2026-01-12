// ═══════════════════════════════════════════════════════════════════════════════
// HOST FRONT PAGE SPEC v1 - "TASTE AS CODE"
// ═══════════════════════════════════════════════════════════════════════════════
// This schema defines the contract for host landing pages.
// Hosts don't design freely - they fill in content within guardrails.
// The system produces Rently-level polish automatically.
// ═══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─── Template Rigs ──────────────────────────────────────────────────────────────
// Predefined design systems that ensure consistent quality
export const TemplateRigSchema = z.enum([
  'cinematic-luxury',   // Rently DNA: dark hero, gold accents, video-first
  'resort-hotel',       // Light, airy, Mediterranean feel
  'urban-minimal',      // Clean, modern, city apartments
  'boutique-cozy',      // Warm, intimate, bed & breakfast style
])

export type TemplateRig = z.infer<typeof TemplateRigSchema>

// ─── Brand Settings ─────────────────────────────────────────────────────────────
// Limited knobs - not a full theme builder
export const BrandSettingsSchema = z.object({
  // Logo
  logo: z.object({
    url: z.string().url(),
    alt: z.string().max(100),
    width: z.number().int().min(50).max(400).optional(),
    height: z.number().int().min(20).max(200).optional(),
  }).optional(),

  // Accent color - single primary accent (template handles the rest)
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be hex color').optional(),

  // Typography preset - not full font control
  fontPreset: z.enum([
    'editorial',    // Serif headings, elegant
    'modern',       // Sans-serif, clean
    'luxury',       // Thin weights, refined spacing
    'friendly',     // Rounded, approachable
  ]).default('luxury'),

  // Contact info (required)
  contact: z.object({
    phone: z.string().min(1),
    email: z.string().email(),
    whatsapp: z.string().url().optional(),
  }),

  // Social links (optional)
  social: z.object({
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    youtube: z.string().url().optional(),
  }).optional(),

  // Location
  location: z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).optional(),
    wazeUrl: z.string().url().optional(),
    googleMapsUrl: z.string().url().optional(),
  }),
})

export type BrandSettings = z.infer<typeof BrandSettingsSchema>

// ─── Media Assets ───────────────────────────────────────────────────────────────
// Hero video, gallery images, etc.
export const MediaAssetSchema = z.object({
  url: z.string().url(),
  type: z.enum(['image', 'video']),
  alt: z.string().max(200).optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  blurhash: z.string().optional(), // For progressive loading
  thumbnail: z.string().url().optional(), // Video poster/thumbnail
})

export type MediaAsset = z.infer<typeof MediaAssetSchema>

export const MediaAssetsSchema = z.object({
  // Hero media (video or image gallery for hero section)
  heroVideo: z.object({
    url: z.string().url(),
    poster: z.string().url().optional(), // Fallback image
    mobileUrl: z.string().url().optional(), // Lower res for mobile
  }).optional(),

  heroImages: z.array(z.string().url()).min(1).max(10),

  // Property gallery (used in featured listings)
  gallery: z.array(MediaAssetSchema).max(50).optional(),
})

export type MediaAssets = z.infer<typeof MediaAssetsSchema>

// ─── Bilingual Text ─────────────────────────────────────────────────────────────
// Support for multiple languages (Hebrew/English primary)
export const BilingualTextSchema = z.object({
  en: z.string(),
  he: z.string().optional(),
})

export type BilingualText = z.infer<typeof BilingualTextSchema>

// Helper for required bilingual
export const RequiredBilingualTextSchema = z.object({
  en: z.string().min(1),
  he: z.string().min(1),
})

// ─── Section Types ──────────────────────────────────────────────────────────────
// Each section type has its own schema

// HERO SECTION - Full-screen video/image with text overlay
export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  eyebrow: BilingualTextSchema.optional(), // "EILAT · RED SEA · ISRAEL"
  title: BilingualTextSchema, // "Welcome to Rently"
  subtitle: BilingualTextSchema.optional(), // Multi-line description
  ctaText: BilingualTextSchema.optional(), // Button text
  ctaAction: z.enum(['scroll-to-listings', 'open-booking', 'scroll-to-contact']).default('scroll-to-listings'),
})

export type HeroSection = z.infer<typeof HeroSectionSchema>

// TRUST BAR - Social proof / trust signals
export const TrustBarSectionSchema = z.object({
  type: z.literal('trust-bar'),
  items: z.array(z.object({
    icon: z.enum(['star', 'shield', 'award', 'heart', 'check', 'home', 'users', 'calendar']),
    value: z.string(), // "4.9" or "500+"
    label: BilingualTextSchema, // "Rating" or "Happy Guests"
  })).min(2).max(6),
})

export type TrustBarSection = z.infer<typeof TrustBarSectionSchema>

// STORY SECTION - About the host / property story
export const StorySectionSchema = z.object({
  type: z.literal('story'),
  eyebrow: BilingualTextSchema.optional(),
  title: BilingualTextSchema,
  paragraphs: z.array(BilingualTextSchema).min(1).max(4),
  image: z.object({
    url: z.string().url(),
    alt: BilingualTextSchema.optional(),
  }).optional(),
  layout: z.enum(['text-left', 'text-right', 'centered']).default('text-left'),
})

export type StorySection = z.infer<typeof StorySectionSchema>

// FEATURED LISTINGS - Property cards
export const FeaturedListingsSectionSchema = z.object({
  type: z.literal('featured-listings'),
  eyebrow: BilingualTextSchema.optional(),
  title: BilingualTextSchema,
  subtitle: BilingualTextSchema.optional(),
  // Properties pulled from database by IDs or show all
  propertyIds: z.array(z.string()).optional(), // If empty, show all host properties
  layout: z.enum(['grid', 'carousel', 'featured-first']).default('grid'),
  showPricing: z.boolean().default(true),
})

export type FeaturedListingsSection = z.infer<typeof FeaturedListingsSectionSchema>

// AMENITIES HIGHLIGHTS - Feature grid
export const AmenitiesHighlightsSectionSchema = z.object({
  type: z.literal('amenities-highlights'),
  eyebrow: BilingualTextSchema.optional(),
  title: BilingualTextSchema,
  items: z.array(z.object({
    icon: z.enum([
      'pool', 'spa', 'beach', 'gym', 'wifi', 'parking',
      'kitchen', 'ac', 'tv', 'washer', 'balcony', 'view',
      'pets', 'breakfast', 'concierge', 'security', 'elevator', 'garden'
    ]),
    name: BilingualTextSchema,
    description: BilingualTextSchema.optional(),
  })).min(2).max(12),
  layout: z.enum(['grid-2', 'grid-3', 'grid-4', 'list']).default('grid-4'),
})

export type AmenitiesHighlightsSection = z.infer<typeof AmenitiesHighlightsSectionSchema>

// EXPERIENCE HIGHLIGHTS - Numbered feature list (like Rently's 01, 02, 03)
export const ExperienceHighlightsSectionSchema = z.object({
  type: z.literal('experience-highlights'),
  eyebrow: BilingualTextSchema.optional(),
  title: BilingualTextSchema,
  items: z.array(z.object({
    number: z.string().max(3), // "01", "02", etc.
    name: BilingualTextSchema,
    description: BilingualTextSchema,
  })).min(2).max(6),
})

export type ExperienceHighlightsSection = z.infer<typeof ExperienceHighlightsSectionSchema>

// TESTIMONIALS - Guest reviews
export const TestimonialsSectionSchema = z.object({
  type: z.literal('testimonials'),
  eyebrow: BilingualTextSchema.optional(),
  title: BilingualTextSchema,
  items: z.array(z.object({
    quote: BilingualTextSchema,
    author: z.string(),
    source: z.enum(['google', 'airbnb', 'booking', 'direct']).optional(),
    rating: z.number().min(1).max(5).optional(),
    date: z.string().optional(), // "January 2024"
  })).min(1).max(10),
  layout: z.enum(['carousel', 'grid', 'featured']).default('carousel'),
})

export type TestimonialsSection = z.infer<typeof TestimonialsSectionSchema>

// GALLERY SECTION - Image grid/carousel
export const GallerySectionSchema = z.object({
  type: z.literal('gallery'),
  eyebrow: BilingualTextSchema.optional(),
  title: BilingualTextSchema.optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: BilingualTextSchema.optional(),
    caption: BilingualTextSchema.optional(),
  })).min(3).max(20),
  layout: z.enum(['masonry', 'grid', 'carousel', 'lightbox-grid']).default('grid'),
})

export type GallerySection = z.infer<typeof GallerySectionSchema>

// BOOKING CTA - Call to action section
export const BookingCTASectionSchema = z.object({
  type: z.literal('booking-cta'),
  eyebrow: BilingualTextSchema.optional(),
  title: BilingualTextSchema,
  subtitle: BilingualTextSchema.optional(),
  primaryCta: z.object({
    text: BilingualTextSchema,
    action: z.enum(['open-booking', 'scroll-to-listings', 'external-link']),
    url: z.string().url().optional(), // For external-link
  }),
  secondaryCta: z.object({
    text: BilingualTextSchema,
    action: z.enum(['whatsapp', 'phone', 'email']),
  }).optional(),
  showContactInfo: z.boolean().default(true),
})

export type BookingCTASection = z.infer<typeof BookingCTASectionSchema>

// FOOTER - Page footer
export const FooterSectionSchema = z.object({
  type: z.literal('footer'),
  showSocialLinks: z.boolean().default(true),
  showContactInfo: z.boolean().default(true),
  showNavLinks: z.boolean().default(true),
  copyrightText: BilingualTextSchema.optional(),
  showPoweredBy: z.boolean().default(true), // "Powered by Hostly"
})

export type FooterSection = z.infer<typeof FooterSectionSchema>

// ─── Union of All Sections ──────────────────────────────────────────────────────
export const SectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  TrustBarSectionSchema,
  StorySectionSchema,
  FeaturedListingsSectionSchema,
  AmenitiesHighlightsSectionSchema,
  ExperienceHighlightsSectionSchema,
  TestimonialsSectionSchema,
  GallerySectionSchema,
  BookingCTASectionSchema,
  FooterSectionSchema,
])

export type Section = z.infer<typeof SectionSchema>

// ─── SEO Pack ───────────────────────────────────────────────────────────────────
export const SEOPackSchema = z.object({
  title: BilingualTextSchema,
  description: BilingualTextSchema,
  keywords: z.array(z.string()).max(20).optional(),
  ogImage: z.string().url().optional(),
  favicon: z.string().url().optional(),
  // Structured data hints
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
  propertyType: z.enum(['hotel', 'vacation_rental', 'resort', 'bed_and_breakfast']).optional(),
})

export type SEOPack = z.infer<typeof SEOPackSchema>

// ─── Analytics & Tracking ───────────────────────────────────────────────────────
export const AnalyticsConfigSchema = z.object({
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  customScripts: z.array(z.object({
    name: z.string(),
    src: z.string().url().optional(),
    inline: z.string().optional(),
    position: z.enum(['head', 'body-start', 'body-end']),
  })).max(5).optional(),
})

export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SPEC - HOST FRONT PAGE SPEC v1
// ═══════════════════════════════════════════════════════════════════════════════
export const HostFrontPageSpecSchema = z.object({
  // Spec version for migrations
  version: z.literal('1.0'),

  // Template selection (determines base styling)
  templateRig: TemplateRigSchema,

  // Brand settings (limited customization)
  brand: BrandSettingsSchema,

  // Media assets (hero video, images)
  media: MediaAssetsSchema,

  // Page sections in order (hero must be first)
  sections: z.array(SectionSchema)
    .min(2) // At minimum: hero + footer
    .max(15)
    .refine(
      (sections) => sections[0]?.type === 'hero',
      { message: 'First section must be hero' }
    )
    .refine(
      (sections) => sections[sections.length - 1]?.type === 'footer',
      { message: 'Last section must be footer' }
    ),

  // SEO configuration
  seo: SEOPackSchema,

  // Analytics (optional)
  analytics: AnalyticsConfigSchema.optional(),

  // Feature flags
  features: z.object({
    enableBookingWidget: z.boolean().default(true),
    enableLanguageToggle: z.boolean().default(true),
    enableThemeToggle: z.boolean().default(false), // Dark/light mode
    enableLiveChat: z.boolean().default(false),
  }).optional(),
})

export type HostFrontPageSpec = z.infer<typeof HostFrontPageSpecSchema>

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates a HostFrontPageSpec object
 * @returns SafeParseResult with success and data/error
 */
export function validateSpec(spec: unknown) {
  return HostFrontPageSpecSchema.safeParse(spec)
}

/**
 * Validates and throws on error
 */
export function parseSpec(spec: unknown): HostFrontPageSpec {
  return HostFrontPageSpecSchema.parse(spec)
}

/**
 * Creates a minimal valid spec with defaults
 */
export function createMinimalSpec(overrides: Partial<HostFrontPageSpec>): HostFrontPageSpec {
  const minimal: HostFrontPageSpec = {
    version: '1.0',
    templateRig: 'cinematic-luxury',
    brand: {
      fontPreset: 'luxury',
      contact: {
        phone: '',
        email: '',
      },
      location: {
        name: '',
      },
    },
    media: {
      heroImages: [],
    },
    sections: [
      {
        type: 'hero',
        title: { en: '' },
        ctaAction: 'scroll-to-listings',
      },
      {
        type: 'footer',
        showSocialLinks: true,
        showContactInfo: true,
        showNavLinks: true,
        showPoweredBy: true,
      },
    ],
    seo: {
      title: { en: '' },
      description: { en: '' },
    },
    ...overrides,
  }
  return minimal
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE SPEC (RENTLY REFERENCE)
// ═══════════════════════════════════════════════════════════════════════════════
export const RENTLY_REFERENCE_SPEC: HostFrontPageSpec = {
  version: '1.0',
  templateRig: 'cinematic-luxury',

  brand: {
    accentColor: '#B5846D', // Rently gold/copper
    fontPreset: 'luxury',
    contact: {
      phone: '+972506111747',
      email: 'info@rently.co.il',
      whatsapp: 'https://wa.me/972506111747',
    },
    social: {
      instagram: 'https://www.instagram.com/rently.ys/',
      facebook: 'https://www.facebook.com/Rentlyys',
    },
    location: {
      name: 'Eilat, Israel',
      address: 'Eilat, Red Sea, Israel',
      coordinates: { lat: 29.548566, lng: 34.951952 },
      wazeUrl: 'https://www.waze.com/live-map/directions?to=ll.29.548566%2C34.951952',
    },
  },

  media: {
    heroVideo: {
      url: 'https://xkmvvdvft005bytr.public.blob.vercel-storage.com/1767634443013-IMG_4784.mov',
    },
    heroImages: [
      'https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634337893-l3jtei-PHOTO-2025-12-28-21-24-01_2.jpg',
      'https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634340731-dhswbh-PHOTO-2025-12-28-21-24-01.jpg',
    ],
  },

  sections: [
    {
      type: 'hero',
      eyebrow: { en: 'EILAT · RED SEA · ISRAEL', he: 'אילת · ים סוף · ישראל' },
      title: { en: 'Welcome to Rently', he: 'ברוכים הבאים לרנטלי' },
      subtitle: {
        en: 'Luxury Apartments in a Prime Location. Just a minute\'s walk from the sea, offering elegant design and personalized service.',
        he: 'דירות יוקרה במיקום מושלם. דקת הליכה מהים, עיצוב אלגנטי ושירות אישי.',
      },
      ctaText: { en: 'Explore Residences', he: 'גלה את הדירות' },
      ctaAction: 'scroll-to-listings',
    },
    {
      type: 'story',
      eyebrow: { en: 'ARCHITECTURAL', he: 'יצירת מופת' },
      title: { en: 'MASTERPIECE', he: 'אדריכלית' },
      paragraphs: [
        {
          en: 'A stunning glass-crowned atrium rises through the heart of our resort, creating a dramatic vertical garden that connects earth to sky.',
          he: 'אטריום זכוכית מרהיב מתרומם בלב הנופש שלנו, יוצר גן אנכי דרמטי שמחבר בין אדמה לשמיים.',
        },
        {
          en: 'Modern minimalism meets warm hospitality in spaces designed for the discerning traveler.',
          he: 'מינימליזם מודרני פוגש אירוח חם בחללים שתוכננו לנוסע המבין.',
        },
      ],
      layout: 'centered',
    },
    {
      type: 'featured-listings',
      eyebrow: { en: 'OUR COLLECTIONS', he: 'הקולקציות שלנו' },
      title: { en: 'LUXURY RESIDENCES', he: 'דירות יוקרה' },
      subtitle: {
        en: 'Discover our curated collection of luxury apartments in Eilat\'s most prestigious complexes.',
        he: 'גלו את אוסף דירות היוקרה שלנו במתחמים היוקרתיים ביותר באילת.',
      },
      layout: 'grid',
      showPricing: true,
    },
    {
      type: 'amenities-highlights',
      eyebrow: { en: 'RESORT', he: 'מתקני' },
      title: { en: 'AMENITIES', he: 'הנופש' },
      items: [
        { icon: 'pool', name: { en: 'INFINITY POOL', he: 'בריכת אינסוף' }, description: { en: 'Temperature-controlled waters with panoramic Red Sea views', he: 'מים מחוממים עם נופים פנורמיים לים סוף' } },
        { icon: 'spa', name: { en: 'SPA & WELLNESS', he: 'ספא ובריאות' }, description: { en: 'Full-service spa with desert stone treatments', he: 'ספא מלא עם טיפולי אבני מדבר' } },
        { icon: 'beach', name: { en: 'PRIVATE BEACH', he: 'חוף פרטי' }, description: { en: 'Exclusive access to pristine coastline', he: 'גישה בלעדית לקו החוף הבתולי' } },
        { icon: 'gym', name: { en: 'FITNESS CENTER', he: 'חדר כושר' }, description: { en: 'State-of-the-art equipment with mountain views', he: 'ציוד מתקדם עם נופים להרים' } },
      ],
      layout: 'grid-4',
    },
    {
      type: 'experience-highlights',
      eyebrow: { en: 'THE RENTLY', he: 'חוויית' },
      title: { en: 'EXPERIENCE', he: 'רנטלי' },
      items: [
        { number: '01', name: { en: 'DESERT MEETS SEA', he: 'מדבר פוגש ים' }, description: { en: 'Where the Negev touches the Red Sea coral reefs', he: 'היכן שהנגב נוגע בשוניות האלמוגים של ים סוף' } },
        { number: '02', name: { en: 'CURATED SERVICE', he: 'שירות מותאם' }, description: { en: 'Personalized attention from our concierge team', he: 'תשומת לב אישית מצוות הקונסיירז\' שלנו' } },
        { number: '03', name: { en: 'ARCHITECTURAL BEAUTY', he: 'יופי אדריכלי' }, description: { en: 'Award-winning design in natural harmony', he: 'עיצוב זוכה פרסים בהרמוניה טבעית' } },
      ],
    },
    {
      type: 'booking-cta',
      eyebrow: { en: 'PLAN YOUR', he: 'תכנן את' },
      title: { en: 'ESCAPE', he: 'הבריחה שלך' },
      primaryCta: {
        text: { en: 'Reserve Now', he: 'הזמן עכשיו' },
        action: 'open-booking',
      },
      secondaryCta: {
        text: { en: 'WhatsApp', he: 'וואטסאפ' },
        action: 'whatsapp',
      },
      showContactInfo: true,
    },
    {
      type: 'footer',
      showSocialLinks: true,
      showContactInfo: true,
      showNavLinks: true,
      copyrightText: { en: '© 2026 Rently Luxury Resort. All rights reserved.', he: '© 2026 רנטלי נופש יוקרה. כל הזכויות שמורות.' },
      showPoweredBy: false, // Rently is the reference, not a Hostly customer
    },
  ],

  seo: {
    title: { en: 'Rently Luxury Resort | Eilat, Israel', he: 'רנטלי נופש יוקרה | אילת, ישראל' },
    description: {
      en: 'Luxury vacation apartments in Eilat. Just steps from the Red Sea with elegant design and personalized service.',
      he: 'דירות נופש יוקרתיות באילת. צעדים מים סוף עם עיצוב אלגנטי ושירות אישי.',
    },
    priceRange: '$$$',
    propertyType: 'vacation_rental',
  },

  features: {
    enableBookingWidget: true,
    enableLanguageToggle: true,
    enableThemeToggle: true,
    enableLiveChat: false,
  },
}
