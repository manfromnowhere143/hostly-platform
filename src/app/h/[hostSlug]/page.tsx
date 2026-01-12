// ═══════════════════════════════════════════════════════════════════════════════
// HOST HOMEPAGE - Dynamic Host Page Router
// ═══════════════════════════════════════════════════════════════════════════════
// Routes to host pages with UnifiedSidebar
// Rently uses the unified sidebar with content from RentlyLuxuryWrapper
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { use, useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { HostPageRenderer } from '@/components/host-page'
import { RENTLY_REFERENCE_SPEC, type HostFrontPageSpec } from '@/lib/specs'

// ─── Unified Sidebar Import ────────────────────────────────────────────────────
import {
  UnifiedSidebar,
  getPublicNavGroups,
  getSocialLinks,
  getHostBrand,
  type NavItem,
  type SidebarTheme,
  type SidebarLang,
} from '@/components/unified-sidebar'

// ─── Legacy Sites - EXACT Original Websites ─────────────────────────────────────
const LEGACY_HOSTS = ['rently'] as const

// Dynamic import for Rently to avoid SSR issues
const RentlyLuxuryWrapper = dynamic(
  () => import('@/legacy-sites/rently/RentlyLuxuryWrapper'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #f8f6f3 0%, #ece8e3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(181, 132, 109, 0.2)',
          borderTopColor: '#b5846d',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    )
  }
)

// ─── Mock Host Specs Database ───────────────────────────────────────────────────
const hostSpecs: Record<string, HostFrontPageSpec> = {
  rently: RENTLY_REFERENCE_SPEC,
}

// ─── Mock Properties Database ───────────────────────────────────────────────────
const hostProperties: Record<string, Array<{
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
}>> = {
  rently: [
    {
      id: 'prop_s3',
      slug: 'seaside-mykonos',
      name: 'Mykonos Suite',
      images: [
        'https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634337893-l3jtei-PHOTO-2025-12-28-21-24-01_2.jpg',
      ],
      price: 1200,
      currency: 'ILS',
      specs: { bedrooms: 2, bathrooms: 2, guests: 6 },
    },
    {
      id: 'prop_s5',
      slug: 'seaside-santorini',
      name: 'Santorini Villa',
      images: [
        'https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634347821-cg18qq-PHOTO-2025-12-28-21-24-02.jpg',
      ],
      price: 1500,
      currency: 'ILS',
      specs: { bedrooms: 3, bathrooms: 2, guests: 8 },
    },
    {
      id: 'prop_e10',
      slug: 'eilat42-mango',
      name: 'Mango Penthouse',
      images: [
        'https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634356222-p71qye-PHOTO-2025-12-28-21-24-03_4.jpg',
      ],
      price: 900,
      currency: 'ILS',
      specs: { bedrooms: 2, bathrooms: 1, guests: 4 },
    },
  ],
}

