// ═══════════════════════════════════════════════════════════════════════════════
// RENTLY LUXURY WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
// Wraps the original Rently-Luxury website for integration into Hostly.
// Supports hideSidebar mode for use with UnifiedSidebar.
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Import Rently styles - scoped under .rently class
import './styles/index.css';

// ─── Props Interface ─────────────────────────────────────────────────────────
interface RentlyLuxuryWrapperProps {
  hideSidebar?: boolean;
  lang?: 'en' | 'he';
  theme?: 'white' | 'cream' | 'petra' | 'dark';
  onLangChange?: (lang: 'en' | 'he') => void;
  onThemeChange?: (theme: 'white' | 'cream' | 'petra' | 'dark') => void;
}

// Dynamic imports to prevent SSR issues with the React-based Rently components
const EilatLuxuryResort = dynamic(
  () => import('./EilatLuxuryResort'),
  {
    ssr: false,
    loading: () => <RentlyLoadingPlaceholder />
  }
);

const BookingModal = dynamic(
  () => import('./components/booking/BookingModal'),
  { ssr: false }
);

// Import the BookingProvider
const BookingProvider = dynamic(
  () => import('./context/BookingContext').then(mod => mod.BookingProvider),
  { ssr: false }
);

// Minimal loading placeholder that matches Rently's aesthetic
function RentlyLoadingPlaceholder() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
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
        animation: 'rently-spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes rently-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Wrapper Component ───────────────────────────────────────────────────
export default function RentlyLuxuryWrapper({
  hideSidebar = false,
  lang,
  theme,
  onLangChange,
  onThemeChange,
}: RentlyLuxuryWrapperProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure we're mounted before rendering (hydration safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted
  if (!mounted) {
    return <RentlyLoadingPlaceholder />;
  }

  return (
    <BookingProvider>
      <div className="rently-container" style={{ position: 'relative', minHeight: '100vh' }}>
        <EilatLuxuryResort
          hideSidebar={hideSidebar}
          externalLang={lang}
          externalTheme={theme}
          onLangChange={onLangChange}
          onThemeChange={onThemeChange}
        />
        <BookingModal />
      </div>
    </BookingProvider>
  );
}
