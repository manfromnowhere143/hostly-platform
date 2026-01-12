// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS SECTION - Guest reviews
// ═══════════════════════════════════════════════════════════════════════════════
// Social proof with guest reviews. Carousel or grid layout.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback, type JSX } from 'react'
import type { TestimonialsSection as TestimonialsSectionType } from '@/lib/specs'

// Source icons - explicitly typed to return JSX.Element
const SOURCE_ICONS: Record<string, (props: { size?: number }) => JSX.Element> = {
  google: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ),
  airbnb: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.4c-.4.8-1.2 1.2-2 1.2-.5 0-1-.2-1.5-.5-1.3-.8-2.3-2-3-3.4-.7 1.4-1.7 2.6-3 3.4-.5.3-1 .5-1.5.5-.8 0-1.6-.4-2-1.2-.3-.6-.4-1.3-.2-2 .6-2.3 2.4-4.8 3.8-6.6.4-.6 1.1-.9 1.9-.9s1.4.3 1.9.9c1.4 1.8 3.2 4.3 3.8 6.6.2.7.1 1.4-.2 2z" />
    </svg>
  ),
  booking: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.75 2h18.5A2.75 2.75 0 0124 4.75v14.5A2.75 2.75 0 0121.25 22H2.75A2.75 2.75 0 010 19.25V4.75A2.75 2.75 0 012.75 2zm4.32 8.5a2.18 2.18 0 100-4.36 2.18 2.18 0 000 4.36zm6.93 0a2.18 2.18 0 100-4.36 2.18 2.18 0 000 4.36zm-6.93 6.36a2.18 2.18 0 100-4.36 2.18 2.18 0 000 4.36zm6.93 0a2.18 2.18 0 100-4.36 2.18 2.18 0 000 4.36z" />
    </svg>
  ),
  direct: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
}

// Star rating component
function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={star <= rating ? 'var(--accent)' : 'none'}
          stroke="var(--accent)"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

interface TestimonialsSectionProps {
  section: TestimonialsSectionType
  lang: 'en' | 'he'
}

export function TestimonialsSection({ section, lang }: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const isRTL = lang === 'he'

  const getText = useCallback((text: { en: string; he?: string } | undefined) => {
    if (!text) return ''
    return lang === 'he' && text.he ? text.he : text.en
  }, [lang])

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % section.items.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + section.items.length) % section.items.length)
  }

  return (
    <section
      className="testimonials-section"
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

        {/* Carousel Layout */}
        {section.layout === 'carousel' && (
          <div style={{ position: 'relative' }}>
            {/* Testimonial Card */}
            <div
              style={{
                maxWidth: '700px',
                margin: '0 auto',
                backgroundColor: 'var(--background-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-card)',
                textAlign: 'center',
              }}
            >
              {/* Quote */}
              <blockquote
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                  color: 'var(--foreground)',
                  margin: 0,
                  marginBottom: '1.5rem',
                }}
              >
                "{getText(section.items[activeIndex].quote)}"
              </blockquote>

              {/* Rating */}
              {section.items[activeIndex].rating && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <StarRating rating={section.items[activeIndex].rating!} />
                </div>
              )}

              {/* Author & Source */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                  }}
                >
                  {section.items[activeIndex].author}
                </span>

                {section.items[activeIndex].source && (
                  <>
                    <span style={{ color: 'var(--foreground-subtle)' }}>·</span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--foreground-muted)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {SOURCE_ICONS[section.items[activeIndex].source!]?.({ size: 14 })}
                      {section.items[activeIndex].source}
                    </span>
                  </>
                )}

                {section.items[activeIndex].date && (
                  <>
                    <span style={{ color: 'var(--foreground-subtle)' }}>·</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--foreground-subtle)',
                      }}
                    >
                      {section.items[activeIndex].date}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Navigation */}
            {section.items.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '0',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--background-elevated)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--foreground)',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 15L7 10L12 5" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '0',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--background-elevated)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--foreground)',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 5L13 10L8 15" />
                  </svg>
                </button>

                {/* Dots */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1.5rem',
                  }}
                >
                  {section.items.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: idx === activeIndex ? 'var(--accent)' : 'var(--border)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'var(--transition-fast)',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Grid Layout */}
        {section.layout === 'grid' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--grid-gap)',
            }}
          >
            {section.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--background-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <blockquote
                  style={{
                    fontSize: '0.9375rem',
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'italic',
                    lineHeight: 1.7,
                    color: 'var(--foreground)',
                    margin: 0,
                    marginBottom: '1rem',
                  }}
                >
                  "{getText(item.quote)}"
                </blockquote>

                {item.rating && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <StarRating rating={item.rating} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>
                    {item.author}
                  </span>
                  {item.source && SOURCE_ICONS[item.source] && (
                    <span style={{ color: 'var(--foreground-muted)' }}>
                      {SOURCE_ICONS[item.source]({ size: 14 })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Layout (first large, rest small) */}
        {section.layout === 'featured' && section.items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--grid-gap)' }}>
            {/* Featured testimonial */}
            <div
              style={{
                backgroundColor: 'var(--background-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem',
                boxShadow: 'var(--shadow-card)',
                textAlign: 'center',
              }}
            >
              <blockquote
                style={{
                  fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                  fontFamily: 'var(--font-heading)',
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                  color: 'var(--foreground)',
                  margin: 0,
                  marginBottom: '1.5rem',
                  maxWidth: '700px',
                  marginInline: 'auto',
                }}
              >
                "{getText(section.items[0].quote)}"
              </blockquote>

              {section.items[0].rating && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <StarRating rating={section.items[0].rating} />
                </div>
              )}

              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                {section.items[0].author}
              </span>
            </div>

            {/* Other testimonials */}
            {section.items.length > 1 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {section.items.slice(1).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--background-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                    }}
                  >
                    <blockquote
                      style={{
                        fontSize: '0.875rem',
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        color: 'var(--foreground-muted)',
                        margin: 0,
                        marginBottom: '0.75rem',
                      }}
                    >
                      "{getText(item.quote)}"
                    </blockquote>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)' }}>
                      — {item.author}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default TestimonialsSection
