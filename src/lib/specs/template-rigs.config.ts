// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE RIGS - DESIGN SYSTEM PRESETS
// ═══════════════════════════════════════════════════════════════════════════════
// Each rig is a complete design system that ensures consistent quality.
// Hosts select a rig, they don't build themes from scratch.
// ═══════════════════════════════════════════════════════════════════════════════

import type { TemplateRig } from './host-front-page.schema'

// ─── Types ──────────────────────────────────────────────────────────────────────
export interface TemplateRigConfig {
  id: TemplateRig
  name: string
  description: string
  preview: string // Preview image URL

  // Color palette
  colors: {
    // Hero section
    heroBackground: string
    heroText: string
    heroOverlay: string

    // Primary surfaces
    background: string
    backgroundSubtle: string
    backgroundElevated: string

    // Text
    foreground: string
    foregroundMuted: string
    foregroundSubtle: string

    // Accent (can be overridden by brand.accentColor)
    accent: string
    accentHover: string
    accentMuted: string

    // Borders
    border: string
    borderMuted: string
    borderStrong: string

    // Semantic
    success: string
    warning: string
    error: string
  }

  // Typography
  typography: {
    // Font families (CSS values)
    heading: string
    body: string
    accent: string // For special elements like prices, numbers

    // Font weights
    headingWeight: number
    bodyWeight: number

    // Letter spacing
    headingTracking: string
    bodyTracking: string

    // Text transforms
    eyebrowTransform: 'uppercase' | 'lowercase' | 'capitalize' | 'none'
  }

  // Spacing & Layout
  layout: {
    // Section padding
    sectionPaddingY: string
    sectionPaddingX: string

    // Max content width
    maxWidth: string
    contentMaxWidth: string

    // Border radius
    radiusSm: string
    radiusMd: string
    radiusLg: string
    radiusFull: string

    // Gaps
    gridGap: string
    stackGap: string
  }

  // Effects & Animation
  effects: {
    // Shadows
    shadowCard: string
    shadowCardHover: string
    shadowElevated: string

    // Transitions
    transitionFast: string
    transitionNormal: string
    transitionSlow: string

    // Hero effects
    heroParallax: boolean
    heroVideoOverlay: string // Gradient/color overlay on video

    // Card effects
    cardHoverScale: number
    cardHoverY: string
  }

