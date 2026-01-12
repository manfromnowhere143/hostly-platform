// ═══════════════════════════════════════════════════════════════════════════════
// HOST PAGE LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════
// Layout for individual host branded pages.
// Legacy hosts (like Rently) use the unified sidebar.
// Spec-driven hosts use the standard Hostly header/footer.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// ─── Types ────────────────────────────────────────────────────────────────────
interface HostConfig {
  slug: string
  name: string
  tagline: string
  logo?: string
  location?: string
  theme: 'default' | 'luxury' | 'modern' | 'coastal'
  isLegacy: boolean // Legacy sites have custom-built pages (like Rently)
}

// ─── Legacy Hosts ─────────────────────────────────────────────────────────────
// These hosts have custom-built sites that include their own sidebar
const LEGACY_HOSTS = ['rently'] as const

// ─── Host Registry ────────────────────────────────────────────────────────────
// In production, this would come from database
const hosts: Record<string, HostConfig> = {
  rently: {
    slug: 'rently',
    name: 'Rently',
    tagline: 'Luxury Vacation Rentals',
    location: 'Eilat, Israel',
    theme: 'luxury',
    isLegacy: true,
  },
}

// ─── Metadata Generation ──────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ hostSlug: string }>
}): Promise<Metadata> {
  const { hostSlug } = await params
  const host = hosts[hostSlug]

  if (!host) {
    return {
      title: 'Host Not Found',
    }
  }

  return {
    title: {
      default: `${host.name} - ${host.tagline}`,
      template: `%s | ${host.name}`,
    },
    description: `Book directly with ${host.name}. ${host.tagline}.`,
    openGraph: {
      title: host.name,
      description: host.tagline,
      siteName: host.name,
    },
  }
}

// ─── Layout Component ─────────────────────────────────────────────────────────
export default async function HostLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ hostSlug: string }>
}) {
  const { hostSlug } = await params
  const host = hosts[hostSlug]

  if (!host) {
    notFound()
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEGACY HOSTS - Have their own sidebar built in
  // ═══════════════════════════════════════════════════════════════════════════════
  if (host.isLegacy) {
    return (
      <div data-host={host.slug} data-legacy="true" className="min-h-screen">
        {children}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SPEC-DRIVEN HOSTS - Use standard Hostly header/footer
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <div data-host={host.slug} className="min-h-screen flex flex-col">
      <Header
        variant="host"
        hostSlug={host.slug}
        hostName={host.name}
        hostLogo={host.logo}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer
        variant="host"
        hostSlug={host.slug}
        hostName={host.name}
      />
    </div>
  )
}
