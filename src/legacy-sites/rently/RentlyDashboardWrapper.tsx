// ═══════════════════════════════════════════════════════════════════════════════
// RENTLY DASHBOARD WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
// Wraps the state-of-the-art Rently dashboard for use in Hostly portal.
// Full bilingual support, RTL-ready, mobile-first design.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Import styles
import './styles/index.css'
import './styles/dashboard.css'

// ─── Props Interface ─────────────────────────────────────────────────────────
interface RentlyDashboardWrapperProps {
  lang?: 'en' | 'he'
  theme?: 'white' | 'cream' | 'petra' | 'dark'
  onLangChange?: (lang: 'en' | 'he') => void
  onThemeChange?: (theme: 'white' | 'cream' | 'petra' | 'dark') => void
}

// Dynamic import for dashboard components to avoid SSR issues
const Dashboard = dynamic(
  () => import('./pages/Dashboard'),
  {
    ssr: false,
    loading: () => <DashboardLoadingPlaceholder />
  }
)

// Loading placeholder
function DashboardLoadingPlaceholder() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f6f3 0%, #ece8e3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '2px solid rgba(181, 132, 109, 0.2)',
        borderTopColor: '#b5846d',
        borderRadius: '50%',
        animation: 'dashboard-spin 1s linear infinite',
      }} />
      <p style={{
        color: '#b5846d',
        fontSize: '14px',
        fontWeight: 500,
      }}>
        Loading Dashboard...
      </p>
      <style>{`
        @keyframes dashboard-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ─── Main Wrapper Component ───────────────────────────────────────────────────
export default function RentlyDashboardWrapper({
  lang,
  theme,
  onLangChange,
  onThemeChange,
}: RentlyDashboardWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <DashboardLoadingPlaceholder />
  }

  return (
    <div className="rently rently-dashboard-container">
      <Dashboard />
    </div>
  )
}
