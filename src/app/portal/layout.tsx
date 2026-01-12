// ═══════════════════════════════════════════════════════════════════════════════
// PORTAL/DASHBOARD LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════
// Layout for the host dashboard with UnifiedSidebar in host mode.
// State-of-the-art management interface for property managers.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import { PortalLayoutClient } from './portal-layout-client'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Hostly Dashboard',
  },
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>
}
