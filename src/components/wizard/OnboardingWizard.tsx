// ═══════════════════════════════════════════════════════════════════════════════
// HOST ONBOARDING WIZARD
// ═══════════════════════════════════════════════════════════════════════════════
// Guided flow to create HostFrontPageSpec. Not freeform - guardrails ensure
// Rently-level quality output regardless of host design skills.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback } from 'react'
import {
  type HostFrontPageSpec,
  type TemplateRig,
  getAllTemplateRigs,
  createMinimalSpec,
} from '@/lib/specs'

// ─── Types ──────────────────────────────────────────────────────────────────────
type WizardStep =
  | 'template'
  | 'brand'
  | 'media'
  | 'content'
  | 'preview'

interface WizardState {
  currentStep: WizardStep
  spec: Partial<HostFrontPageSpec>
  isValid: Record<WizardStep, boolean>
}

interface OnboardingWizardProps {
  onComplete: (spec: HostFrontPageSpec) => void
  onCancel: () => void
  initialSpec?: Partial<HostFrontPageSpec>
}

// ─── Step Components ────────────────────────────────────────────────────────────

// STEP 1: Template Selection
function TemplateStep({
  selectedRig,
  onSelect,
}: {
  selectedRig?: TemplateRig
  onSelect: (rig: TemplateRig) => void
}) {
  const rigs = getAllTemplateRigs()

  return (
    <div className="template-step">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Choose Your Template
        </h2>
        <p style={{ color: '#666' }}>
          Select a design template that matches your property style. Each template is professionally
          designed to showcase your listings beautifully.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {rigs.map((rig) => (
          <button
            key={rig.id}
            onClick={() => onSelect(rig.id)}
            style={{
              position: 'relative',
              textAlign: 'left',
              padding: '1.5rem',
              borderRadius: '12px',
              border: selectedRig === rig.id ? '2px solid #B5846D' : '2px solid #e5e5e5',
              backgroundColor: selectedRig === rig.id ? 'rgba(181, 132, 109, 0.05)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Preview colors */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: rig.colors.heroBackground,
                }}
              />
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: rig.colors.accent,
                }}
              />
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: rig.colors.background,
                  border: '1px solid #e5e5e5',
                }}
              />
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              {rig.name}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
              {rig.description}
            </p>

            {/* Selected badge */}
            {selectedRig === rig.id && (
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#B5846D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// STEP 2: Brand Setup
function BrandStep({
  brand,
  onUpdate,
}: {
  brand: Partial<HostFrontPageSpec['brand']>
  onUpdate: (brand: Partial<HostFrontPageSpec['brand']>) => void
}) {
  const handleChange = (field: string, value: string) => {
    const parts = field.split('.')
    if (parts.length === 1) {
      onUpdate({ ...brand, [field]: value })
    } else if (parts.length === 2) {
      const [parent, child] = parts
      onUpdate({
        ...brand,
        [parent]: {
          ...(brand as Record<string, Record<string, string>>)[parent],
          [child]: value,
        },
      })
    }
  }

  return (
    <div className="brand-step">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Your Brand Details
        </h2>
        <p style={{ color: '#666' }}>
          Tell us about your business. This information will appear on your website.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
        {/* Contact Info */}
        <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: '12px', padding: '1.5rem' }}>
          <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
            Contact Information
          </legend>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={brand.contact?.phone || ''}
                onChange={(e) => handleChange('contact.phone', e.target.value)}
                placeholder="+972 50 123 4567"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={brand.contact?.email || ''}
                onChange={(e) => handleChange('contact.email', e.target.value)}
                placeholder="hello@yourbrand.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                WhatsApp Link (optional)
              </label>
              <input
                type="url"
                value={brand.contact?.whatsapp || ''}
                onChange={(e) => handleChange('contact.whatsapp', e.target.value)}
                placeholder="https://wa.me/972501234567"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>
        </fieldset>

        {/* Location */}
        <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: '12px', padding: '1.5rem' }}>
          <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
            Location
          </legend>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Location Name *
              </label>
              <input
                type="text"
                value={brand.location?.name || ''}
                onChange={(e) => handleChange('location.name', e.target.value)}
                placeholder="Tel Aviv, Israel"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Full Address (optional)
              </label>
              <input
                type="text"
                value={brand.location?.address || ''}
                onChange={(e) => handleChange('location.address', e.target.value)}
                placeholder="123 Beach Street, Tel Aviv"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>
        </fieldset>

        {/* Customization */}
        <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: '12px', padding: '1.5rem' }}>
          <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
            Customization
          </legend>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Accent Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="color"
                  value={brand.accentColor || '#B5846D'}
                  onChange={(e) => onUpdate({ ...brand, accentColor: e.target.value })}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#666' }}>
                  {brand.accentColor || '#B5846D'}
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Font Style
              </label>
              <select
                value={brand.fontPreset || 'luxury'}
                onChange={(e) => onUpdate({ ...brand, fontPreset: e.target.value as HostFrontPageSpec['brand']['fontPreset'] })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              >
                <option value="luxury">Luxury (Elegant serif headings)</option>
                <option value="editorial">Editorial (Classic serif)</option>
                <option value="modern">Modern (Clean sans-serif)</option>
                <option value="friendly">Friendly (Rounded, approachable)</option>
              </select>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  )
}

