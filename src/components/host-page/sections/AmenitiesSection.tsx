// ═══════════════════════════════════════════════════════════════════════════════
// AMENITIES HIGHLIGHTS SECTION - Feature grid
// ═══════════════════════════════════════════════════════════════════════════════
// Showcases property/resort amenities with icons and descriptions.
// Clean grid layout with elegant hover effects.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useCallback } from 'react'
import type { AmenitiesHighlightsSection as AmenitiesSectionType } from '@/lib/specs'

// Icon components for amenities
const AMENITY_ICONS: Record<string, React.FC<{ size?: number }>> = {
  pool: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12h20M2 16h20M6 8c1-2 2-3 4-3s3 1 4 3 2 3 4 3 3-1 4-3" />
    </svg>
  ),
  spa: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C8 6 4 10 4 14a8 8 0 1016 0c0-4-4-8-8-12zM12 6c2 2.5 4 5 4 8" />
    </svg>
  ),
  beach: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.5 22H2l4.5-9L12 4l5.5 9 4.5 9H17.5M2 22c2-3 4-4 6-4s4 1 6 4M12 4v3" />
    </svg>
  ),
  gym: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 6.5h11M6.5 17.5h11M4 10v4M20 10v4M2 11v2M22 11v2M4 10h2M4 14h2M18 10h2M18 14h2" />
    </svg>
  ),
  wifi: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12.55a11 11 0 0114 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
    </svg>
  ),
  parking: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 010 6H9" />
    </svg>
  ),
  kitchen: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3h18v18H3zM3 9h18M9 9v12M9 15h6" />
    </svg>
  ),
  ac: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="8" rx="1" />
      <path d="M6 16v2M10 16v4M14 16v4M18 16v2" />
    </svg>
  ),
  tv: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 19v2" />
    </svg>
  ),
  washer: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="2" width="18" height="20" rx="2" />
      <circle cx="12" cy="13" r="5" />
      <circle cx="12" cy="13" r="2" />
      <path d="M7 6h2" />
    </svg>
  ),
  balcony: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12h18M3 12v10M21 12v10M6 12V5a3 3 0 016 0v7M12 12V5a3 3 0 016 0v7" />
    </svg>
  ),
  view: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
    </svg>
  ),
  pets: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22c4 0 6-3.5 6-7s-1.5-5-3.5-6.5c-1.5-1-2-3-2-4.5 0 1.5-.5 3.5-2 4.5C8.5 10 7 11.5 7 15s2 7 6 7z" />
      <ellipse cx="6" cy="8" rx="2" ry="3" />
      <ellipse cx="18" cy="8" rx="2" ry="3" />
      <ellipse cx="9" cy="4" rx="1.5" ry="2" />
      <ellipse cx="15" cy="4" rx="1.5" ry="2" />
    </svg>
  ),
  breakfast: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
    </svg>
  ),
  concierge: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    </svg>
  ),
  security: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l8 4v5c0 5.5-3.5 10-8 11-4.5-1-8-5.5-8-11V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  elevator: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="2" width="18" height="20" rx="2" />
      <path d="M12 2v20M8 9l-2-2-2 2M18 15l2 2 2-2" />
    </svg>
  ),
  garden: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V8M8 22h8M12 8c-4 0-6-2-6-6 2 0 4 1 6 3 2-2 4-3 6-3 0 4-2 6-6 6z" />
      <path d="M6 14c0-2.5 2.5-4 6-4s6 1.5 6 4" />
    </svg>
  ),
}

// Fallback icon
const DefaultIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
)

interface AmenitiesSectionProps {
  section: AmenitiesSectionType
  lang: 'en' | 'he'
}

export function AmenitiesSection({ section, lang }: AmenitiesSectionProps) {
  const isRTL = lang === 'he'

  const getText = useCallback((text: { en: string; he?: string } | undefined) => {
    if (!text) return ''
    return lang === 'he' && text.he ? text.he : text.en
  }, [lang])

  const getGridColumns = () => {
    switch (section.layout) {
      case 'grid-2':
        return 'repeat(2, 1fr)'
      case 'grid-3':
        return 'repeat(auto-fit, minmax(280px, 1fr))'
      case 'list':
        return '1fr'
      case 'grid-4':
      default:
        return 'repeat(auto-fit, minmax(240px, 1fr))'
    }
  }

  return (
    <section
      id="amenities"
      className="amenities-section"
      style={{
        padding: 'var(--section-py) var(--section-px)',
        backgroundColor: 'var(--background)',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          {section.eyebrow && (
            <span
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-accent)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: '0.5rem',
              }}
            >
              {getText(section.eyebrow)}
            </span>
          )}

          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-heading-weight)',
              letterSpacing: 'var(--tracking-heading)',
              lineHeight: 1.2,
              color: 'var(--foreground)',
              margin: 0,
            }}
          >
            {getText(section.title)}
          </h2>
        </div>

        {/* Amenities Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: getGridColumns(),
            gap: 'var(--grid-gap)',
          }}
        >
          {section.items.map((item, idx) => {
            const IconComponent = AMENITY_ICONS[item.icon] || DefaultIcon

            return (
              <div
                key={idx}
                className="amenity-card"
                style={{
                  display: 'flex',
                  flexDirection: section.layout === 'list' ? 'row' : 'column',
                  alignItems: section.layout === 'list' ? 'center' : 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  backgroundColor: 'var(--background-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'var(--transition-normal)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--accent-muted)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={24} />
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-accent)',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--foreground)',
                      margin: 0,
                      marginBottom: item.description ? '0.25rem' : 0,
                    }}
                  >
                    {getText(item.name)}
                  </h3>

                  {item.description && (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-body)',
                        color: 'var(--foreground-muted)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {getText(item.description)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AmenitiesSection
