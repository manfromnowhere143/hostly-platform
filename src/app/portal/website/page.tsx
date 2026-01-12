// ═══════════════════════════════════════════════════════════════════════════════
// WEBSITE BUILDER - Host Portal
// ═══════════════════════════════════════════════════════════════════════════════
// Onboarding wizard for creating/editing host website
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingWizard } from '@/components/wizard'
import type { HostFrontPageSpec } from '@/lib/specs'

export default function WebsiteBuilderPage() {
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(false)
  const [hasWebsite, setHasWebsite] = useState(false) // In production, check from database

  const handleComplete = (spec: HostFrontPageSpec) => {
    // In production, save to database
    console.log('Website spec created:', spec)
    setHasWebsite(true)
    setShowWizard(false)
    // Show success message
  }

  const handleCancel = () => {
    setShowWizard(false)
  }

  if (showWizard) {
    return (
      <div style={{ height: '100vh' }}>
        <OnboardingWizard
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Your Website
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Create and manage your professional vacation rental website.
        </p>

        {hasWebsite ? (
          // Website exists - show management UI
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid #e5e5e5',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Your Website is Live
                </h2>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Your website is published and accepting visitors.
                </p>
              </div>
              <span
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Published
              </span>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                Your website URL
              </p>
              <a
                href="/h/your-brand"
                target="_blank"
                style={{
                  fontSize: '1rem',
                  color: '#B5846D',
                  textDecoration: 'none',
                }}
              >
                hostly.io/h/your-brand
              </a>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowWizard(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Edit Website
              </button>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#B5846D',
                  color: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                View Website
              </button>
            </div>
          </div>
        ) : (
          // No website yet - show creation prompt
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '3rem',
              border: '1px solid #e5e5e5',
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'rgba(181, 132, 109, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B5846D" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <circle cx="7.5" cy="6" r="1" fill="#B5846D" stroke="none" />
                <circle cx="10.5" cy="6" r="1" fill="#B5846D" stroke="none" />
              </svg>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Create Your Website
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              Build a stunning, professional website for your vacation rentals in minutes.
              No design skills required.
            </p>

            <button
              onClick={() => setShowWizard(true)}
              style={{
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#B5846D',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Get Started
            </button>

            {/* Features */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid #e5e5e5',
              }}
            >
              {[
                { title: 'Professional Design', desc: 'Rently-level quality, automatically' },
                { title: 'Mobile Optimized', desc: 'Perfect on every device' },
                { title: 'SEO Ready', desc: 'Get found by guests searching online' },
              ].map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#666' }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
