// ═══════════════════════════════════════════════════════════════════════════════
// PORTAL DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
// State-of-the-art host dashboard with analytics, revenue charts, and more.
// Uses Rently's professional dashboard design.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with the dashboard
const RentlyDashboardWrapper = dynamic(
  () => import('@/legacy-sites/rently/RentlyDashboardWrapper'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background-subtle, #f8f9fa)',
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

export default function DashboardPage() {
  return <RentlyDashboardWrapper />
}
