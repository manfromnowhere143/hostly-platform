// ═══════════════════════════════════════════════════════════════════════════════
// PORTAL LAYOUT CLIENT
// ═══════════════════════════════════════════════════════════════════════════════
// Client-side portal layout with UnifiedSidebar in host mode.
// State-of-the-art professional Airbnb-level dashboard layout.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  UnifiedSidebar,
  getHostNavGroups,
  type NavItem,
  type SidebarTheme,
  type SidebarLang,
} from '@/components/unified-sidebar'
import './portal-layout.css'

// ─── Host Configuration ────────────────────────────────────────────────────────
// In production, this would come from the authenticated user's session
const MOCK_HOST = {
  slug: 'rently',
  name: 'Rently',
  location: 'Eilat, Israel',
  tagline: { en: 'Luxury Vacation Rentals', he: 'השכרת נופש יוקרתית' },
}

export function PortalLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<SidebarTheme>('white')
  const [currentLang, setCurrentLang] = useState<SidebarLang>('en')

  // Get host navigation for sidebar
  const navGroups = getHostNavGroups(MOCK_HOST.slug)

  // Handle navigation
  const handleNavigate = useCallback((item: NavItem) => {
    if (item.href) {
      router.push(item.href)
    }
    setMobileMenuOpen(false)
  }, [router])

  // Apply theme class to body for dashboard CSS
  useEffect(() => {
    document.documentElement.setAttribute('data-portal-theme', currentTheme)
    return () => {
      document.documentElement.removeAttribute('data-portal-theme')
    }
  }, [currentTheme])

  return (
    <div className={`portal-layout theme-${currentTheme}`}>
      <UnifiedSidebar
        mode="host"
        host={{
          slug: MOCK_HOST.slug,
          name: MOCK_HOST.name,
          location: MOCK_HOST.location,
          tagline: MOCK_HOST.tagline,
        }}
        navGroups={navGroups}
        onNavigate={handleNavigate}
        activePath={pathname}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        theme={currentTheme}
        onThemeChange={setCurrentTheme}
        lang={currentLang}
        onLangChange={setCurrentLang}
        showBookButton={false}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content area - properly positioned next to sidebar */}
      <main className={`portal-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="portal-content">
          {children}
        </div>
      </main>

      {/* Mobile menu button */}
      <button
        className="portal-mobile-menu"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <span className="portal-menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span className="portal-menu-text">Menu</span>
      </button>
    </div>
  )
}
