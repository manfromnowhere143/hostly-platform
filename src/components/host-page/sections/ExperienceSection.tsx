// ═══════════════════════════════════════════════════════════════════════════════
// EXPERIENCE HIGHLIGHTS SECTION - Numbered feature list
// ═══════════════════════════════════════════════════════════════════════════════
// Editorial-style numbered list showcasing unique experiences.
// Rently DNA: 01, 02, 03 format with elegant typography.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useCallback } from 'react'
import type { ExperienceHighlightsSection as ExperienceSectionType } from '@/lib/specs'

interface ExperienceSectionProps {
  section: ExperienceSectionType
  lang: 'en' | 'he'
}

export function ExperienceSection({ section, lang }: ExperienceSectionProps) {
  const isRTL = lang === 'he'

  const getText = useCallback((text: { en: string; he?: string } | undefined) => {
    if (!text) return ''
    return lang === 'he' && text.he ? text.he : text.en
  }, [lang])

  return (
    <section
      className="experience-section"
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
            marginBottom: '4rem',
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

        {/* Experience Items */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {section.items.map((item, idx) => (
            <div
              key={idx}
              className="experience-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {/* Number */}
              <span
                style={{
                  fontSize: '3rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 200,
                  lineHeight: 1,
                  color: 'var(--accent)',
                  opacity: 0.6,
                  marginBottom: '1rem',
                }}
              >
                {item.number}
              </span>

              {/* Name */}
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-accent)',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--foreground)',
                  margin: 0,
                  marginBottom: '0.75rem',
                }}
              >
                {getText(item.name)}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: '1rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--font-body-weight)',
                  letterSpacing: 'var(--tracking-body)',
                  lineHeight: 1.7,
                  color: 'var(--foreground-muted)',
                  margin: 0,
                }}
              >
                {getText(item.description)}
              </p>

              {/* Decorative line */}
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: 'var(--accent)',
                  opacity: 0.3,
                  marginTop: '1.5rem',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ExperienceSection
