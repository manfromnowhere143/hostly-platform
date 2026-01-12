// ═══════════════════════════════════════════════════════════════════════════════
// HOST PAGE RENDERER - "Taste as Code" Engine
// ═══════════════════════════════════════════════════════════════════════════════
// Takes a HostFrontPageSpec and renders a complete, production-ready host page.
// This is the core of the Hostly Builder system.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import type { HostFrontPageSpec, Section } from '@/lib/specs'
import { getTemplateRig, rigToCSSVariables } from '@/lib/specs'

// Section components
import {
  HeroSection,
  TrustBarSection,
  StorySection,
  FeaturedListingsSection,
  AmenitiesSection,
  ExperienceSection,
  TestimonialsSection,
  GallerySection,
  BookingCTASection,
  FooterSection,
} from './sections'

// Property type for listings
interface Property {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  currency: string
  specs: {
    bedrooms: number
    bathrooms: number
    guests: number
  }
  amenities?: string[]
}

interface HostPageRendererProps {
  spec: HostFrontPageSpec
  properties?: Property[]
  onBookProperty?: (property: Property) => void
  onBookGeneral?: () => void
  defaultLang?: 'en' | 'he'
}

export function HostPageRenderer({
  spec,
  properties = [],
  onBookProperty,
  onBookGeneral,
  defaultLang = 'en',
}: HostPageRendererProps) {
  const [lang, setLang] = useState<'en' | 'he'>(defaultLang)
  const [isScrolled, setIsScrolled] = useState(false)

  // Get template rig configuration
  const rig = useMemo(() => getTemplateRig(spec.templateRig), [spec.templateRig])

  // Generate CSS variables from rig + brand overrides
  const cssVariables = useMemo(() => {
    const rigVars = rigToCSSVariables(rig)

    // Apply brand overrides
    if (spec.brand.accentColor) {
      rigVars['--accent'] = spec.brand.accentColor
      // Generate hover state (darken by 10%)
      rigVars['--accent-hover'] = adjustColor(spec.brand.accentColor, -0.1)
      rigVars['--accent-muted'] = `${spec.brand.accentColor}20`
    }

    // Apply font preset overrides
    const fontPresets: Record<string, { heading: string; body: string }> = {
      editorial: {
        heading: '"Cormorant Garamond", Georgia, serif',
        body: '"Source Serif Pro", Georgia, serif',
      },
      modern: {
        heading: '"Inter", -apple-system, sans-serif',
        body: '"Inter", -apple-system, sans-serif',
      },
      luxury: {
        heading: '"Cormorant Garamond", Georgia, serif',
        body: '"Inter", -apple-system, sans-serif',
      },
      friendly: {
        heading: '"Nunito", -apple-system, sans-serif',
        body: '"Nunito", -apple-system, sans-serif',
      },
    }

    const fonts = fontPresets[spec.brand.fontPreset]
    if (fonts) {
      rigVars['--font-heading'] = fonts.heading
      rigVars['--font-body'] = fonts.body
    }

    return rigVars
  }, [rig, spec.brand])

  // Scroll handler for nav effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation click handler
  const handleNavClick = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Scroll to top for 'hero'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  // Book click handler
  const handleBookClick = useCallback(() => {
    onBookGeneral?.()
  }, [onBookGeneral])

  // Render a section based on its type
  const renderSection = (section: Section, index: number) => {
    const key = `${section.type}-${index}`

    switch (section.type) {
      case 'hero':
        return (
          <HeroSection
            key={key}
            section={section}
            media={spec.media}
            brand={spec.brand}
            lang={lang}
            onCtaClick={handleBookClick}
          />
        )

      case 'trust-bar':
        return <TrustBarSection key={key} section={section} lang={lang} />

      case 'story':
        return <StorySection key={key} section={section} lang={lang} />

      case 'featured-listings':
        return (
          <FeaturedListingsSection
            key={key}
            section={section}
            properties={properties}
            lang={lang}
            onPropertyClick={(property) => onBookProperty?.(property)}
            onBookClick={(property) => onBookProperty?.(property)}
          />
        )

      case 'amenities-highlights':
        return <AmenitiesSection key={key} section={section} lang={lang} />

      case 'experience-highlights':
        return <ExperienceSection key={key} section={section} lang={lang} />

      case 'testimonials':
        return <TestimonialsSection key={key} section={section} lang={lang} />

      case 'gallery':
        return <GallerySection key={key} section={section} lang={lang} />

      case 'booking-cta':
        return (
          <BookingCTASection
            key={key}
            section={section}
            brand={spec.brand}
            lang={lang}
            onBookClick={handleBookClick}
          />
        )

      case 'footer':
        return (
          <FooterSection
            key={key}
            section={section}
            brand={spec.brand}
            lang={lang}
            onNavClick={handleNavClick}
          />
        )

      default:
        console.warn(`Unknown section type: ${(section as Section).type}`)
        return null
    }
  }

  const isRTL = lang === 'he'

  return (
    <div
      className="host-page"
      style={{
        ...cssVariables,
        minHeight: '100vh',
        fontFamily: 'var(--font-body)',
        color: 'var(--foreground)',
        backgroundColor: 'var(--background)',
      } as React.CSSProperties}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Navigation Bar */}
      <NavigationBar
        spec={spec}
        lang={lang}
        onLangChange={setLang}
        isScrolled={isScrolled}
        onNavClick={handleNavClick}
        onBookClick={handleBookClick}
        rig={rig}
      />

      {/* Render all sections */}
      <main>
        {spec.sections.map((section, index) => renderSection(section, index))}
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION BAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface NavigationBarProps {
  spec: HostFrontPageSpec
  lang: 'en' | 'he'
  onLangChange: (lang: 'en' | 'he') => void
  isScrolled: boolean
  onNavClick: (section: string) => void
  onBookClick: () => void
  rig: ReturnType<typeof getTemplateRig>
}

function NavigationBar({
  spec,
  lang,
  onLangChange,
  isScrolled,
  onNavClick,
  onBookClick,
  rig,
}: NavigationBarProps) {
  const isRTL = lang === 'he'

  const navStyle = rig.components.navStyle
  const showLanguageToggle = spec.features?.enableLanguageToggle ?? true

  // Nav background styles based on scroll state and nav style
  const getNavBackground = () => {
    if (isScrolled) {
      return {
        backgroundColor: 'var(--background-elevated)',
        boxShadow: 'var(--shadow-card)',
        color: 'var(--foreground)',
      }
    }

    switch (navStyle) {
      case 'transparent':
        return {
          backgroundColor: 'transparent',
          color: 'var(--hero-text)',
        }
      case 'blur':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          color: 'var(--foreground)',
        }
      case 'solid':
      default:
        return {
          backgroundColor: 'var(--background-elevated)',
          color: 'var(--foreground)',
        }
    }
  }

  const navBackground = getNavBackground()

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 'var(--nav-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--section-px)',
        transition: 'var(--transition-normal)',
        ...navBackground,
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {spec.brand.logo ? (
          <img
            src={spec.brand.logo.url}
            alt={spec.brand.logo.alt}
            style={{
              height: '32px',
              width: 'auto',
            }}
          />
        ) : (
          <span
            style={{
              fontSize: '1.25rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
            }}
          >
            {spec.brand.location.name}
          </span>
        )}
      </div>

      {/* Nav Links (desktop) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}
        className="nav-links"
      >
        <button
          onClick={() => onNavClick('listings')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.9,
            transition: 'var(--transition-fast)',
          }}
        >
          {lang === 'he' ? 'נכסים' : 'Properties'}
        </button>

        <button
          onClick={() => onNavClick('amenities')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.9,
            transition: 'var(--transition-fast)',
          }}
        >
          {lang === 'he' ? 'מתקנים' : 'Amenities'}
        </button>

        <button
          onClick={() => onNavClick('contact')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.9,
            transition: 'var(--transition-fast)',
          }}
        >
          {lang === 'he' ? 'צור קשר' : 'Contact'}
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Language Toggle */}
        {showLanguageToggle && (
          <button
            onClick={() => onLangChange(lang === 'en' ? 'he' : 'en')}
            style={{
              background: 'none',
              border: '1px solid currentColor',
              borderRadius: 'var(--radius-sm)',
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              color: 'inherit',
              opacity: 0.8,
              transition: 'var(--transition-fast)',
            }}
          >
            {lang === 'en' ? 'עב' : 'EN'}
          </button>
        )}

        {/* Book Button */}
        <button
          onClick={onBookClick}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--button-radius)',
            padding: '0.5rem 1.25rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
        >
          {lang === 'he' ? 'הזמן' : 'Book Now'}
        </button>
      </div>

      {/* Mobile responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Adjust a hex color by a percentage (-1 to 1)
 * Negative = darken, Positive = lighten
 */
function adjustColor(hex: string, percent: number): string {
  // Remove # if present
  const color = hex.replace('#', '')

  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  // Adjust
  const adjust = (c: number) => {
    const adjusted = Math.round(c + c * percent)
    return Math.max(0, Math.min(255, adjusted))
  }

  // Convert back to hex
  const toHex = (c: number) => c.toString(16).padStart(2, '0')

  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`
}

export default HostPageRenderer
