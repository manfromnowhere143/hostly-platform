// ═══════════════════════════════════════════════════════════════════════════════
// FEATURED LISTINGS SECTION - Property cards
// ═══════════════════════════════════════════════════════════════════════════════
// Showcases host properties with image carousels, pricing, and booking CTAs.
// Implements Rently-style cards with smooth transitions.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback } from 'react'
import type { FeaturedListingsSection as FeaturedListingsSectionType } from '@/lib/specs'

// Simplified property type for rendering
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

interface FeaturedListingsSectionProps {
  section: FeaturedListingsSectionType
  properties: Property[]
  lang: 'en' | 'he'
  onPropertyClick?: (property: Property) => void
  onBookClick?: (property: Property) => void
}

// Property Card Component
function PropertyCard({
  property,
  lang,
  showPricing,
  onClick,
  onBook,
}: {
  property: Property
  lang: 'en' | 'he'
  showPricing: boolean
  onClick?: () => void
  onBook?: () => void
}) {
  const [imageIndex, setImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const isRTL = lang === 'he'

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(lang === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div
      className="property-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--background-elevated)',
        borderRadius: 'var(--card-radius)',
        overflow: 'hidden',
        boxShadow: isHovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'var(--transition-normal)',
        cursor: 'pointer',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Image Carousel */}
      <div
        style={{
          position: 'relative',
          aspectRatio: 'var(--image-aspect-ratio)',
          overflow: 'hidden',
        }}
      >
        {property.images.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt={`${property.name} - ${idx + 1}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: idx === imageIndex ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
            }}
          />
        ))}

        {/* Navigation Arrows */}
        {property.images.length > 1 && isHovered && (
          <>
            <button
              onClick={prevImage}
              style={{
                position: 'absolute',
                top: '50%',
                left: '0.75rem',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 12L6 8L10 4" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              style={{
                position: 'absolute',
                top: '50%',
                right: '0.75rem',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 4L10 8L6 12" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {property.images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.375rem',
            }}
          >
            {property.images.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: idx === imageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  transition: 'var(--transition-fast)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {/* Name */}
        <h3
          style={{
            fontSize: '1.125rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
            color: 'var(--foreground)',
            margin: 0,
            marginBottom: '0.5rem',
          }}
        >
          {property.name}
        </h3>

        {/* Specs */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            fontSize: '0.875rem',
            color: 'var(--foreground-muted)',
            marginBottom: '0.75rem',
          }}
        >
          <span>{property.specs.bedrooms} {lang === 'he' ? 'חדרים' : 'beds'}</span>
          <span>·</span>
          <span>{property.specs.bathrooms} {lang === 'he' ? 'אמבטיות' : 'baths'}</span>
          <span>·</span>
          <span>{property.specs.guests} {lang === 'he' ? 'אורחים' : 'guests'}</span>
        </div>

        {/* Price & CTA */}
        {showPricing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border)',
              paddingTop: '0.75rem',
              marginTop: '0.5rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-accent)',
                  fontWeight: 600,
                  color: 'var(--foreground)',
                }}
              >
                {formatPrice(property.price, property.currency)}
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--foreground-muted)',
                }}
              >
                {' '}/{lang === 'he' ? 'לילה' : 'night'}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onBook?.()
              }}
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--button-radius)',
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              {lang === 'he' ? 'הזמן' : 'Book'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function FeaturedListingsSection({
  section,
  properties,
  lang,
  onPropertyClick,
  onBookClick,
}: FeaturedListingsSectionProps) {
  const isRTL = lang === 'he'

  const getText = useCallback((text: { en: string; he?: string } | undefined) => {
    if (!text) return ''
    return lang === 'he' && text.he ? text.he : text.en
  }, [lang])

  const getGridColumns = () => {
    switch (section.layout) {
      case 'featured-first':
        return 'repeat(auto-fill, minmax(320px, 1fr))'
      case 'carousel':
        return 'repeat(auto-fill, 320px)'
      case 'grid':
      default:
        return 'repeat(auto-fill, minmax(300px, 1fr))'
    }
  }

  return (
    <section
      id="listings"
      className="featured-listings-section"
      style={{
        padding: 'var(--section-py) var(--section-px)',
        backgroundColor: 'var(--background-subtle)',
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
                marginBottom: '0.75rem',
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
              marginBottom: '0.75rem',
            }}
          >
            {getText(section.title)}
          </h2>

          {section.subtitle && (
            <p
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                fontFamily: 'var(--font-body)',
                color: 'var(--foreground-muted)',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              {getText(section.subtitle)}
            </p>
          )}
        </div>

        {/* Property Grid */}
        <div
          style={{
            display: section.layout === 'carousel' ? 'flex' : 'grid',
            gridTemplateColumns: getGridColumns(),
            gap: 'var(--grid-gap)',
            overflowX: section.layout === 'carousel' ? 'auto' : 'visible',
            scrollSnapType: section.layout === 'carousel' ? 'x mandatory' : 'none',
            paddingBottom: section.layout === 'carousel' ? '1rem' : 0,
          }}
        >
          {properties.map((property, idx) => (
            <div
              key={property.id}
              style={{
                scrollSnapAlign: section.layout === 'carousel' ? 'start' : 'none',
                // Featured first: first item spans 2 columns on large screens
                gridColumn: section.layout === 'featured-first' && idx === 0 ? 'span 2' : 'span 1',
              }}
            >
              <PropertyCard
                property={property}
                lang={lang}
                showPricing={section.showPricing}
                onClick={() => onPropertyClick?.(property)}
                onBook={() => onBookClick?.(property)}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {properties.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--foreground-muted)',
            }}
          >
            <p>{lang === 'he' ? 'אין נכסים להצגה' : 'No properties to display'}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedListingsSection
