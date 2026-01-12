// ═══════════════════════════════════════════════════════════════════════════════
// MARKETPLACE LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════
// Layout for the main marketplace (public browsing experience).
// ═══════════════════════════════════════════════════════════════════════════════

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="marketplace" />
      <main className="flex-1">
        {children}
      </main>
      <Footer variant="marketplace" />
    </div>
  )
}
