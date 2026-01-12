// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS - MIT-Level Architecture
// ═══════════════════════════════════════════════════════════════════════════════
// Single source of truth for all design decisions. Every visual element
// derives from these tokens. Host brands override only semantic colors.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Spacing System ───────────────────────────────────────────────────────────
// Based on 4px grid with named semantic scales
// Use: gap-{token}, p-{token}, m-{token}, etc.
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',      // xs - tight spacing
  1.5: '6px',
  2: '8px',      // sm - component internal padding
  2.5: '10px',
  3: '12px',     // md - default spacing
  3.5: '14px',
  4: '16px',     // lg - section spacing
  5: '20px',
  6: '24px',     // xl - card padding
  7: '28px',
  8: '32px',     // 2xl - major section gaps
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',    // 3xl - page sections
  14: '56px',
  16: '64px',    // 4xl - hero spacing
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',   // 5xl - major page sections
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const

// ─── Typography Scale ─────────────────────────────────────────────────────────
// Modular scale based on 1.25 ratio (Major Third)
// Fluid typography with clamp() for responsive sizing
export const typography = {
  // Font families
  fonts: {
    sans: 'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    display: 'var(--font-geist-sans), system-ui, sans-serif', // Can be overridden by host
  },

  // Font sizes with line heights and letter spacing
  sizes: {
    xs: {
      size: '0.75rem',      // 12px
      lineHeight: '1rem',   // 16px
      letterSpacing: '0.01em',
    },
    sm: {
      size: '0.875rem',     // 14px
      lineHeight: '1.25rem', // 20px
      letterSpacing: '0.005em',
    },
    base: {
      size: '1rem',         // 16px
      lineHeight: '1.5rem', // 24px
      letterSpacing: '0',
    },
    lg: {
      size: '1.125rem',     // 18px
      lineHeight: '1.75rem', // 28px
      letterSpacing: '-0.01em',
    },
    xl: {
      size: '1.25rem',      // 20px
      lineHeight: '1.75rem', // 28px
      letterSpacing: '-0.01em',
    },
    '2xl': {
      size: '1.5rem',       // 24px
      lineHeight: '2rem',   // 32px
      letterSpacing: '-0.015em',
    },
    '3xl': {
      size: '1.875rem',     // 30px
      lineHeight: '2.25rem', // 36px
      letterSpacing: '-0.02em',
    },
    '4xl': {
      size: '2.25rem',      // 36px
      lineHeight: '2.5rem', // 40px
      letterSpacing: '-0.02em',
    },
    '5xl': {
      size: '3rem',         // 48px
      lineHeight: '1',
      letterSpacing: '-0.025em',
    },
    '6xl': {
      size: '3.75rem',      // 60px
      lineHeight: '1',
      letterSpacing: '-0.025em',
    },
    '7xl': {
      size: '4.5rem',       // 72px
      lineHeight: '1',
      letterSpacing: '-0.025em',
    },
  },

  // Font weights
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const

// ─── Color Palette ────────────────────────────────────────────────────────────
// Semantic color tokens. Host brands override primary/secondary only.
// All other colors derive from these.
export const colors = {
  // Neutral scale (gray)
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Primary - Hostly brand (can be overridden per-host)
  primary: {
    50: '#f5f3f0',
    100: '#ebe5de',
    200: '#d6cbc0',
    300: '#c2b1a1',
    400: '#b5846d',  // Main brand color
    500: '#a06b52',
    600: '#8a5a45',
    700: '#6e4838',
    800: '#52362a',
    900: '#36241c',
    950: '#1b120e',
  },

  // Secondary - Supporting color
  secondary: {
    50: '#f7f7f7',
    100: '#e3e3e3',
    200: '#c8c8c8',
    300: '#a3a3a3',
    400: '#8a8a8a',
    500: '#6b6b6b',
    600: '#525252',
    700: '#414141',
    800: '#1a1a1a',  // Main secondary
    900: '#0d0d0d',
    950: '#000000',
  },

  // Accent - Calls to action
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
} as const

// ─── Semantic Color Mappings ──────────────────────────────────────────────────
// These are what components actually use
export const semanticColors = {
  // Backgrounds
  background: {
    default: colors.neutral[50],
    subtle: colors.neutral[100],
    muted: colors.neutral[200],
    elevated: '#ffffff',
    inverse: colors.neutral[900],
  },

  // Foreground/Text
  foreground: {
    default: colors.neutral[900],
    muted: colors.neutral[600],
    subtle: colors.neutral[500],
    inverse: colors.neutral[50],
  },

  // Borders
  border: {
    default: colors.neutral[200],
    muted: colors.neutral[100],
    strong: colors.neutral[300],
    focus: colors.primary[400],
  },

  // Interactive states
  interactive: {
    default: colors.primary[400],
    hover: colors.primary[500],
    active: colors.primary[600],
    disabled: colors.neutral[300],
  },
} as const

// ─── Shadows ──────────────────────────────────────────────────────────────────
// Layered shadows for depth hierarchy
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Colored shadows for cards
  card: '0 0 0 1px rgb(0 0 0 / 0.03), 0 2px 4px rgb(0 0 0 / 0.05), 0 12px 24px rgb(0 0 0 / 0.05)',
  cardHover: '0 0 0 1px rgb(0 0 0 / 0.03), 0 4px 8px rgb(0 0 0 / 0.08), 0 16px 32px rgb(0 0 0 / 0.08)',
} as const

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radii = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const

// ─── Transitions ──────────────────────────────────────────────────────────────
export const transitions = {
  // Timing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Durations
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
} as const

// ─── Breakpoints ──────────────────────────────────────────────────────────────
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ─── Z-Index Scale ────────────────────────────────────────────────────────────
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

// ─── Host Brand Override Types ────────────────────────────────────────────────
export interface HostBrand {
  name: string
  slug: string
  colors: {
    primary: string    // Main brand color
    secondary: string  // Supporting color
    accent?: string    // Optional accent
  }
  fonts?: {
    display?: string   // Override display font
    body?: string      // Override body font
  }
  logo?: {
    light: string      // Logo for light backgrounds
    dark: string       // Logo for dark backgrounds
  }
}

// ─── Default Hostly Brand ─────────────────────────────────────────────────────
export const hostlyBrand: HostBrand = {
  name: 'Hostly',
  slug: 'hostly',
  colors: {
    primary: colors.primary[400],
    secondary: colors.secondary[800],
    accent: colors.accent[500],
  },
}

// ─── Rently Brand (First Host) ────────────────────────────────────────────────
export const rentlyBrand: HostBrand = {
  name: 'Rently',
  slug: 'rently',
  colors: {
    primary: '#B5846D',      // Luxury warm brown
    secondary: '#1a1a1a',    // Elegant black
    accent: '#D4AF37',       // Gold accent
  },
  fonts: {
    display: '"Playfair Display", serif',
  },
}

// ─── CSS Variable Generator ───────────────────────────────────────────────────
// Generates CSS custom properties from host brand
export function generateBrandCSS(brand: HostBrand): string {
  return `
    --brand-primary: ${brand.colors.primary};
    --brand-secondary: ${brand.colors.secondary};
    --brand-accent: ${brand.colors.accent || brand.colors.primary};
    ${brand.fonts?.display ? `--font-display: ${brand.fonts.display};` : ''}
    ${brand.fonts?.body ? `--font-body: ${brand.fonts.body};` : ''}
  `
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export const tokens = {
  spacing,
  typography,
  colors,
  semanticColors,
  shadows,
  radii,
  transitions,
  breakpoints,
  zIndex,
} as const

export default tokens
