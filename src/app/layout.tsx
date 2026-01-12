// ═══════════════════════════════════════════════════════════════════════════════
// ROOT LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════
// Global layout wrapper with fonts and providers.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { BookingProvider } from '@/contexts/BookingContext'
import { BookingModal } from '@/components/booking'
import './globals.css'

// ─── Fonts ────────────────────────────────────────────────────────────────────
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

// Playfair Display for luxury branding (Rently)
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Hostly - Vacation Rental Platform',
    template: '%s | Hostly',
  },
  description: 'Discover unique vacation rentals and experiences. Book directly with trusted hosts.',
  keywords: ['vacation rentals', 'holiday homes', 'short-term rentals', 'booking'],
  authors: [{ name: 'Hostly' }],
  creator: 'Hostly',
  publisher: 'Hostly',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Hostly',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@hostly',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${playfair.variable}
          antialiased
        `}
      >
        <LanguageProvider>
          <BookingProvider>
            {children}
            <BookingModal />
          </BookingProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
