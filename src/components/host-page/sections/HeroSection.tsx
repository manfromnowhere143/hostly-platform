// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION - Full-screen video/image with text overlay
// ═══════════════════════════════════════════════════════════════════════════════
// Cinematic entry point. Video autoplay with elegant text overlay.
// Implements Rently-level polish: bulletproof video, parallax, GPU animations
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { HeroSection as HeroSectionType, MediaAssets, BrandSettings } from '@/lib/specs'

interface HeroSectionProps {
  section: HeroSectionType
  media: MediaAssets
  brand: BrandSettings
  lang: 'en' | 'he'
  onCtaClick?: () => void
}

export function HeroSection({ section, media, brand, lang, onCtaClick }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [scrollY, setScrollY] = useState(0)

  const isRTL = lang === 'he'
  const hasVideo = !!media.heroVideo?.url

  // Bulletproof video autoplay
  useEffect(() => {
    const video = videoRef.current
    if (!video || !hasVideo) return

    const tryPlay = async () => {
      try {
        video.muted = true
        video.playsInline = true
        await video.play()
        setVideoLoaded(true)
      } catch {
        // Fallback to images if video fails
        setVideoLoaded(false)
      }
    }

    video.addEventListener('canplay', tryPlay)
    video.addEventListener('loadeddata', tryPlay)

    // Initial attempt
    if (video.readyState >= 3) {
      tryPlay()
    }

    return () => {
      video.removeEventListener('canplay', tryPlay)
      video.removeEventListener('loadeddata', tryPlay)
    }
  }, [hasVideo])

  // Image carousel fallback
  useEffect(() => {
    if (videoLoaded || media.heroImages.length <= 1) return

    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % media.heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [videoLoaded, media.heroImages.length])

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY * 0.3)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getText = useCallback((text: { en: string; he?: string } | undefined) => {
    if (!text) return ''
    return lang === 'he' && text.he ? text.he : text.en
  }, [lang])

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick()
    } else if (section.ctaAction === 'scroll-to-listings') {
      document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
    } else if (section.ctaAction === 'scroll-to-contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      className="hero-section"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '600px',
        overflow: 'hidden',
        backgroundColor: 'var(--hero-bg)',
        color: 'var(--hero-text)',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Video/Image Background */}
      <div
        className="hero-media"
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateY(${scrollY}px) translateZ(0)`,
          willChange: 'transform',
        }}
      >
        {/* Video */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={media.heroVideo?.url}
            poster={media.heroVideo?.poster || media.heroImages[0]}
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              width: '100%',
              height: '120%',
              objectFit: 'cover',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 1s ease-out',
            }}
          />
        )}

        {/* Image Fallback/Carousel */}
        {(!hasVideo || !videoLoaded) && media.heroImages.length > 0 && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {media.heroImages.map((img, idx) => (
              <img
                key={img}
                src={img}
                alt=""
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '120%',
                  objectFit: 'cover',
                  opacity: idx === imageIndex ? 1 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                }}
              />
            ))}
          </div>
        )}

        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--hero-video-overlay)',
          }}
        />
      </div>

      {/* Content */}
      <div
        className="hero-content"
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'var(--section-px)',
          maxWidth: 'var(--content-max-width)',
          margin: '0 auto',
        }}
      >
        {/* Eyebrow */}
        {section.eyebrow && (
          <span
            className="hero-eyebrow"
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-accent)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              opacity: 0.8,
              marginBottom: '1.5rem',
            }}
          >
            {getText(section.eyebrow)}
          </span>
        )}

        {/* Title */}
        <h1
          className="hero-title"
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-heading-weight)',
            letterSpacing: 'var(--tracking-heading)',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: '1.5rem',
          }}
        >
          {getText(section.title)}
        </h1>

        {/* Subtitle */}
        {section.subtitle && (
          <p
            className="hero-subtitle"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontFamily: 'var(--font-body)',
              fontWeight: 'var(--font-body-weight)',
              letterSpacing: 'var(--tracking-body)',
              lineHeight: 1.6,
              maxWidth: '600px',
              opacity: 0.9,
              marginBottom: '2rem',
            }}
          >
            {getText(section.subtitle)}
          </p>
        )}

        {/* CTA Button */}
        {section.ctaText && (
          <button
            onClick={handleCta}
            className="hero-cta"
            style={{
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: 'var(--button-padding)',
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
            {getText(section.ctaText)}
          </button>
        )}
      </div>

      {/* Scroll Indicator */}
      <div
        className="scroll-indicator"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: 0.6,
          animation: 'bounce 2s ease-in-out infinite',
        }}
      >
        <span style={{ fontSize: '0.625rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 4v16M3 15l5 5 5-5" />
        </svg>
      </div>

      {/* Keyframes for bounce animation */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </section>
  )
}

export default HeroSection
