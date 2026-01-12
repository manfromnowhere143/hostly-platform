// ═══════════════════════════════════════════════════════════════════════════════
// RENTLY LUXURY WRAPPER - HOSTLY BOOKING ENGINE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
// Wraps the original Rently-Luxury website for integration into Hostly.
// Uses the SAME booking engine as the Hostly marketplace for consistency.
// This is the foundation for all future host website integrations.
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Import Rently styles - scoped under .rently class
import './styles/index.css';

// ─── HOSTLY BOOKING ENGINE ───────────────────────────────────────────────────
// Same booking provider used by the marketplace - real Boom PMS integration
import { BookingProvider } from '@/contexts/BookingContext';

// ─── Props Interface ─────────────────────────────────────────────────────────
interface RentlyLuxuryWrapperProps {
  hideSidebar?: boolean;
  lang?: 'en' | 'he';
  theme?: 'white' | 'cream' | 'petra' | 'dark';
  onLangChange?: (lang: 'en' | 'he') => void;
  onThemeChange?: (theme: 'white' | 'cream' | 'petra' | 'dark') => void;
  // Navigation control from parent (UnifiedSidebar)
  navigateTo?: 'resort' | 'apartments';
  activeProject?: 'seaside' | 'eilat42';
}

// Dynamic imports to prevent SSR issues with the React-based Rently components
const EilatLuxuryResort = dynamic(
  () => import('./EilatLuxuryResort'),
  {
    ssr: false,
    loading: () => <RentlyLoadingPlaceholder />
  }
);

// ─── HOSTLY BOOKING MODAL ────────────────────────────────────────────────────
// Same modal used by the marketplace - real Boom pricing & availability
const HostlyBookingModal = dynamic(
  () => import('@/components/booking/BookingModal').then(mod => mod.BookingModal),
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
  navigateTo,
  activeProject,
}: RentlyLuxuryWrapperProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure we're mounted before rendering (hydration safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── CRITICAL: Style Management for Rently ────────────────────────────────────
  // Rently CSS uses .rently-active class on html to scope body styles
  // This prevents CSS from leaking to marketplace when navigating away
  useEffect(() => {
    if (!mounted) return;

    // Add rently-active class to enable scoped CSS rules
    document.documentElement.classList.add('rently-active');

    // Apply body styles via JavaScript for reliable cleanup
    const originalBodyStyle = {
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';

    // Cleanup: Remove class and reset styles when leaving Rently
    return () => {
      // Remove the scoping class - this disables all scoped CSS rules
      document.documentElement.classList.remove('rently-active');

      // Reset inline body styles
      document.body.style.position = originalBodyStyle.position || '';
      document.body.style.width = originalBodyStyle.width || '';
      document.body.style.height = originalBodyStyle.height || '';
      document.body.style.overflow = originalBodyStyle.overflow || '';

      // Reset html inline styles
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';

      // Force reflow to ensure marketplace renders correctly
      void document.body.offsetHeight;

      console.log('[Rently] Cleaned up - removed rently-active class');
    };
  }, [mounted]);

  // Don't render anything until mounted
  if (!mounted) {
    return <RentlyLoadingPlaceholder />;
  }

  return (
    <BookingProvider>
      <RentlyLuxuryContent
        hideSidebar={hideSidebar}
        lang={lang}
        theme={theme}
        onLangChange={onLangChange}
        onThemeChange={onThemeChange}
        navigateTo={navigateTo}
        activeProject={activeProject}
      />
    </BookingProvider>
  );
}

// ─── Content Component (inside BookingProvider) ──────────────────────────────
// Separated so booking context is available to both Rently content and modal
function RentlyLuxuryContent({
  hideSidebar,
  lang,
  theme,
  onLangChange,
  onThemeChange,
  navigateTo,
  activeProject,
}: Omit<RentlyLuxuryWrapperProps, never>) {
  return (
    <div className="rently-container" style={{ position: 'relative', minHeight: '100vh' }}>
      <EilatLuxuryResort
        hideSidebar={hideSidebar}
        externalLang={lang}
        externalTheme={theme}
        onLangChange={onLangChange}
        onThemeChange={onThemeChange}
        externalNavigateTo={navigateTo}
        externalActiveProject={activeProject}
      />
      {/* Hostly Booking Modal - Uses context directly (same as marketplace) */}
      <HostlyBookingModal />
    </div>
  );
}
