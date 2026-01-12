// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER SECTION - Page footer
// ═══════════════════════════════════════════════════════════════════════════════
// Social links, contact info, copyright. Clean and minimal.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useCallback, type JSX } from 'react'
import type { FooterSection as FooterSectionType, BrandSettings } from '@/lib/specs'

// Social icons - explicitly typed to return JSX.Element
const SOCIAL_ICONS: Record<string, (props: { size?: number }) => JSX.Element> = {
  instagram: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  twitter: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  ),
  youtube: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  ),
}

interface FooterSectionProps {
  section: FooterSectionType
  brand: BrandSettings
  lang: 'en' | 'he'
  onNavClick?: (section: string) => void
}

export function FooterSection({ section, brand, lang, onNavClick }: FooterSectionProps) {
  const isRTL = lang === 'he'
  const year = new Date().getFullYear()

  const getText = useCallback((text: { en: string; he?: string } | undefined) => {
    if (!text) return ''
    return lang === 'he' && text.he ? text.he : text.en
  }, [lang])

  const defaultCopyright = {
    en: `© ${year} All rights reserved.`,
    he: `© ${year} כל הזכויות שמורות.`,
  }

  return (
    <footer
      className="footer-section"
      style={{
        padding: '3rem var(--section-px) 2rem',
        backgroundColor: 'var(--background-subtle)',
        borderTop: '1px solid var(--border)',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
        }}
      >
        {/* Main Footer Content */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Logo / Brand */}
          {brand.logo && (
            <div>
              <img
                src={brand.logo.url}
                alt={brand.logo.alt}
                style={{
                  height: brand.logo.height || 40,
                  width: 'auto',
                }}
              />
            </div>
          )}

          {/* Navigation Links */}
          {section.showNavLinks && (
            <nav
              style={{
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => onNavClick?.('hero')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.875rem',
                  color: 'var(--foreground-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
              >
                {lang === 'he' ? 'ראשי' : 'Home'}
              </button>
              <button
                onClick={() => onNavClick?.('listings')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.875rem',
                  color: 'var(--foreground-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
              >
                {lang === 'he' ? 'נכסים' : 'Properties'}
              </button>
              <button
                onClick={() => onNavClick?.('amenities')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.875rem',
                  color: 'var(--foreground-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
              >
                {lang === 'he' ? 'מתקנים' : 'Amenities'}
              </button>
              <button
                onClick={() => onNavClick?.('contact')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.875rem',
                  color: 'var(--foreground-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
              >
                {lang === 'he' ? 'צור קשר' : 'Contact'}
              </button>
            </nav>
          )}

          {/* Contact Info */}
          {section.showContactInfo && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <a
                href={`tel:${brand.contact.phone}`}
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--foreground-muted)',
                  textDecoration: 'none',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
              >
                {brand.contact.phone}
              </a>
              <a
                href={`mailto:${brand.contact.email}`}
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--foreground-muted)',
                  textDecoration: 'none',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
              >
                {brand.contact.email}
              </a>
            </div>
          )}

          {/* Social Links */}
          {section.showSocialLinks && brand.social && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
              }}
            >
              {brand.social.instagram && (
                <a
                  href={brand.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--foreground-muted)',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                  aria-label="Instagram"
                >
                  {SOCIAL_ICONS.instagram({ size: 20 })}
                </a>
              )}
              {brand.social.facebook && (
                <a
                  href={brand.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--foreground-muted)',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                  aria-label="Facebook"
                >
                  {SOCIAL_ICONS.facebook({ size: 20 })}
                </a>
              )}
              {brand.social.twitter && (
                <a
                  href={brand.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--foreground-muted)',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                  aria-label="Twitter"
                >
                  {SOCIAL_ICONS.twitter({ size: 20 })}
                </a>
              )}
              {brand.social.youtube && (
                <a
                  href={brand.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--foreground-muted)',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                  aria-label="YouTube"
                >
                  {SOCIAL_ICONS.youtube({ size: 20 })}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-muted)',
          }}
        >
          {/* Copyright */}
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--foreground-subtle)',
            }}
          >
            {getText(section.copyrightText) || getText(defaultCopyright)}
          </span>

          {/* Powered by Hostly */}
          {section.showPoweredBy && (
            <a
              href="https://hostly.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem',
                color: 'var(--foreground-subtle)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-subtle)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Powered by Hostly
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
