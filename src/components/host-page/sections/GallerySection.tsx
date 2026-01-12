// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY SECTION - Image grid/carousel
// ═══════════════════════════════════════════════════════════════════════════════
// Showcase property images in various layouts.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback } from 'react'
import type { GallerySection as GallerySectionType } from '@/lib/specs'

interface GallerySectionProps {
  section: GallerySectionType
  lang: 'en' | 'he'
}

export function GallerySection({ section, lang }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const isRTL = lang === 'he'

  const getText = useCallback((text: { en: string; he?: string } | undefined) => {
    if (!text) return ''
    return lang === 'he' && text.he ? text.he : text.en
  }, [lang])

  const openLightbox = (idx: number) => {
    setSelectedImage(idx)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = ''
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % section.images.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + section.images.length) % section.images.length)
    }
  }

  // Grid layout styles
  const getGridStyles = () => {
    switch (section.layout) {
      case 'masonry':
        return {
          columns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }
      case 'carousel':
        return {
          columns: 'repeat(auto-fill, 320px)',
          gap: '1rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
        } as const
      case 'lightbox-grid':
      case 'grid':
      default:
        return {
          columns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--grid-gap)',
        }
    }
  }

  const gridStyles = getGridStyles()

  return (
    <section
      className="gallery-section"
      style={{
        padding: 'var(--section-py) var(--section-px)',
        backgroundColor: 'var(--background)',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        {/* Header */}
        {(section.eyebrow || section.title) && (
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

            {section.title && (
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
            )}
          </div>
        )}

        {/* Gallery Grid */}
        <div
          style={{
            display: section.layout === 'carousel' ? 'flex' : 'grid',
            gridTemplateColumns: gridStyles.columns,
            gap: gridStyles.gap,
            ...(section.layout === 'carousel' && {
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              paddingBottom: '1rem',
            }),
          }}
        >
          {section.images.map((image, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx)}
              style={{
                position: 'relative',
                aspectRatio: 'var(--image-aspect-ratio)',
                borderRadius: 'var(--image-radius)',
                overflow: 'hidden',
                cursor: 'pointer',
                ...(section.layout === 'carousel' && {
                  minWidth: '320px',
                  scrollSnapAlign: 'start',
                }),
                ...(section.layout === 'masonry' && {
                  breakInside: 'avoid',
                }),
              }}
            >
              <img
                src={image.url}
                alt={getText(image.alt) || `Gallery image ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'var(--transition-normal)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              />

              {/* Caption overlay */}
              {image.caption && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '2rem 1rem 1rem',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: 'white',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.875rem',
                      margin: 0,
                    }}
                  >
                    {getText(image.caption)}
                  </p>
                </div>
              )}

              {/* Hover overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-normal)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0)'
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    opacity: 0,
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transition: 'var(--transition-fast)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Navigation */}
          {section.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={section.images[selectedImage].url}
            alt={getText(section.images[selectedImage].alt) || ''}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />

          {/* Counter */}
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
            }}
          >
            {selectedImage + 1} / {section.images.length}
          </div>
        </div>
      )}
    </section>
  )
}

export default GallerySection
