// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING CTA SECTION - Call to action
// ═══════════════════════════════════════════════════════════════════════════════
// Final conversion push. Contact info + booking CTA.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useCallback } from 'react'
import type { BookingCTASection as BookingCTASectionType, BrandSettings } from '@/lib/specs'

interface BookingCTASectionProps {
  section: BookingCTASectionType
  brand: BrandSettings
  lang: 'en' | 'he'
  onBookClick?: () => void
}

export function BookingCTASection({ section, brand, lang, onBookClick }: BookingCTASectionProps) {
  const isRTL = lang === 'he'

  const getText = useCallback((text: { en: string; he?: string } | undefined) => {
    if (!text) return ''
    return lang === 'he' && text.he ? text.he : text.en
  }, [lang])

  const handlePrimaryCta = () => {
    if (section.primaryCta.action === 'open-booking') {
      onBookClick?.()
    } else if (section.primaryCta.action === 'scroll-to-listings') {
      document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
    } else if (section.primaryCta.action === 'external-link' && section.primaryCta.url) {
      window.open(section.primaryCta.url, '_blank')
    }
  }

  const handleSecondaryCta = () => {
    if (!section.secondaryCta) return

    if (section.secondaryCta.action === 'whatsapp' && brand.contact.whatsapp) {
      window.open(brand.contact.whatsapp, '_blank')
    } else if (section.secondaryCta.action === 'phone') {
      window.location.href = `tel:${brand.contact.phone}`
    } else if (section.secondaryCta.action === 'email') {
      window.location.href = `mailto:${brand.contact.email}`
    }
  }

  return (
    <section
      id="contact"
      className="booking-cta-section"
      style={{
        padding: 'var(--section-py) var(--section-px)',
        backgroundColor: 'var(--hero-bg)',
        color: 'var(--hero-text)',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        style={{
          maxWidth: 'var(--content-max-width)',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow */}
        {section.eyebrow && (
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-accent)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              opacity: 0.7,
              marginBottom: '0.75rem',
            }}
          >
            {getText(section.eyebrow)}
          </span>
        )}

        {/* Title */}
        <h2
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-heading-weight)',
            letterSpacing: 'var(--tracking-heading)',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: section.subtitle ? '1rem' : '2rem',
          }}
        >
          {getText(section.title)}
        </h2>

        {/* Subtitle */}
        {section.subtitle && (
          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              fontFamily: 'var(--font-body)',
              opacity: 0.85,
              lineHeight: 1.6,
              margin: 0,
              marginBottom: '2rem',
            }}
          >
            {getText(section.subtitle)}
          </p>
        )}

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: section.showContactInfo ? '3rem' : 0,
          }}
        >
          {/* Primary CTA */}
          <button
            onClick={handlePrimaryCta}
            style={{
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '1rem 2.5rem',
              borderRadius: 'var(--button-radius)',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-normal)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {getText(section.primaryCta.text)}
          </button>

          {/* Secondary CTA */}
          {section.secondaryCta && (
            <button
              onClick={handleSecondaryCta}
              style={{
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '1rem 2.5rem',
                borderRadius: 'var(--button-radius)',
                backgroundColor: 'transparent',
                color: 'var(--hero-text)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'var(--transition-normal)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {section.secondaryCta.action === 'whatsapp' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              )}
              {getText(section.secondaryCta.text)}
            </button>
          )}
        </div>

        {/* Contact Info */}
        {section.showContactInfo && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '2rem',
              paddingTop: '3rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Phone */}
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-accent)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.5,
                  marginBottom: '0.5rem',
                }}
              >
                {lang === 'he' ? 'טלפון' : 'Phone'}
              </span>
              <a
                href={`tel:${brand.contact.phone}`}
                style={{
                  fontSize: '1rem',
                  fontFamily: 'var(--font-body)',
                  color: 'inherit',
                  textDecoration: 'none',
                  opacity: 0.9,
                }}
              >
                {brand.contact.phone}
              </a>
            </div>

            {/* Email */}
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-accent)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.5,
                  marginBottom: '0.5rem',
                }}
              >
                {lang === 'he' ? 'אימייל' : 'Email'}
              </span>
              <a
                href={`mailto:${brand.contact.email}`}
                style={{
                  fontSize: '1rem',
                  fontFamily: 'var(--font-body)',
                  color: 'inherit',
                  textDecoration: 'none',
                  opacity: 0.9,
                }}
              >
                {brand.contact.email}
              </a>
            </div>

            {/* Location */}
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-accent)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.5,
                  marginBottom: '0.5rem',
                }}
              >
                {lang === 'he' ? 'מיקום' : 'Location'}
              </span>
              {brand.location.wazeUrl ? (
                <a
                  href={brand.location.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '1rem',
                    fontFamily: 'var(--font-body)',
                    color: 'inherit',
                    textDecoration: 'none',
                    opacity: 0.9,
                  }}
                >
                  {brand.location.name}
                </a>
              ) : (
                <span
                  style={{
                    fontSize: '1rem',
                    fontFamily: 'var(--font-body)',
                    opacity: 0.9,
                  }}
                >
                  {brand.location.name}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default BookingCTASection
