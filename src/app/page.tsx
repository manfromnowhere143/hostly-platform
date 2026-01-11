import { redirect } from 'next/navigation'

/**
 * Root page - redirects to admin dashboard
 *
 * Hostly is a backend API platform. The guest-facing UI is Rently.
 * This root route redirects hosts to the admin dashboard.
 */
export default function Home() {
  // In production, redirect to dashboard or login
  // For now, show API status

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#faf9f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {/* Minimal Logo */}
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: '#1a1a1a',
            marginBottom: '0.5rem',
          }}
        >
          HOSTLY
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#666',
            letterSpacing: '0.1em',
            marginBottom: '3rem',
          }}
        >
          VACATION RENTAL PLATFORM
        </p>

        {/* Status Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: '#fff',
            borderRadius: '100px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
            }}
          />
          <span style={{ fontSize: '0.875rem', color: '#1a1a1a' }}>
            API Operational
          </span>
        </div>

        {/* Links */}
        <div
          style={{
            marginTop: '3rem',
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
          }}
        >
          <a
            href="/api/health/db"
            style={{
              fontSize: '0.75rem',
              color: '#b5846d',
              textDecoration: 'none',
              letterSpacing: '0.1em',
            }}
          >
            HEALTH CHECK
          </a>
          <a
            href="https://rently-luxury.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.75rem',
              color: '#b5846d',
              textDecoration: 'none',
              letterSpacing: '0.1em',
            }}
          >
            RENTLY LUXURY →
          </a>
        </div>

        {/* Version */}
        <p
          style={{
            marginTop: '4rem',
            fontSize: '0.625rem',
            color: '#999',
            letterSpacing: '0.15em',
          }}
        >
          v1.0.0
        </p>
      </div>
    </main>
  )
}
