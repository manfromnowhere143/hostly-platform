// ═══════════════════════════════════════════════════════════════════════════════
// HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Responsive header with host branding support. Handles marketplace vs host page modes.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Avatar } from '@/components/ui'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface HeaderProps {
  variant?: 'marketplace' | 'host'
  hostSlug?: string
  hostName?: string
  hostLogo?: string
  user?: {
    name: string
    email: string
    avatar?: string
  } | null
  onSignIn?: () => void
  onSignOut?: () => void
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Header({
  variant = 'marketplace',
  hostSlug,
  hostName,
  hostLogo,
  user,
  onSignIn,
  onSignOut,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const { lang, setLang, t, isRTL } = useLanguage()

  const isHostPage = variant === 'host'

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] bg-[var(--background-elevated)] border-b border-[var(--border)]">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link
              href={isHostPage ? `/h/${hostSlug}` : '/'}
              className="flex items-center gap-3"
            >
              {isHostPage && hostLogo ? (
                <img
                  src={hostLogo}
                  alt={hostName || 'Host'}
                  className="h-8 w-auto"
                />
              ) : isHostPage && hostName ? (
                <span
                  className="text-xl font-bold text-[var(--brand-primary)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {hostName}
                </span>
              ) : (
                <span className="text-xl font-bold text-[var(--brand-primary)]">
                  Hostly
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {isHostPage ? (
                <>
                  <Link
                    href={`/h/${hostSlug}`}
                    className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--brand-primary)] transition-colors"
                  >
                    Properties
                  </Link>
                  <Link
                    href={`/h/${hostSlug}/about`}
                    className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href={`/h/${hostSlug}/contact`}
                    className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                  >
                    Contact
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/explore"
                    className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--brand-primary)] transition-colors"
                  >
                    {t('header.explore')}
                  </Link>
                  <Link
                    href="/hosts"
                    className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                  >
                    {t('header.hosts')}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Search (marketplace only) */}
          {!isHostPage && (
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-subtle)]" />
                <input
                  type="search"
                  placeholder={t('header.search')}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--background-subtle)] border border-transparent rounded-full text-sm focus:bg-[var(--background-elevated)] focus:border-[var(--border-focus)] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Language selector */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--background-subtle)]"
              >
                <GlobeIcon className="w-5 h-5" />
                <span>{lang === 'en' ? 'EN' : 'עב'}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-[var(--background-elevated)] rounded-[var(--radius-lg)] shadow-lg border border-[var(--border)] py-1 z-50">
                  <button
                    type="button"
                    onClick={() => { setLang('en'); setLangMenuOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--background-subtle)] ${lang === 'en' ? 'text-[var(--brand-primary)] font-medium' : 'text-[var(--foreground)]'}`}
                  >
                    <span>🇺🇸</span>
                    <span>English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLang('he'); setLangMenuOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--background-subtle)] ${lang === 'he' ? 'text-[var(--brand-primary)] font-medium' : 'text-[var(--foreground)]'}`}
                  >
                    <span>🇮🇱</span>
                    <span>עברית</span>
                  </button>
                </div>
              )}
            </div>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--background-subtle)] transition-colors"
                >
                  <Avatar
                    size="sm"
                    name={user.name}
                    src={user.avatar}
                  />
                  <MenuIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--background-elevated)] rounded-[var(--radius-lg)] shadow-lg border border-[var(--border)] py-1">
                    <div className="px-4 py-2 border-b border-[var(--border)]">
                      <p className="text-sm font-medium text-[var(--foreground)]">{user.name}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{user.email}</p>
                    </div>
                    <Link
                      href="/portal"
                      className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-subtle)]"
                    >
                      {t('header.dashboard')}
                    </Link>
                    <Link
                      href="/h/rently"
                      className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-subtle)]"
                    >
                      {lang === 'en' ? 'My Host Page' : 'עמוד המארח שלי'}
                    </Link>
                    <Link
                      href="/portal/bookings"
                      className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-subtle)]"
                    >
                      {t('header.myBookings')}
                    </Link>
                    <Link
                      href="/portal/settings"
                      className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-subtle)]"
                    >
                      {t('header.settings')}
                    </Link>
                    <hr className="my-1 border-[var(--border)]" />
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--error-500)] hover:bg-[var(--background-subtle)]"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignIn}
                >
                  {t('header.signIn')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  {t('header.listProperty')}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {mobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border)]">
            {/* Mobile search */}
            {!isHostPage && (
              <div className="mb-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-subtle)]" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-[var(--background-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
                  />
                </div>
              </div>
            )}

            {/* Mobile nav links */}
            <div className="space-y-1">
              {isHostPage ? (
                <>
                  <Link
                    href={`/h/${hostSlug}`}
                    className="block px-3 py-2 text-base font-medium text-[var(--foreground)] rounded-lg hover:bg-[var(--background-subtle)]"
                  >
                    Properties
                  </Link>
                  <Link
                    href={`/h/${hostSlug}/about`}
                    className="block px-3 py-2 text-base font-medium text-[var(--foreground-muted)] rounded-lg hover:bg-[var(--background-subtle)]"
                  >
                    About
                  </Link>
                  <Link
                    href={`/h/${hostSlug}/contact`}
                    className="block px-3 py-2 text-base font-medium text-[var(--foreground-muted)] rounded-lg hover:bg-[var(--background-subtle)]"
                  >
                    Contact
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/explore"
                    className="block px-3 py-2 text-base font-medium text-[var(--foreground)] rounded-lg hover:bg-[var(--background-subtle)]"
                  >
                    Explore
                  </Link>
                  <Link
                    href="/hosts"
                    className="block px-3 py-2 text-base font-medium text-[var(--foreground-muted)] rounded-lg hover:bg-[var(--background-subtle)]"
                  >
                    Hosts
                  </Link>
                </>
              )}
            </div>

            {/* Mobile CTA */}
            {!user && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <Button variant="primary" fullWidth>
                  List Your Property
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