  // Component-specific styles
  components: {
    // Navigation
    navStyle: 'transparent' | 'solid' | 'blur'
    navHeight: string

    // Buttons
    buttonStyle: 'solid' | 'outline' | 'ghost' | 'gradient'
    buttonRadius: string
    buttonPadding: string

    // Cards
    cardStyle: 'elevated' | 'outlined' | 'flat'
    cardRadius: string

    // Images
    imageRadius: string
    imageAspectRatio: string // e.g., "16/9", "4/3", "1/1"
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CINEMATIC LUXURY - RENTLY DNA
// ═══════════════════════════════════════════════════════════════════════════════
// Dark hero, gold/copper accents, video-first, editorial typography
// The flagship template based on Rently's award-winning design
export const cinematicLuxuryRig: TemplateRigConfig = {
  id: 'cinematic-luxury',
  name: 'Cinematic Luxury',
  description: 'Dark hero with gold accents. Video-first, editorial feel. Perfect for high-end vacation rentals.',
  preview: '/templates/cinematic-luxury-preview.jpg',

  colors: {
    // Hero - dark cinematic
    heroBackground: '#0a0a0a',
    heroText: '#ffffff',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',

    // Surfaces - warm off-white
    background: '#faf9f7',
    backgroundSubtle: '#f5f3f0',
    backgroundElevated: '#ffffff',

    // Text - warm charcoal
    foreground: '#1a1a1a',
    foregroundMuted: '#6b6b6b',
    foregroundSubtle: '#9a9a9a',

    // Accent - Rently copper/gold
    accent: '#B5846D',
    accentHover: '#9a6f5a',
    accentMuted: 'rgba(181, 132, 109, 0.15)',

    // Borders
    border: 'rgba(0, 0, 0, 0.08)',
    borderMuted: 'rgba(0, 0, 0, 0.04)',
    borderStrong: 'rgba(0, 0, 0, 0.15)',

    // Semantic
    success: '#2d8a5f',
    warning: '#d4a030',
    error: '#c74a4a',
  },

  typography: {
    heading: '"Cormorant Garamond", Georgia, serif',
    body: '"Inter", -apple-system, sans-serif',
    accent: '"DM Mono", monospace',

    headingWeight: 300,
    bodyWeight: 400,

    headingTracking: '0.02em',
    bodyTracking: '0.01em',

    eyebrowTransform: 'uppercase',
  },

  layout: {
    sectionPaddingY: 'clamp(4rem, 10vh, 8rem)',
    sectionPaddingX: 'clamp(1rem, 5vw, 4rem)',

    maxWidth: '1400px',
    contentMaxWidth: '800px',

    radiusSm: '4px',
    radiusMd: '8px',
    radiusLg: '16px',
    radiusFull: '9999px',

    gridGap: '2rem',
    stackGap: '1.5rem',
  },

  effects: {
    shadowCard: '0 4px 20px rgba(0, 0, 0, 0.08)',
    shadowCardHover: '0 8px 40px rgba(0, 0, 0, 0.12)',
    shadowElevated: '0 20px 60px rgba(0, 0, 0, 0.15)',

    transitionFast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transitionNormal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    transitionSlow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',

    heroParallax: true,
    heroVideoOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)',

    cardHoverScale: 1.02,
    cardHoverY: '-4px',
  },

  components: {
    navStyle: 'transparent',
    navHeight: '80px',

    buttonStyle: 'solid',
    buttonRadius: '4px',
    buttonPadding: '1rem 2rem',

    cardStyle: 'elevated',
    cardRadius: '12px',

    imageRadius: '8px',
    imageAspectRatio: '16/10',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESORT HOTEL - LIGHT & AIRY
// ═══════════════════════════════════════════════════════════════════════════════
// Mediterranean feel, clean whites, soft blues, elegant but approachable
export const resortHotelRig: TemplateRigConfig = {
  id: 'resort-hotel',
  name: 'Resort & Hotel',
  description: 'Light and airy Mediterranean feel. Perfect for beach resorts, hotels, and coastal properties.',
  preview: '/templates/resort-hotel-preview.jpg',

  colors: {
    // Hero - light with soft overlay
    heroBackground: '#ffffff',
    heroText: '#1a1a1a',
    heroOverlay: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 100%)',

    // Surfaces - pure whites
    background: '#ffffff',
    backgroundSubtle: '#f8fafc',
    backgroundElevated: '#ffffff',

    // Text - soft navy
    foreground: '#1e293b',
    foregroundMuted: '#64748b',
    foregroundSubtle: '#94a3b8',

    // Accent - coastal blue
    accent: '#0891b2',
    accentHover: '#0e7490',
    accentMuted: 'rgba(8, 145, 178, 0.1)',

    // Borders
    border: 'rgba(0, 0, 0, 0.06)',
    borderMuted: 'rgba(0, 0, 0, 0.03)',
    borderStrong: 'rgba(0, 0, 0, 0.1)',

    // Semantic
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },

  typography: {
    heading: '"Playfair Display", Georgia, serif',
    body: '"Source Sans Pro", -apple-system, sans-serif',
    accent: '"Lato", sans-serif',

    headingWeight: 400,
    bodyWeight: 400,

    headingTracking: '0.01em',
    bodyTracking: '0',

    eyebrowTransform: 'uppercase',
  },

  layout: {
    sectionPaddingY: 'clamp(3rem, 8vh, 6rem)',
    sectionPaddingX: 'clamp(1rem, 4vw, 3rem)',

    maxWidth: '1280px',
    contentMaxWidth: '720px',

    radiusSm: '6px',
    radiusMd: '12px',
    radiusLg: '20px',
    radiusFull: '9999px',

    gridGap: '1.5rem',
    stackGap: '1.25rem',
  },

  effects: {
    shadowCard: '0 2px 12px rgba(0, 0, 0, 0.06)',
    shadowCardHover: '0 6px 24px rgba(0, 0, 0, 0.1)',
    shadowElevated: '0 12px 40px rgba(0, 0, 0, 0.12)',

    transitionFast: '150ms ease-out',
    transitionNormal: '250ms ease-out',
    transitionSlow: '400ms ease-out',

    heroParallax: false,
    heroVideoOverlay: 'linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(255,255,255,0.8) 100%)',

    cardHoverScale: 1.01,
    cardHoverY: '-2px',
  },

  components: {
    navStyle: 'solid',
    navHeight: '72px',

    buttonStyle: 'solid',
    buttonRadius: '8px',
    buttonPadding: '0.875rem 1.75rem',

    cardStyle: 'outlined',
    cardRadius: '16px',

    imageRadius: '12px',
    imageAspectRatio: '4/3',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// URBAN MINIMAL - MODERN CITY
// ═══════════════════════════════════════════════════════════════════════════════
// Clean, modern, high contrast. Perfect for city apartments and modern spaces
export const urbanMinimalRig: TemplateRigConfig = {
  id: 'urban-minimal',
  name: 'Urban Minimal',
  description: 'Clean modern design with high contrast. Perfect for city apartments and contemporary spaces.',
  preview: '/templates/urban-minimal-preview.jpg',

  colors: {
    // Hero - pure black/white
    heroBackground: '#000000',
    heroText: '#ffffff',
    heroOverlay: 'rgba(0, 0, 0, 0.4)',

    // Surfaces - crisp white
    background: '#ffffff',
    backgroundSubtle: '#fafafa',
    backgroundElevated: '#ffffff',

    // Text - true black
    foreground: '#000000',
    foregroundMuted: '#525252',
    foregroundSubtle: '#a3a3a3',

    // Accent - electric
    accent: '#000000',
    accentHover: '#262626',
    accentMuted: 'rgba(0, 0, 0, 0.05)',

    // Borders
    border: '#e5e5e5',
    borderMuted: '#f5f5f5',
    borderStrong: '#d4d4d4',

    // Semantic
    success: '#16a34a',
    warning: '#ea580c',
    error: '#dc2626',
  },

  typography: {
    heading: '"Space Grotesk", -apple-system, sans-serif',
    body: '"Inter", -apple-system, sans-serif',
    accent: '"JetBrains Mono", monospace',

    headingWeight: 500,
    bodyWeight: 400,

    headingTracking: '-0.02em',
    bodyTracking: '0',

    eyebrowTransform: 'uppercase',
  },

  layout: {
    sectionPaddingY: 'clamp(3rem, 8vh, 5rem)',
    sectionPaddingX: 'clamp(1rem, 4vw, 2rem)',

    maxWidth: '1200px',
    contentMaxWidth: '680px',

    radiusSm: '2px',
    radiusMd: '4px',
    radiusLg: '8px',
    radiusFull: '9999px',

    gridGap: '1.25rem',
    stackGap: '1rem',
  },

  effects: {
    shadowCard: 'none',
    shadowCardHover: '0 4px 16px rgba(0, 0, 0, 0.08)',
    shadowElevated: '0 8px 32px rgba(0, 0, 0, 0.12)',

    transitionFast: '100ms linear',
    transitionNormal: '200ms linear',
    transitionSlow: '300ms linear',

    heroParallax: false,
    heroVideoOverlay: 'rgba(0, 0, 0, 0.3)',

    cardHoverScale: 1,
    cardHoverY: '0',
  },

  components: {
    navStyle: 'blur',
    navHeight: '64px',

    buttonStyle: 'solid',
    buttonRadius: '2px',
    buttonPadding: '0.75rem 1.5rem',

    cardStyle: 'outlined',
    cardRadius: '4px',

    imageRadius: '4px',
    imageAspectRatio: '3/2',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOUTIQUE COZY - WARM & INTIMATE
// ═══════════════════════════════════════════════════════════════════════════════
// Warm, inviting, personal. Perfect for B&Bs, cabins, and intimate stays
export const boutiqueCozyRig: TemplateRigConfig = {
  id: 'boutique-cozy',
  name: 'Boutique Cozy',
  description: 'Warm and inviting with personal charm. Perfect for B&Bs, cabins, and intimate guest houses.',
  preview: '/templates/boutique-cozy-preview.jpg',

  colors: {
    // Hero - warm cream overlay
    heroBackground: '#f5f0e8',
    heroText: '#3d3529',
    heroOverlay: 'linear-gradient(to bottom, rgba(245,240,232,0.2) 0%, rgba(245,240,232,0.6) 100%)',

    // Surfaces - warm creams
    background: '#fdfbf7',
    backgroundSubtle: '#f8f4ed',
    backgroundElevated: '#ffffff',

    // Text - warm browns
    foreground: '#3d3529',
    foregroundMuted: '#6b6152',
    foregroundSubtle: '#9a9082',

    // Accent - terracotta
    accent: '#c2724f',
    accentHover: '#a85f3f',
    accentMuted: 'rgba(194, 114, 79, 0.12)',

    // Borders
    border: 'rgba(61, 53, 41, 0.1)',
    borderMuted: 'rgba(61, 53, 41, 0.05)',
    borderStrong: 'rgba(61, 53, 41, 0.2)',

    // Semantic
    success: '#5a8a5a',
    warning: '#c4933c',
    error: '#b85450',
  },

  typography: {
    heading: '"Lora", Georgia, serif',
    body: '"Nunito", -apple-system, sans-serif',
    accent: '"Caveat", cursive',

    headingWeight: 500,
    bodyWeight: 400,

    headingTracking: '0',
    bodyTracking: '0.01em',

    eyebrowTransform: 'capitalize',
  },

  layout: {
    sectionPaddingY: 'clamp(3rem, 8vh, 5rem)',
    sectionPaddingX: 'clamp(1.25rem, 5vw, 3rem)',

    maxWidth: '1100px',
    contentMaxWidth: '700px',

    radiusSm: '8px',
    radiusMd: '16px',
    radiusLg: '24px',
    radiusFull: '9999px',

    gridGap: '1.75rem',
    stackGap: '1.25rem',
  },

  effects: {
    shadowCard: '0 2px 8px rgba(61, 53, 41, 0.06)',
    shadowCardHover: '0 8px 24px rgba(61, 53, 41, 0.1)',
    shadowElevated: '0 16px 48px rgba(61, 53, 41, 0.12)',

    transitionFast: '150ms ease',
    transitionNormal: '300ms ease',
    transitionSlow: '450ms ease',

    heroParallax: false,
    heroVideoOverlay: 'linear-gradient(to bottom, rgba(253,251,247,0.1) 0%, rgba(253,251,247,0.5) 100%)',

    cardHoverScale: 1.01,
    cardHoverY: '-3px',
  },

  components: {
    navStyle: 'solid',
    navHeight: '72px',

    buttonStyle: 'solid',
    buttonRadius: '24px',
    buttonPadding: '0.875rem 2rem',

    cardStyle: 'elevated',
    cardRadius: '20px',

    imageRadius: '16px',
    imageAspectRatio: '4/3',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIG REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
export const TEMPLATE_RIGS: Record<TemplateRig, TemplateRigConfig> = {
  'cinematic-luxury': cinematicLuxuryRig,
  'resort-hotel': resortHotelRig,
  'urban-minimal': urbanMinimalRig,
  'boutique-cozy': boutiqueCozyRig,
}

/**
 * Get a template rig configuration by ID
 */
export function getTemplateRig(id: TemplateRig): TemplateRigConfig {
  return TEMPLATE_RIGS[id]
}

/**
 * Get all template rigs as an array (for selection UI)
 */
export function getAllTemplateRigs(): TemplateRigConfig[] {
  return Object.values(TEMPLATE_RIGS)
}

/**
 * Generate CSS custom properties from a rig config
 * Used to inject rig styles into the page
 */
export function rigToCSSVariables(rig: TemplateRigConfig): Record<string, string> {
  return {
    // Colors
    '--hero-bg': rig.colors.heroBackground,
    '--hero-text': rig.colors.heroText,
    '--hero-overlay': rig.colors.heroOverlay,

    '--background': rig.colors.background,
    '--background-subtle': rig.colors.backgroundSubtle,
    '--background-elevated': rig.colors.backgroundElevated,

    '--foreground': rig.colors.foreground,
    '--foreground-muted': rig.colors.foregroundMuted,
    '--foreground-subtle': rig.colors.foregroundSubtle,

    '--accent': rig.colors.accent,
    '--accent-hover': rig.colors.accentHover,
    '--accent-muted': rig.colors.accentMuted,

    '--border': rig.colors.border,
    '--border-muted': rig.colors.borderMuted,
    '--border-strong': rig.colors.borderStrong,

    '--success': rig.colors.success,
    '--warning': rig.colors.warning,
    '--error': rig.colors.error,

    // Typography
    '--font-heading': rig.typography.heading,
    '--font-body': rig.typography.body,
    '--font-accent': rig.typography.accent,
    '--font-heading-weight': String(rig.typography.headingWeight),
    '--font-body-weight': String(rig.typography.bodyWeight),
    '--tracking-heading': rig.typography.headingTracking,
    '--tracking-body': rig.typography.bodyTracking,

    // Layout
    '--section-py': rig.layout.sectionPaddingY,
    '--section-px': rig.layout.sectionPaddingX,
    '--max-width': rig.layout.maxWidth,
    '--content-max-width': rig.layout.contentMaxWidth,
    '--radius-sm': rig.layout.radiusSm,
    '--radius-md': rig.layout.radiusMd,
    '--radius-lg': rig.layout.radiusLg,
    '--radius-full': rig.layout.radiusFull,
    '--grid-gap': rig.layout.gridGap,
    '--stack-gap': rig.layout.stackGap,

    // Effects
    '--shadow-card': rig.effects.shadowCard,
    '--shadow-card-hover': rig.effects.shadowCardHover,
    '--shadow-elevated': rig.effects.shadowElevated,
    '--transition-fast': rig.effects.transitionFast,
    '--transition-normal': rig.effects.transitionNormal,
    '--transition-slow': rig.effects.transitionSlow,
    '--hero-video-overlay': rig.effects.heroVideoOverlay,

    // Components
    '--nav-height': rig.components.navHeight,
    '--button-radius': rig.components.buttonRadius,
    '--button-padding': rig.components.buttonPadding,
    '--card-radius': rig.components.cardRadius,
    '--image-radius': rig.components.imageRadius,
    '--image-aspect-ratio': rig.components.imageAspectRatio,
  }
}
