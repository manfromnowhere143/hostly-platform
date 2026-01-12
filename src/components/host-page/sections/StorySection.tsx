// ═══════════════════════════════════════════════════════════════════════════════
// STORY SECTION - About the host / property story
// ═══════════════════════════════════════════════════════════════════════════════
// Editorial storytelling with elegant typography. Builds emotional connection.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useCallback } from 'react'
import type { StorySection as StorySectionType } from '@/lib/specs'

interface StorySectionProps {
  section: StorySectionType
  lang: 'en' | 'he'
}

export function StorySection({ section, lang }: StorySectionProps) {
  const isRTL = lang === 'he'

  const getText = useCallback((text: { en: string; he?: string } | undefined) => {
    if (!text) return ''
    return lang === 'he' && text.he ? text.he : text.en
  }, [lang])

  const getLayoutStyles = () => {
    switch (section.layout) {
      case 'text-left':
        return {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          textAlign: isRTL ? 'right' : 'left',
        } as const
      case 'text-right':
        return {
          flexDirection: isRTL ? 'row' : 'row-reverse',
          textAlign: isRTL ? 'left' : 'right',
        } as const
      case 'centered':
      default:
        return {
          flexDirection: 'column',
          textAlign: 'center',
        } as const
    }
  }

  const layoutStyles = getLayoutStyles()

  return (
    <section
      className="story-section"
      style={{
        padding: 'var(--section-py) var(--section-px)',
        backgroundColor: 'var(--background)',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: layoutStyles.flexDirection,
          alignItems: 'center',
          gap: 'var(--grid-gap)',
        }}
      >
        {/* Text Content */}
        <div
          style={{
            flex: section.image ? '1' : 'none',
            maxWidth: section.layout === 'centered' ? 'var(--content-max-width)' : '100%',
            textAlign: layoutStyles.textAlign,
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
                color: 'var(--accent)',
                marginBottom: '0.75rem',
              }}
            >
              {getText(section.eyebrow)}
            </span>
          )}

          {/* Title */}
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-heading-weight)',
              letterSpacing: 'var(--tracking-heading)',
              lineHeight: 1.2,
              color: 'var(--foreground)',
              margin: 0,
              marginBottom: '1.5rem',
            }}
          >
            {getText(section.title)}
          </h2>

          {/* Paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {section.paragraphs.map((paragraph, idx) => (
              <p
                key={idx}
                style={{
                  fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--font-body-weight)',
                  letterSpacing: 'var(--tracking-body)',
                  lineHeight: 1.75,
                  color: 'var(--foreground-muted)',
                  margin: 0,
                }}
              >
                {getText(paragraph)}
              </p>
            ))}
          </div>
        </div>

        {/* Optional Image */}
        {section.image && section.layout !== 'centered' && (
          <div
            style={{
              flex: '1',
              maxWidth: '500px',
            }}
          >
            <img
              src={section.image.url}
              alt={getText(section.image.alt) || ''}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 'var(--image-radius)',
                boxShadow: 'var(--shadow-card)',
              }}
            />
          </div>
        )}
      </div>

      {/* Centered image (full width below text) */}
      {section.image && section.layout === 'centered' && (
        <div
          style={{
            maxWidth: 'var(--max-width)',
            margin: '3rem auto 0',
          }}
        >
          <img
            src={section.image.url}
            alt={getText(section.image.alt) || ''}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 'var(--image-radius)',
              boxShadow: 'var(--shadow-card)',
            }}
          />
        </div>
      )}
    </section>
  )
}

export default StorySection