// STEP 3: Media Upload
function MediaStep({
  media,
  onUpdate,
}: {
  media: Partial<HostFrontPageSpec['media']>
  onUpdate: (media: Partial<HostFrontPageSpec['media']>) => void
}) {
  const [heroImageUrl, setHeroImageUrl] = useState('')

  const addHeroImage = () => {
    if (heroImageUrl.trim()) {
      onUpdate({
        ...media,
        heroImages: [...(media.heroImages || []), heroImageUrl.trim()],
      })
      setHeroImageUrl('')
    }
  }

  const removeHeroImage = (index: number) => {
    onUpdate({
      ...media,
      heroImages: (media.heroImages || []).filter((_, i) => i !== index),
    })
  }

  return (
    <div className="media-step">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Hero Media
        </h2>
        <p style={{ color: '#666' }}>
          Add stunning images or video for your homepage hero section.
          These are the first thing visitors will see.
        </p>
      </div>

      <div style={{ maxWidth: '700px' }}>
        {/* Hero Video */}
        <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
            Hero Video (Optional - Recommended)
          </legend>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Video URL
            </label>
            <input
              type="url"
              value={media.heroVideo?.url || ''}
              onChange={(e) => onUpdate({
                ...media,
                heroVideo: e.target.value ? { url: e.target.value } : undefined,
              })}
              placeholder="https://example.com/hero-video.mp4"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
              Tip: Use a short (10-30s) looping video without audio for best results.
            </p>
          </div>
        </fieldset>

        {/* Hero Images */}
        <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: '12px', padding: '1.5rem' }}>
          <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
            Hero Images {!media.heroVideo?.url && '*'}
          </legend>

          {/* Existing images */}
          {(media.heroImages || []).length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              {(media.heroImages || []).map((url, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    aspectRatio: '16/10',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  <img
                    src={url}
                    alt={`Hero ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <button
                    onClick={() => removeHeroImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add image */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
              onKeyDown={(e) => e.key === 'Enter' && addHeroImage()}
            />
            <button
              onClick={addHeroImage}
              disabled={!heroImageUrl.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: heroImageUrl.trim() ? '#B5846D' : '#ccc',
                color: 'white',
                fontWeight: 500,
                cursor: heroImageUrl.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Add
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
            Add at least 2-3 high-quality images. These will rotate as a slideshow if no video is provided.
          </p>
        </fieldset>
      </div>
    </div>
  )
}

// STEP 4: Content
function ContentStep({
  sections,
  onUpdate,
}: {
  sections: HostFrontPageSpec['sections']
  onUpdate: (sections: HostFrontPageSpec['sections']) => void
}) {
  // Find hero section
  const heroSection = sections.find((s) => s.type === 'hero')

  const updateHeroSection = (updates: Partial<typeof heroSection>) => {
    onUpdate(
      sections.map((s) => (s.type === 'hero' ? { ...s, ...updates } : s))
    )
  }

  return (
    <div className="content-step">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Website Content
        </h2>
        <p style={{ color: '#666' }}>
          Write compelling copy for your homepage. Keep it concise and engaging.
        </p>
      </div>

      <div style={{ maxWidth: '700px' }}>
        {/* Hero Content */}
        <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
            Hero Section
          </legend>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Eyebrow Text (small text above title)
              </label>
              <input
                type="text"
                value={(heroSection as { eyebrow?: { en: string } })?.eyebrow?.en || ''}
                onChange={(e) => updateHeroSection({ eyebrow: { en: e.target.value } })}
                placeholder="TEL AVIV · ISRAEL"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Main Title *
              </label>
              <input
                type="text"
                value={(heroSection as { title: { en: string } })?.title?.en || ''}
                onChange={(e) => updateHeroSection({ title: { en: e.target.value } })}
                placeholder="Welcome to Paradise"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Subtitle / Description
              </label>
              <textarea
                value={(heroSection as { subtitle?: { en: string } })?.subtitle?.en || ''}
                onChange={(e) => updateHeroSection({ subtitle: { en: e.target.value } })}
                placeholder="Luxury vacation rentals with stunning views and premium amenities."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Button Text
              </label>
              <input
                type="text"
                value={(heroSection as { ctaText?: { en: string } })?.ctaText?.en || ''}
                onChange={(e) => updateHeroSection({ ctaText: { en: e.target.value } })}
                placeholder="Explore Properties"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>
        </fieldset>

        {/* SEO Info */}
        <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: '12px', padding: '1.5rem' }}>
          <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
            SEO & Meta Information
          </legend>

          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
            This information helps your site rank better in search engines.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Page Title
              </label>
              <input
                type="text"
                placeholder="Your Brand | Luxury Vacation Rentals"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Meta Description
              </label>
              <textarea
                placeholder="Discover luxury vacation rentals in the heart of the city..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  )
}

// STEP 5: Preview
function PreviewStep({
  spec,
}: {
  spec: Partial<HostFrontPageSpec>
}) {
  return (
    <div className="preview-step">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Preview Your Website
        </h2>
        <p style={{ color: '#666' }}>
          Review how your website will look. You can always make changes later.
        </p>
      </div>

      {/* Preview iframe or summary */}
      <div
        style={{
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#e5e5e5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#febc2e' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28c840' }} />
          </div>
          <div
            style={{
              flex: 1,
              marginLeft: '1rem',
              padding: '0.375rem 1rem',
              backgroundColor: 'white',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#666',
            }}
          >
            hostly.io/h/your-brand
          </div>
        </div>

        {/* Preview content */}
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '16/9',
              backgroundColor: spec.templateRig === 'cinematic-luxury' ? '#0a0a0a' : '#fff',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: spec.templateRig === 'cinematic-luxury' ? '#fff' : '#000',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Hero image preview */}
            {spec.media?.heroImages?.[0] && (
              <img
                src={spec.media.heroImages[0]}
                alt="Preview"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.6,
                }}
              />
            )}

            <div style={{ position: 'relative', zIndex: 1, padding: '2rem' }}>
              {(spec.sections?.[0] as { eyebrow?: { en: string } })?.eyebrow?.en && (
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', opacity: 0.7, marginBottom: '0.5rem' }}>
                  {(spec.sections?.[0] as { eyebrow?: { en: string } }).eyebrow?.en}
                </p>
              )}
              <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '1rem' }}>
                {(spec.sections?.[0] as { title: { en: string } })?.title?.en || 'Your Website Title'}
              </h1>
              {(spec.sections?.[0] as { subtitle?: { en: string } })?.subtitle?.en && (
                <p style={{ fontSize: '0.875rem', opacity: 0.9, maxWidth: '400px' }}>
                  {(spec.sections?.[0] as { subtitle?: { en: string } }).subtitle?.en}
                </p>
              )}

              <button
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 2rem',
                  backgroundColor: spec.brand?.accentColor || '#B5846D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {(spec.sections?.[0] as { ctaText?: { en: string } })?.ctaText?.en || 'Book Now'}
              </button>
            </div>
          </div>

          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#666' }}>
            This is a simplified preview. Your actual website will include all sections with
            professional animations and responsive design.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Wizard Component ──────────────────────────────────────────────────────
export function OnboardingWizard({ onComplete, onCancel, initialSpec }: OnboardingWizardProps) {
  const [state, setState] = useState<WizardState>(() => ({
    currentStep: 'template',
    spec: initialSpec || createMinimalSpec({}),
    isValid: {
      template: !!initialSpec?.templateRig,
      brand: false,
      media: false,
      content: false,
      preview: true,
    },
  }))

  const steps: { id: WizardStep; label: string }[] = [
    { id: 'template', label: 'Template' },
    { id: 'brand', label: 'Brand' },
    { id: 'media', label: 'Media' },
    { id: 'content', label: 'Content' },
    { id: 'preview', label: 'Preview' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === state.currentStep)

  const updateSpec = useCallback((updates: Partial<HostFrontPageSpec>) => {
    setState((prev) => ({
      ...prev,
      spec: { ...prev.spec, ...updates },
    }))
  }, [])

  const goToStep = (step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }))
  }

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      goToStep(steps[currentStepIndex + 1].id)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      goToStep(steps[currentStepIndex - 1].id)
    }
  }

  const handleComplete = () => {
    // Validate and complete
    const finalSpec = {
      ...createMinimalSpec({}),
      ...state.spec,
      version: '1.0' as const,
    } as HostFrontPageSpec
    onComplete(finalSpec)
  }

  const canProceed = () => {
    switch (state.currentStep) {
      case 'template':
        return !!state.spec.templateRig
      case 'brand':
        return !!(state.spec.brand?.contact?.phone && state.spec.brand?.contact?.email && state.spec.brand?.location?.name)
      case 'media':
        return !!(state.spec.media?.heroVideo?.url || (state.spec.media?.heroImages?.length || 0) >= 1)
      case 'content':
        return !!(state.spec.sections?.[0] as { title: { en: string } })?.title?.en
      case 'preview':
        return true
      default:
        return false
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#fafafa',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.5rem 2rem',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            Create Your Website
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: 0, marginTop: '0.25rem' }}>
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.875rem',
            color: '#666',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {/* Progress */}
      <div
        style={{
          padding: '1rem 2rem',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => idx <= currentStepIndex && goToStep(step.id)}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: idx === currentStepIndex ? '#B5846D' : idx < currentStepIndex ? '#d4c4b5' : '#f0f0f0',
                color: idx <= currentStepIndex ? 'white' : '#999',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: idx <= currentStepIndex ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
        {state.currentStep === 'template' && (
          <TemplateStep
            selectedRig={state.spec.templateRig}
            onSelect={(rig) => updateSpec({ templateRig: rig })}
          />
        )}
        {state.currentStep === 'brand' && (
          <BrandStep
            brand={state.spec.brand || {}}
            onUpdate={(brand) => updateSpec({ brand: brand as HostFrontPageSpec['brand'] })}
          />
        )}
        {state.currentStep === 'media' && (
          <MediaStep
            media={state.spec.media || {}}
            onUpdate={(media) => updateSpec({ media: media as HostFrontPageSpec['media'] })}
          />
        )}
        {state.currentStep === 'content' && (
          <ContentStep
            sections={state.spec.sections || createMinimalSpec({}).sections}
            onUpdate={(sections) => updateSpec({ sections })}
          />
        )}
        {state.currentStep === 'preview' && (
          <PreviewStep spec={state.spec} />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '1rem 2rem',
          backgroundColor: 'white',
          borderTop: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
            backgroundColor: 'white',
            color: currentStepIndex === 0 ? '#ccc' : '#333',
            fontWeight: 500,
            cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Back
        </button>

        {state.currentStep === 'preview' ? (
          <button
            onClick={handleComplete}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#B5846D',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Publish Website
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: canProceed() ? '#B5846D' : '#ccc',
              color: 'white',
              fontWeight: 500,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  )
}

export default OnboardingWizard