// ─── Booking Modal Component ────────────────────────────────────────────────────
function BookingModal({
  isOpen,
  onClose,
  property,
}: {
  isOpen: boolean
  onClose: () => void
  property?: { id: string; name: string } | null
}) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            {property ? `Book ${property.name}` : 'Book Your Stay'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          This is a demo booking modal. In production, this would integrate with the Hostly booking system.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Check-in
            </label>
            <input
              type="date"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Check-out
            </label>
            <input
              type="date"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Guests
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          style={{
            width: '100%',
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--accent, #B5846D)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Check Availability
        </button>
      </div>
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────────────────
export default function HostHomePage({
  params,
}: {
  params: Promise<{ hostSlug: string }>
}) {
  const { hostSlug } = use(params)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<{ id: string; name: string } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Synchronized theme and language state
  const [currentTheme, setCurrentTheme] = useState<SidebarTheme>('white')
  const [currentLang, setCurrentLang] = useState<SidebarLang>('en')

  // Reference to the Rently content container for scrolling
  const contentRef = useRef<HTMLDivElement>(null)

  // Get host branding and navigation
  const hostBrand = getHostBrand(hostSlug)
  const navGroups = getPublicNavGroups(hostSlug)
  const socialLinks = getSocialLinks(hostSlug)

  // Handle navigation - scroll to section or navigate
  const handleNavigate = useCallback((item: NavItem) => {
    if (item.scrollTo) {
      // First try to find by ID (most reliable)
      let element = document.getElementById(item.scrollTo)

      // Fallback to data-section attribute
      if (!element) {
        element = document.querySelector(`[data-section="${item.scrollTo}"]`)
      }

      // Fallback to class name patterns
      if (!element) {
        const classMap: Record<string, string> = {
          'hero': '.cb-hero',
          'seaside': '.cb-seaside-hero',
          'eilat42': '.cb-gallery',
          'contact': '.cb-contact',
          'about': '.cb-experience',
        }
        element = document.querySelector(classMap[item.scrollTo] || `.${item.scrollTo}`)
      }

      if (element) {
        // Smooth scroll with offset for better positioning
        const headerOffset = 20
        const elementPosition = element.getBoundingClientRect().top + window.scrollY
        const offsetPosition = elementPosition - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
    // Close mobile menu after navigation
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }, [mobileMenuOpen])

  // Handle book button click - open Rently's booking system
  const handleBookClick = useCallback(() => {
    // Try to trigger Rently's booking modal
    const bookButton = document.querySelector('.ps-book-btn, .hero-book-btn, [data-book-now]') as HTMLButtonElement
    if (bookButton) {
      bookButton.click()
    } else {
      // Fallback to our booking modal
      setSelectedProperty(null)
      setBookingModalOpen(true)
    }
  }, [])

  // Sync theme with Rently content
  const handleThemeChange = useCallback((theme: SidebarTheme) => {
    setCurrentTheme(theme)
  }, [])

  // Sync language with Rently content
  const handleLangChange = useCallback((lang: SidebarLang) => {
    setCurrentLang(lang)
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEGACY HOST - Render with UnifiedSidebar + Rently Content
  // ═══════════════════════════════════════════════════════════════════════════════
  if (LEGACY_HOSTS.includes(hostSlug as typeof LEGACY_HOSTS[number])) {
    if (hostSlug === 'rently') {
      return (
        <div className="host-page-with-sidebar">
          <UnifiedSidebar
            mode="public"
            host={hostBrand ? {
              slug: hostBrand.slug,
              name: hostBrand.name,
              location: hostBrand.location,
              tagline: hostBrand.tagline,
            } : undefined}
            navGroups={navGroups}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            theme={currentTheme}
            onThemeChange={handleThemeChange}
            lang={currentLang}
            onLangChange={handleLangChange}
            showBookButton={true}
            onBookClick={handleBookClick}
            socialLinks={socialLinks}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
          />

          {/* Main content area */}
          <main
            ref={contentRef}
            className={`host-page-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
          >
            <RentlyLuxuryWrapper
              hideSidebar={true}
              theme={currentTheme}
              lang={currentLang}
              onThemeChange={handleThemeChange}
              onLangChange={handleLangChange}
            />
          </main>

          {/* Mobile menu button (fixed) */}
          <button
            className="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="mobile-menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <style jsx global>{`
            :root {
              --sidebar-width-expanded: 280px;
              --sidebar-width-collapsed: 72px;
            }

            .host-page-with-sidebar {
              display: flex;
              min-height: 100vh;
            }

            .host-page-content {
              flex: 1;
              margin-left: var(--sidebar-width-expanded);
              transition: margin-left 350ms cubic-bezier(0.4, 0, 0.2, 1);
              min-height: 100vh;
            }

            .host-page-content.sidebar-collapsed {
              margin-left: var(--sidebar-width-collapsed);
            }

            /* Rently content no-sidebar adjustments */
            .app-layout.no-sidebar {
              padding-left: 0 !important;
            }

            .app-layout.no-sidebar .main-content {
              margin-left: 0 !important;
              width: 100% !important;
            }

            .mobile-menu-trigger {
              position: fixed;
              bottom: 24px;
              left: 50%;
              transform: translateX(-50%);
              z-index: 100;
              padding: 14px 28px;
              background: linear-gradient(135deg, rgba(181, 132, 109, 0.95) 0%, rgba(161, 112, 89, 0.95) 100%);
              color: white;
              border: none;
              border-radius: 30px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              box-shadow: 0 4px 20px rgba(181, 132, 109, 0.4);
              display: none;
              align-items: center;
              gap: 8px;
              backdrop-filter: blur(10px);
            }

            .mobile-menu-icon {
              display: flex;
              flex-direction: column;
              gap: 4px;
              width: 18px;
            }

            .mobile-menu-icon span {
              display: block;
              height: 2px;
              background: white;
              border-radius: 1px;
              transition: all 0.3s ease;
            }

            .mobile-menu-icon span:nth-child(2) {
              width: 70%;
            }

            @media (max-width: 1024px) {
              .host-page-content {
                margin-left: 0;
              }

              .host-page-content.sidebar-collapsed {
                margin-left: 0;
              }

              .mobile-menu-trigger {
                display: flex;
              }
            }
          `}</style>

          <BookingModal
            isOpen={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            property={selectedProperty}
          />
        </div>
      )
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SPEC-DRIVEN HOSTS - Use HostPageRenderer with spec
  // ═══════════════════════════════════════════════════════════════════════════════
  const spec = hostSpecs[hostSlug]
  const properties = hostProperties[hostSlug] || []

  if (!spec) {
    notFound()
  }

  const handleBookProperty = (property: { id: string; name: string }) => {
    setSelectedProperty(property)
    setBookingModalOpen(true)
  }

  const handleBookGeneral = () => {
    setSelectedProperty(null)
    setBookingModalOpen(true)
  }

  return (
    <>
      <HostPageRenderer
        spec={spec}
        properties={properties}
        onBookProperty={handleBookProperty}
        onBookGeneral={handleBookGeneral}
        defaultLang="en"
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        property={selectedProperty}
      />
    </>
  )
}
