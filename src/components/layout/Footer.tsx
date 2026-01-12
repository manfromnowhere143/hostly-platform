// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Site footer with links, social icons, and legal info.
// ═══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FooterProps {
  variant?: 'marketplace' | 'host'
  hostSlug?: string
  hostName?: string
}

// ─── Social Icons ─────────────────────────────────────────────────────────────
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Footer({ variant = 'marketplace', hostSlug, hostName }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const isHostPage = variant === 'host'

  const marketplaceLinks = {
    company: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
    ],
    hosting: [
      { label: 'List Your Property', href: '/host' },
      { label: 'Host Resources', href: '/host/resources' },
      { label: 'Community Forum', href: '/community' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Safety Information', href: '/safety' },
      { label: 'Cancellation Options', href: '/cancellation' },
      { label: 'COVID-19 Response', href: '/covid' },
    ],
  }

  const hostLinks = {
    explore: [
      { label: 'All Properties', href: `/h/${hostSlug}` },
      { label: 'About Us', href: `/h/${hostSlug}/about` },
      { label: 'Contact', href: `/h/${hostSlug}/contact` },
    ],
    support: [
      { label: 'FAQ', href: `/h/${hostSlug}/faq` },
      { label: 'Booking Policy', href: `/h/${hostSlug}/policy` },
      { label: 'House Rules', href: `/h/${hostSlug}/rules` },
    ],
  }

  return (
    <footer className="bg-[var(--background-subtle)] border-t border-[var(--border)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href={isHostPage ? `/h/${hostSlug}` : '/'} className="inline-block mb-4">
              <span
                className="text-xl font-bold text-[var(--brand-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {isHostPage ? hostName : 'Hostly'}
              </span>
            </Link>
            <p className="text-sm text-[var(--foreground-muted)] mb-4">
              {isHostPage
                ? 'Luxury vacation rentals curated for unforgettable experiences.'
                : 'Discover unique stays and experiences around the world.'}
            </p>

            {/* Social links */}
            <div className="flex gap-4">
              <a
                href="#"
                className="text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links columns */}
          {isHostPage ? (
            <>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
                  Explore
                </h3>
                <ul className="space-y-3">
                  {hostLinks.explore.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
                  Support
                </h3>
                <ul className="space-y-3">
                  {hostLinks.support.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
                  Company
                </h3>
                <ul className="space-y-3">
                  {marketplaceLinks.company.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
                  Hosting
                </h3>
                <ul className="space-y-3">
                  {marketplaceLinks.hosting.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
                  Support
                </h3>
                <ul className="space-y-3">
                  {marketplaceLinks.support.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--foreground-muted)] hover:text-[var(--brand-primary)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--foreground-muted)]">
            &copy; {currentYear} {isHostPage ? hostName : 'Hostly'}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/sitemap"
              className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>

        {/* Powered by Hostly (for host pages) */}
        {isHostPage && (
          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--foreground-subtle)]">
              Powered by{' '}
              <Link href="/" className="hover:text-[var(--brand-primary)] transition-colors">
                Hostly
              </Link>
            </p>
          </div>
        )}
      </div>
    </footer>
  )
}

export default Footer
