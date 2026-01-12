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
interface HostInfo {
  slug: string
  name: string
  location?: string
  tagline?: { en: string; he: string }
}

const DEFAULT_HOST: HostInfo = {
  slug: 'new-host',
  name: 'My Properties',
  location: '',
  tagline: { en: 'Vacation Rentals', he: 'השכרת נופש' },
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [hostInfo, setHostInfo] = useState<HostInfo>(DEFAULT_HOST)

  // ─── Auth Check & Load User Organization ────────────────────────────────────
  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/portal/login') {
      setIsAuthenticated(true)
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/portal/login')
    } else {
      setIsAuthenticated(true)

      // Load organization info from localStorage
      try {
        const orgData = localStorage.getItem('organization')
        if (orgData) {
          const org = JSON.parse(orgData)
          setHostInfo({
            slug: org.slug || 'my-properties',
            name: org.name || 'My Properties',
            location: '',
            tagline: { en: 'Vacation Rentals', he: 'השכרת נופש' },
          })
        }
      } catch (e) {
        console.error('Failed to parse organization data:', e)
      }
    }
  }, [pathname, router])

  // Get host navigation for sidebar
  const navGroups = getHostNavGroups(hostInfo.slug)

  // Handle navigation
  const handleNavigate = useCallback((item: NavItem) => {
    // Handle logout action
    if (item.action && typeof item.action === 'object' && 'type' in item.action && item.action.type === 'logout') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('organization')
      router.push('/portal/login')
      return
    }

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

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="animate-spin w-8 h-8 border-3 border-[#B5846D] border-t-transparent rounded-full" />
      </div>
    )
  }

  // For login page, render without sidebar
  if (pathname === '/portal/login') {
    return <>{children}</>
  }

  return (
    <div className={`portal-layout theme-${currentTheme}`}>
      <UnifiedSidebar
        mode="host"
        host={{
          slug: hostInfo.slug,
          name: hostInfo.name,
          location: hostInfo.location,
          tagline: hostInfo.tagline,
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
