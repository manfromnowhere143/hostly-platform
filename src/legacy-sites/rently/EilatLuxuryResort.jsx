// ═══════════════════════════════════════════════════════════════════════════════
// RENTLY - STATE OF THE ART V12
// ═══════════════════════════════════════════════════════════════════════════════
// ✓ Bulletproof video autoplay (works on ALL devices)
// ✓ GPU-optimized animations
// ✓ Low-end device support
// ✓ Hebrew/English bilingual
// ✓ Dark/Light themes
// ✓ Professional 3-file architecture
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  URLS,
  HERO_IMAGES,
  TRANSLATIONS,
  SEASIDE_APARTMENTS,
  EILAT42_APARTMENTS,
  EILAT42_GALLERY,
  SEASIDE_GALLERY,
  PERFORMANCE_CONFIG
} from './rently.config';
// ─── HOSTLY BOOKING ENGINE ───────────────────────────────────────────────────
// Connected to real Boom PMS via Hostly's production booking system
// Same engine used by the marketplace - consistent UX across all touchpoints
import { useBooking } from '@/contexts/BookingContext';

// ═══════════════════════════════════════════════════════════════════════════════
// APARTMENT TO BOOKING PROPERTY TRANSFORMER
// ═══════════════════════════════════════════════════════════════════════════════
// Transforms apartment data to booking system property format with Boom PMS IDs
const apartmentToProperty = (apt, lang = 'en') => {
  // Build Hostly-compatible property ID (prop_s3, prop_e10, etc.)
  const hostlyId = `prop_${apt.id}`;

  // Build Hostly-compatible slug (seaside-mykonos, eilat42-mango, etc.)
  const aptName = apt.name?.en || apt.name || '';
  const hostlySlug = `${apt.project}-${aptName.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id: hostlyId,
    slug: hostlySlug,
    localId: apt.id, // Keep original for reference
    boomId: apt.boomId, // Boom PMS ID for real pricing/availability
    name: apt.name?.[lang] || apt.name?.en || apt.name,
    images: apt.images || [],
    specs: apt.specs,
    price: apt.price,
    amenities: apt.amenities?.[lang] || apt.amenities?.en || [],
    maxGuests: apt.specs?.guests || 6,
    description: apt.description?.[lang] || apt.description?.en || '',
    project: apt.project,
    unit: apt.unit,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL IMAGE CACHE - Prevents shimmer on re-scroll
// ═══════════════════════════════════════════════════════════════════════════════
const loadedImagesCache = new Set();

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE UTILITIES - State of the Art
// ═══════════════════════════════════════════════════════════════════════════════

// Throttle - Limits function calls to once per interval (for scroll/resize)
const throttle = (fn, ms) => {
  let lastCall = 0;
  let timeout = null;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = null;
        fn(...args);
      }, ms - (now - lastCall));
    }
  };
};

// RAF Throttle - Uses requestAnimationFrame for smooth animations
const rafThrottle = (fn) => {
  let ticking = false;
  return (...args) => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        fn(...args);
        ticking = false;
      });
    }
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATE-OF-THE-ART PROGRESSIVE IMAGE COMPONENT
// Techniques: BlurHash placeholder, intersection observer, GPU compositing
// ═══════════════════════════════════════════════════════════════════════════════
const SmoothImage = React.memo(({ src, alt, className, style }) => {
  const alreadyLoaded = loadedImagesCache.has(src);
  const [loaded, setLoaded] = useState(alreadyLoaded);
  const [isVisible, setIsVisible] = useState(alreadyLoaded);
  const [error, setError] = useState(false);
  const containerRef = useRef(null);

  // Intersection Observer for true lazy loading - increased preload distance
  useEffect(() => {
    if (alreadyLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px', threshold: 0 } // Preload images 400px before viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [alreadyLoaded]);

  const handleLoad = useCallback(() => {
    loadedImagesCache.add(src);
    setLoaded(true);
  }, [src]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        // Elegant warm gradient placeholder instead of black
        background: 'linear-gradient(135deg, #f5f3f0 0%, #e8e4df 50%, #f0ede8 100%)',
        contain: 'layout style paint'
      }}
    >
      {/* Elegant shimmer - warm tones matching site palette */}
      {!loaded && !error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(181,132,109,0.08) 20%, rgba(255,255,255,0.15) 50%, rgba(181,132,109,0.08) 80%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s ease-in-out infinite',
          willChange: 'background-position',
          zIndex: 1
        }} />
      )}

      {/* Only render image when visible (true lazy load) and no error */}
      {(isVisible || alreadyLoaded) && !error && (
        <img
          src={src}
          alt={alt || ''}
          className={className}
          loading="lazy"
          decoding="async"
          style={{
            ...style,
            position: 'absolute',
            inset: 0,
            opacity: loaded ? 1 : 0,
            transform: 'translateZ(0)', // GPU layer, no scale transition (smoother)
            transition: alreadyLoaded ? 'none' : 'opacity 0.5s ease-out',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            willChange: loaded ? 'auto' : 'opacity',
            backfaceVisibility: 'hidden'
          }}
          onLoad={handleLoad}
          onError={() => setError(true)}
          fetchPriority={alreadyLoaded ? 'high' : 'auto'}
        />
      )}

      {/* Error fallback - elegant placeholder */}
      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f3f0 0%, #e8e4df 50%, #f0ede8 100%)',
          color: 'rgba(139, 115, 96, 0.5)',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// BULLETPROOF VIDEO HOOK - Never fails, works on all devices
// ═══════════════════════════════════════════════════════════════════════════════
const useBulletproofVideo = (videoRef, isActive, onLoaded) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    // Try to play video with retry logic
    const tryPlay = () => {
      if (!mounted || !video) return;

      video.play().catch((err) => {
        // Silent catch - retry shortly
        if (mounted && retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryPlay, PERFORMANCE_CONFIG.video.retryDelay);
        }
      });
    };

    // Handle 'playing' event - ONLY fires when frames are actually rendering
    const handlePlaying = () => {
      if (mounted && onLoaded) {
        onLoaded(true);
      }
    };

    // Handle 'canplay' event as backup
    const handleCanPlay = () => {
      tryPlay();
    };

    // Listen to 'playing' event for fade-in (not just loadeddata)
    video.addEventListener('playing', handlePlaying, { once: true });
    video.addEventListener('canplay', handleCanPlay, { once: true });

    // Check current state and try to play
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
    }

    // Safety net: Force fade-in after timeout (industry standard - Netflix, Airbnb use this)
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        // Force play if still paused
        if (video && video.paused) {
          video.play().catch(() => {});
        }
        // Ensure fade-in happens even if playing event missed
        if (onLoaded) {
          onLoaded(true);
        }
      }
    }, PERFORMANCE_CONFIG.video.safetyTimeout);

    return () => {
      mounted = false;
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', tryPlay);
      clearTimeout(safetyTimeout);
    };
  }, [videoRef, isActive, onLoaded]);
};

// ═══════════════════════════════════════════════════════════════════════════════
// SVG ICONS
// ═══════════════════════════════════════════════════════════════════════════════
const Icons = {
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  navigate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="3,11 22,2 13,21 11,13 3,11"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  waze: (
    <svg viewBox="0 0 24 24">
      <path d="M12.174 0C8.042 0 4.721 3.321 4.721 7.453c0 .888.17 1.738.48 2.516l6.973 13.555 6.973-13.555c.31-.778.48-1.628.48-2.516C19.627 3.321 16.306 0 12.174 0zm0 11.085c-2.004 0-3.632-1.628-3.632-3.632s1.628-3.632 3.632-3.632 3.632 1.628 3.632 3.632-1.628 3.632-3.632 3.632z"/>
    </svg>
  )
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const EilatLuxuryResort = ({ hideSidebar = false, externalLang, externalTheme, onLangChange, onThemeChange, externalNavigateTo, externalActiveProject }) => {
  // ─── Booking Context (Hostly Integration) ──────────────────────────────────
  const { openBooking: openHostlyBooking, isOpen: bookingModalOpen } = useBooking();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [loadingVisible, setLoadingVisible] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [loadingFadeOut, setLoadingFadeOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lang, setLangState] = useState(externalLang || 'en');
  const [theme, setThemeState] = useState(externalTheme || 'white');

  // Sync with external lang/theme (from unified sidebar)
  const setLang = (newLang) => {
    setLangState(newLang);
    onLangChange?.(newLang);
  };
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    onThemeChange?.(newTheme);
  };

  // Update internal state when external props change
  React.useEffect(() => {
    if (externalLang && externalLang !== lang) setLangState(externalLang);
  }, [externalLang]);

  React.useEffect(() => {
    if (externalTheme && externalTheme !== theme) setThemeState(externalTheme);
  }, [externalTheme]);

  const [currentPage, setCurrentPage] = useState('resort');
  const [activeProject, setActiveProject] = useState('seaside');

  // ─── External Navigation Control (from UnifiedSidebar) ─────────────────────
  // Respond to navigation commands from parent component
  const [lastExternalNav, setLastExternalNav] = useState(null);

  React.useEffect(() => {
    // Create a unique key for this navigation request
    const navKey = `${externalNavigateTo}-${externalActiveProject}`;

    // Only act if this is a new navigation request
    if (navKey !== lastExternalNav && (externalNavigateTo || externalActiveProject)) {
      setLastExternalNav(navKey);

      // Navigate to the requested page
      if (externalNavigateTo && externalNavigateTo !== currentPage) {
        setCurrentPage(externalNavigateTo);
      }

      // Set the active project
      if (externalActiveProject) {
        setActiveProject(externalActiveProject);
      }
    }
  }, [externalNavigateTo, externalActiveProject, lastExternalNav, currentPage]);
  const [pageTransition, setPageTransition] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartmentImageIndex, setApartmentImageIndex] = useState(0);
  const [modalTransition, setModalTransition] = useState('idle'); // 'idle' | 'expanding' | 'open' | 'closing'
  const cardOriginRef = useRef(null); // Store clicked card's bounding rect
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [aptVideoLoaded, setAptVideoLoaded] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false); // Legacy - kept for reference, using Hostly now
  const [bookingDates, setBookingDates] = useState({ checkIn: '', checkOut: '', guests: 2 });
  const [apartmentsExpanded, setApartmentsExpanded] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // Track selected apartment for booking
  const [bookingApartment, setBookingApartment] = useState(null);

  // Mobile Sidebar - State of the Art "Luxury Dock"
  // 'closed' | 'full' | 'minimized'
  const [mobileSidebarMode, setMobileSidebarMode] = useState('closed');
  const [dockHidden, setDockHidden] = useState(false);
  const [dockApartmentsOpen, setDockApartmentsOpen] = useState(false);

  // Desktop Sidebar - Collapsed State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);

  // ─── Refs ──────────────────────────────────────────────────────────────────
  const heroVideoRef = useRef(null);
  const aptVideoRef = useRef(null);

  // ─── Derived State ─────────────────────────────────────────────────────────
  const isDark = theme === 'dark';
  const isRTL = lang === 'he';
  const text = TRANSLATIONS[lang];
  const currentApartments = activeProject === 'seaside' ? SEASIDE_APARTMENTS : EILAT42_APARTMENTS;

  // ─── Bulletproof Video Autoplay ────────────────────────────────────────────
  useBulletproofVideo(heroVideoRef, currentPage === 'resort', setVideoLoaded);
  useBulletproofVideo(aptVideoRef, currentPage === 'apartments', setAptVideoLoaded);

  // ─── Hostly Booking System Integration ─────────────────────────────────────
  // Opens the Hostly booking modal with real Boom PMS pricing & availability
  // Same booking engine used by the marketplace - consistent UX everywhere
  const handleOpenBooking = useCallback((apt = null) => {
    if (apt) {
      // Specific apartment selected - transform to Hostly property format
      const property = apartmentToProperty(apt, lang);
      setBookingApartment(apt);
      // Open Hostly booking with property (includes boomId for real pricing)
      openHostlyBooking(property, lang);
    } else {
      // No apartment selected - pick first available from active project
      // This enables "Book Now" buttons on hero/contact sections to work
      const apartments = activeProject === 'eilat42' ? EILAT42_APARTMENTS : SEASIDE_APARTMENTS;
      if (apartments.length > 0) {
        const defaultApt = apartments[0];
        const property = apartmentToProperty(defaultApt, lang);
        setBookingApartment(defaultApt);
        openHostlyBooking(property, lang);
        console.log(`[Rently] Opening booking with default property: ${property.name} (${property.boomId})`);
      } else {
        console.warn('[Rently] No apartments available for booking');
      }
    }
  }, [lang, openHostlyBooking, activeProject]);

  // ─── Card-to-Modal FLIP Animation ─────────────────────────────────────────
  const openApartmentModal = useCallback((apt, event) => {
    // Capture the clicked card's position for FLIP animation
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    cardOriginRef.current = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    // Set apartment and trigger expand animation
    setSelectedApartment(apt);
    setApartmentImageIndex(0);
    setModalTransition('expanding');

    // After expand animation completes, set to 'open'
    setTimeout(() => {
      setModalTransition('open');
    }, 400); // Match CSS transition duration
  }, []);

  const closeApartmentModal = useCallback(() => {
    // Trigger close animation
    setModalTransition('closing');

    // After close animation, clear state
    setTimeout(() => {
      setSelectedApartment(null);
      setModalTransition('idle');
      cardOriginRef.current = null;
    }, 300); // Match CSS transition duration
  }, []);

  // ─── Modal Body Scroll Lock + Keyboard Navigation ──────────────────────────
  useEffect(() => {
    if (selectedApartment) {
      document.body.classList.add('modal-open');

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeApartmentModal();
        } else if (e.key === 'ArrowRight') {
          setApartmentImageIndex(prev => (prev + 1) % selectedApartment.images.length);
        } else if (e.key === 'ArrowLeft') {
          setApartmentImageIndex(prev => prev === 0 ? selectedApartment.images.length - 1 : prev - 1);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.classList.remove('modal-open');
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedApartment, closeApartmentModal]);

  // ─── Loading Sequence ──────────────────────────────────────────────────────
  useEffect(() => {
    const timers = [
      setTimeout(() => setLoadingPhase(1), 100),
      setTimeout(() => setLoadingPhase(2), 400),
      setTimeout(() => setLoadingPhase(3), 800),
      setTimeout(() => setLoadingPhase(4), 1200),
      setTimeout(() => setLoadingPhase(5), 1600),
      setTimeout(() => {
        setLoadingFadeOut(true);
        setTimeout(() => setLoadingVisible(false), 600);
      }, PERFORMANCE_CONFIG.animation.loadingDuration)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── Preload Apartment Images ──────────────────────────────────────────────
  useEffect(() => {
    if (currentPage === 'apartments') {
      currentApartments.slice(0, PERFORMANCE_CONFIG.images.preloadCount).forEach(apt => {
        const img = new Image();
        img.src = apt.images[0];
      });
    }
  }, [currentPage, activeProject, currentApartments]);

  // ─── Preload Modal Images ──────────────────────────────────────────────────
  useEffect(() => {
    if (selectedApartment) {
      selectedApartment.images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [selectedApartment]);

  // ─── Scroll & Mouse Handlers ───────────────────────────────────────────────
  useEffect(() => {
    const scrollContainer = document.querySelector('.rently');

    // Throttled scroll handler - 16ms = 60fps
    const handleScroll = throttle(() => {
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      setIsScrolled(scrollTop > 50);
    }, 16);

    // RAF-throttled mouse handler for cursor
    const handleMouse = rafThrottle((e) => setMousePos({ x: e.clientX, y: e.clientY }));

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouse, { passive: true });

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  // ─── Mobile Dock Scroll Behavior - 60fps ────────────────────────────────────
  useEffect(() => {
    if (mobileSidebarMode !== 'minimized') return;

    const scrollContainer = document.querySelector('.rently');
    if (!scrollContainer) return;

    let ticking = false;
    const scrollThreshold = 50;

    const handleDockScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = scrollContainer.scrollTop;
        const diff = currentScrollY - lastScrollY.current;

        // Only trigger after threshold
        if (Math.abs(diff) > scrollThreshold) {
          if (diff > 0 && currentScrollY > 100) {
            // Scrolling DOWN - hide dock
            setDockHidden(true);
          } else if (diff < 0) {
            // Scrolling UP - show dock
            setDockHidden(false);
          }
          lastScrollY.current = currentScrollY;
        }

        ticking = false;
      });
    };

    scrollContainer.addEventListener('scroll', handleDockScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleDockScroll);
    };
  }, [mobileSidebarMode]);

  // ─── Scroll Reveal Observer ────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: PERFORMANCE_CONFIG.animation.revealThreshold, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal, .stagger-reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [currentPage]);


  // ─── Click Outside to Close Dropdowns ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close floating control dropdowns (mobile) and sidebar control dropdowns (desktop)
      if (!e.target.closest('.float-control-wrapper') && !e.target.closest('.ps-control-group') && !e.target.closest('.ps-dropdown')) {
        setLangDropdownOpen(false);
        setThemeDropdownOpen(false);
      }
      // Close dock apartments submenu
      if (!e.target.closest('.mobile-dock') && !e.target.closest('.dock-submenu')) {
        setDockApartmentsOpen(false);
      }
      // Close sidebar apartments popup on desktop collapsed
      if (!e.target.closest('.ps-nav-group')) {
        setApartmentsExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ─── Scroll Lock for Modal/Sidebar - Airbnb Standard ───────────────────────
  // Saves and restores scroll position to prevent iOS Safari viewport jump
  const savedScrollRef = useRef(0);

  useEffect(() => {
    const scrollContainer = document.querySelector('.rently');
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    if (selectedApartment || (mobileSidebarMode === 'full' && isMobile)) {
      // Save current scroll position BEFORE locking
      if (scrollContainer) {
        savedScrollRef.current = scrollContainer.scrollTop;
        scrollContainer.style.overflow = 'hidden';
        scrollContainer.style.touchAction = 'none';
      }
    } else {
      // Restore scroll position AFTER unlocking
      if (scrollContainer) {
        scrollContainer.style.overflow = '';
        scrollContainer.style.touchAction = '';
        // Use RAF to ensure styles are applied before restoring scroll
        requestAnimationFrame(() => {
          if (scrollContainer && savedScrollRef.current > 0) {
            scrollContainer.scrollTop = savedScrollRef.current;
          }
        });
      }
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.style.overflow = '';
        scrollContainer.style.touchAction = '';
      }
    };
  }, [selectedApartment, mobileSidebarMode]);

  // ─── Navigation ────────────────────────────────────────────────────────────
  const navigateToPage = useCallback((page) => {
    if (page === currentPage) return;
    // Close full sidebar, keep minimized if was minimized
    if (mobileSidebarMode === 'full') {
      setMobileSidebarMode('minimized');
    }
    setDockApartmentsOpen(false);

    // Get main wrapper
    const wrapper = document.querySelector('.rently');

    // Phase 1: Slide everything down
    if (wrapper) {
      wrapper.classList.add('page-transitioning');
    }
    setPageTransition(true);

    // Reset video loaded states for fresh animations
    if (page === 'apartments') {
      setAptVideoLoaded(false);
    } else if (page === 'resort') {
      setVideoLoaded(false);
    }

    // Phase 2: After slide down, change page content
    setTimeout(() => {
      setCurrentPage(page);
      if (wrapper) {
        wrapper.scrollTo({ top: 0, behavior: 'instant' });
      }
      window.scrollTo(0, 0);

      // Phase 3: Remove transition class to slide back up
      requestAnimationFrame(() => {
        if (wrapper) {
          wrapper.classList.remove('page-transitioning');
        }

        // Phase 4: Fade out overlay
        setTimeout(() => {
          setPageTransition(false);
        }, 300);
      });
    }, 600); // Match CSS slide duration
  }, [currentPage]);

  const scrollToSection = useCallback((e, sectionId) => {
    e.preventDefault();
    // Close full sidebar, keep minimized
    if (mobileSidebarMode === 'full') {
      setMobileSidebarMode('minimized');
    }
    const scrollContainer = document.querySelector('.rently');
    const section = document.getElementById(sectionId);
    if (section && scrollContainer) {
      const offsetTop = section.offsetTop - 80;
      scrollContainer.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  }, [mobileSidebarMode]);

  // ─── Nav Styling ───────────────────────────────────────────────────────────
  const navBg = isScrolled
    ? (isDark ? 'rgba(10,10,10,0.95)' : 'rgba(250,249,247,0.95)')
    : 'transparent';
  const navText = (isScrolled || currentPage === 'apartments')
    ? (isDark ? '#fff' : '#1a1a1a')
    : '#fff';

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`rently ${theme} ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* ─── Loading Overlay - State of the Art ─────────────────────────────── */}
      {loadingVisible && (
        <div className={`loading-overlay ${loadingFadeOut ? 'fade-out' : ''}`}>
          {/* Petra stone background */}
          <div className="loading-bg" />

          {/* Architectural thin lines */}
          <div className="loading-line-h loading-line-h-1" style={{ transform: `scaleX(${loadingPhase >= 1 ? 1 : 0})` }} />
          <div className="loading-line-h loading-line-h-2" style={{ transform: `scaleX(${loadingPhase >= 2 ? 1 : 0})` }} />
          <div className="loading-line-v loading-line-v-1" style={{ transform: `scaleY(${loadingPhase >= 1 ? 1 : 0})` }} />
          <div className="loading-line-v loading-line-v-2" style={{ transform: `scaleY(${loadingPhase >= 2 ? 1 : 0})` }} />

          {/* Corner frames */}
          <div className="loading-frame loading-frame-tl" style={{ opacity: loadingPhase >= 2 ? 1 : 0 }}>
            <div className="loading-frame-h" style={{ transform: `scaleX(${loadingPhase >= 3 ? 1 : 0})` }} />
            <div className="loading-frame-v" style={{ transform: `scaleY(${loadingPhase >= 3 ? 1 : 0})` }} />
          </div>
          <div className="loading-frame loading-frame-tr" style={{ opacity: loadingPhase >= 2 ? 1 : 0 }}>
            <div className="loading-frame-h" style={{ transform: `scaleX(${loadingPhase >= 3 ? 1 : 0})` }} />
            <div className="loading-frame-v" style={{ transform: `scaleY(${loadingPhase >= 3 ? 1 : 0})` }} />
          </div>
          <div className="loading-frame loading-frame-bl" style={{ opacity: loadingPhase >= 2 ? 1 : 0 }}>
            <div className="loading-frame-h" style={{ transform: `scaleX(${loadingPhase >= 3 ? 1 : 0})` }} />
            <div className="loading-frame-v" style={{ transform: `scaleY(${loadingPhase >= 3 ? 1 : 0})` }} />
          </div>
          <div className="loading-frame loading-frame-br" style={{ opacity: loadingPhase >= 2 ? 1 : 0 }}>
            <div className="loading-frame-h" style={{ transform: `scaleX(${loadingPhase >= 3 ? 1 : 0})` }} />
            <div className="loading-frame-v" style={{ transform: `scaleY(${loadingPhase >= 3 ? 1 : 0})` }} />
          </div>

          {/* Center content */}
          <div className="loading-center">
            {/* Vertical reveal line */}
            <div
              className="loading-reveal-line"
              style={{
                height: loadingPhase >= 1 ? '60px' : '0',
                opacity: loadingPhase >= 1 ? 1 : 0
              }}
            />

            {/* Logo */}
            <div className="loading-logo-container" style={{ opacity: loadingPhase >= 2 ? 1 : 0 }}>
              <div className="loading-logo-icon" style={{ transform: `scale(${loadingPhase >= 2 ? 1 : 0.8})` }}>
                <svg viewBox="0 0 40 40" fill="none" strokeWidth="1">
                  <path d="M20 4L4 12l16 8 16-8-16-8z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 28l16 8 16-8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: loadingPhase >= 3 ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}/>
                  <path d="M4 20l16 8 16-8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: loadingPhase >= 3 ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}/>
                </svg>
              </div>
            </div>

            {/* Brand name with staggered reveal */}
            <div className="loading-brand">
              {"RENTLY".split('').map((letter, i) => (
                <span
                  key={i}
                  className="loading-brand-letter"
                  style={{
                    opacity: loadingPhase >= 2 ? 1 : 0,
                    transform: `translateY(${loadingPhase >= 2 ? 0 : 30}px)`,
                    transitionDelay: `${0.3 + i * 0.06}s`
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>

            {/* Horizontal divider */}
            <div
              className="loading-divider-line"
              style={{
                width: loadingPhase >= 3 ? '120px' : '0',
                opacity: loadingPhase >= 3 ? 1 : 0
              }}
            />

            {/* Location */}
            <div
              className="loading-location-text"
              style={{
                opacity: loadingPhase >= 3 ? 1 : 0,
                transform: `translateY(${loadingPhase >= 3 ? 0 : 10}px)`
              }}
            >
              EILAT
            </div>

            {/* Tagline */}
            <div
              className="loading-tagline-text"
              style={{
                opacity: loadingPhase >= 4 ? 1 : 0,
                transform: `translateY(${loadingPhase >= 4 ? 0 : 10}px)`
              }}
            >
              Where Desert Meets Sea
            </div>
          </div>

          {/* Bottom progress */}
          <div className="loading-bottom" style={{ opacity: loadingPhase >= 1 ? 1 : 0 }}>
            <div className="loading-progress-line">
              <div
                className="loading-progress-fill"
                style={{ width: `${loadingPhase * 20}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Custom Cursor ────────────────────────────────────────────────── */}
      <div className="custom-cursor" style={{ left: mousePos.x - 10, top: mousePos.y - 10 }} />
      <div className="custom-cursor-dot" style={{ left: mousePos.x - 2, top: mousePos.y - 2 }} />

      {/* ═══════════════════════════════════════════════════════════════════════
          NEW UNIFIED LAYOUT - PERMANENT SIDEBAR + CONTENT
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className={`app-layout ${hideSidebar ? 'no-sidebar' : ''}`}>

        {/* ─── Permanent Sidebar (hidden when using UnifiedSidebar) ─────────── */}
        {!hideSidebar && (
        <aside className={`permanent-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarMode === 'full' ? 'mobile-open' : ''}`}>
          {/* Architectural lines */}
          <div className="ps-line ps-line-1" />
          <div className="ps-line ps-line-2" />

          {/* Mobile Sidebar Header Controls */}
          <div className="mobile-sidebar-controls">
            {/* Close Button - Fully closes sidebar */}
            <button
              className="mobile-sidebar-close"
              onClick={() => setMobileSidebarMode('closed')}
              aria-label="Close sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Book Now Button - State of the Art */}
            <button
              className="mobile-sidebar-book"
              onClick={() => { handleOpenBooking(); setMobileSidebarMode('closed'); }}
              aria-label="Book Now"
            >
              <span className="mobile-book-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeLinecap="round"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2"/>
                </svg>
              </span>
              <span className="mobile-book-text">{lang === 'en' ? 'Book' : 'הזמן'}</span>
            </button>
          </div>

          {/* Header with logo */}
          <header className="ps-header">
            <div className="ps-logo-icon">
              <svg viewBox="0 0 40 40" fill="none" strokeWidth="1">
                <path d="M20 4L4 12l16 8 16-8-16-8z" stroke="currentColor"/>
                <path d="M4 28l16 8 16-8" stroke="currentColor"/>
                <path d="M4 20l16 8 16-8" stroke="currentColor"/>
              </svg>
            </div>
            <div className="ps-logo-text">
              <span className="ps-logo-brand">Rently</span>
              <span className="ps-logo-location">Eilat</span>
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              className="ps-collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                <path
                  d={sidebarCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          {/* Navigation */}
          <nav className="ps-nav">
            {/* Home */}
            <button
              className={`ps-nav-item ${currentPage === 'resort' && !apartmentsExpanded ? 'active' : ''}`}
              onClick={() => { navigateToPage('resort'); setApartmentsExpanded(false); }}
              data-tooltip={text.nav.resort}
            >
              <svg className="ps-nav-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="ps-nav-left">
                <span className="ps-nav-number">01</span>
                <span className="ps-nav-label">{text.nav.resort}</span>
              </div>
            </button>

            {/* Apartments (expandable) */}
            <div className="ps-nav-group">
              <button
                className={`ps-nav-item ps-nav-parent ${currentPage === 'apartments' || apartmentsExpanded ? 'active expanded' : ''}`}
                onClick={() => setApartmentsExpanded(!apartmentsExpanded)}
                data-tooltip={!apartmentsExpanded ? text.nav.apartments : ''}
              >
                <svg className="ps-nav-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="ps-nav-left">
                  <span className="ps-nav-number">02</span>
                  <span className="ps-nav-label">{text.nav.apartments}</span>
                </div>
                <svg className={`ps-nav-chevron ${apartmentsExpanded ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Sub-items - Normal (expanded sidebar) */}
              <div className={`ps-nav-children ${apartmentsExpanded ? 'open' : ''}`}>
                <button
                  className={`ps-nav-child ${currentPage === 'apartments' && activeProject === 'seaside' ? 'active' : ''}`}
                  onClick={() => { navigateToPage('apartments'); setActiveProject('seaside'); }}
                >
                  <svg className="ps-nav-child-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M3 15c2.5-2.5 5-3 7.5-1.5s5 1 7.5-1.5M3 19c2.5-2.5 5-3 7.5-1.5s5 1 7.5-1.5" stroke="currentColor" strokeLinecap="round"/>
                  </svg>
                  <span className="ps-nav-child-label">{text.apartments.seaside}</span>
                </button>
                <button
                  className={`ps-nav-child ${currentPage === 'apartments' && activeProject === 'eilat42' ? 'active' : ''}`}
                  onClick={() => { navigateToPage('apartments'); setActiveProject('eilat42'); }}
                >
                  <svg className="ps-nav-child-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="ps-nav-child-label">{text.apartments.eilat42}</span>
                </button>
              </div>

              {/* Sub-items - Popup (collapsed sidebar - desktop only) */}
              <div className={`ps-nav-popup ${apartmentsExpanded ? 'open' : ''}`}>
                <button
                  className={`ps-popup-item ${currentPage === 'apartments' && activeProject === 'seaside' ? 'active' : ''}`}
                  onClick={() => { navigateToPage('apartments'); setActiveProject('seaside'); setApartmentsExpanded(false); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M3 15c2.5-2.5 5-3 7.5-1.5s5 1 7.5-1.5M3 19c2.5-2.5 5-3 7.5-1.5s5 1 7.5-1.5" stroke="currentColor" strokeLinecap="round"/>
                  </svg>
                  <span>{text.apartments.seaside}</span>
                </button>
                <button
                  className={`ps-popup-item ${currentPage === 'apartments' && activeProject === 'eilat42' ? 'active' : ''}`}
                  onClick={() => { navigateToPage('apartments'); setActiveProject('eilat42'); setApartmentsExpanded(false); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{text.apartments.eilat42}</span>
                </button>
              </div>
            </div>

            {/* Amenities */}
            <a
              href="#amenities"
              className="ps-nav-item"
              onClick={(e) => scrollToSection(e, 'amenities')}
              data-tooltip={text.nav.amenities}
            >
              <svg className="ps-nav-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="ps-nav-left">
                <span className="ps-nav-number">03</span>
                <span className="ps-nav-label">{text.nav.amenities}</span>
              </div>
            </a>

            {/* Contact */}
            <a
              href="#contact"
              className="ps-nav-item"
              onClick={(e) => scrollToSection(e, 'contact')}
              data-tooltip={text.nav.contact}
            >
              <svg className="ps-nav-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="ps-nav-left">
                <span className="ps-nav-number">04</span>
                <span className="ps-nav-label">{text.nav.contact}</span>
              </div>
            </a>
          </nav>

          {/* Footer */}
          <footer className="ps-footer">
            {/* Theme & Language Controls */}
            <div className="ps-controls">
              {/* Theme Selector */}
              <div className="ps-control-group">
                <button
                  className={`ps-control-btn ${themeDropdownOpen ? 'active' : ''}`}
                  onClick={() => { setThemeDropdownOpen(!themeDropdownOpen); setLangDropdownOpen(false); }}
                  aria-label="Theme"
                >
                  <span className="ps-theme-icon">
                    <span style={{ background: '#ffffff' }} />
                    <span style={{ background: '#faf5f0' }} />
                    <span style={{ background: '#e8d5c4' }} />
                    <span style={{ background: '#1a1a1a' }} />
                  </span>
                  <span className="ps-control-label">{lang === 'en' ? 'Theme' : 'ערכת נושא'}</span>
                </button>
                <div className={`ps-dropdown ${themeDropdownOpen ? 'open' : ''}`}>
                  <button onClick={() => { setTheme('white'); setThemeDropdownOpen(false); }} className={theme === 'white' ? 'active' : ''}>
                    <span style={{ background: '#ffffff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }} />
                    <span>White</span>
                  </button>
                  <button onClick={() => { setTheme('cream'); setThemeDropdownOpen(false); }} className={theme === 'cream' ? 'active' : ''}>
                    <span style={{ background: '#faf5f0' }} />
                    <span>Cream</span>
                  </button>
                  <button onClick={() => { setTheme('petra'); setThemeDropdownOpen(false); }} className={theme === 'petra' ? 'active' : ''}>
                    <span style={{ background: '#e8d5c4' }} />
                    <span>Petra</span>
                  </button>
                  <button onClick={() => { setTheme('dark'); setThemeDropdownOpen(false); }} className={theme === 'dark' ? 'active' : ''}>
                    <span style={{ background: '#1a1a1a' }} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div className="ps-control-group">
                <button
                  className={`ps-control-btn ${langDropdownOpen ? 'active' : ''}`}
                  onClick={() => { setLangDropdownOpen(!langDropdownOpen); setThemeDropdownOpen(false); }}
                  aria-label="Language"
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" stroke="currentColor"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor"/>
                  </svg>
                  <span className="ps-control-label">{lang === 'en' ? 'EN' : 'עב'}</span>
                </button>
                <div className={`ps-dropdown ps-dropdown-lang ${langDropdownOpen ? 'open' : ''}`}>
                  <button onClick={() => { setLang('en'); setLangDropdownOpen(false); }} className={lang === 'en' ? 'active' : ''}>
                    <span>🇬🇧</span>
                    <span>English</span>
                  </button>
                  <button onClick={() => { setLang('he'); setLangDropdownOpen(false); }} className={lang === 'he' ? 'active' : ''}>
                    <span>🇮🇱</span>
                    <span>עברית</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              className="ps-book-btn"
              onClick={() => handleOpenBooking()}
            >
              {/* Custom Book Icon */}
              <span className="ps-book-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeLinecap="round"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2"/>
                </svg>
              </span>
              <span>{lang === 'en' ? 'Book Now' : 'הזמן עכשיו'}</span>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="ps-social">
              <a href={URLS.instagram} target="_blank" rel="noopener noreferrer">{Icons.instagram}</a>
              <a href={URLS.facebook} target="_blank" rel="noopener noreferrer">{Icons.facebook}</a>
              <a href={URLS.whatsapp} target="_blank" rel="noopener noreferrer">{Icons.whatsapp}</a>
            </div>

            <p className="ps-tagline">Where Desert Meets Sea</p>
          </footer>
        </aside>
        )}

        {/* Mobile sidebar backdrop (hidden when using UnifiedSidebar) */}
        {!hideSidebar && (
        <div
          className={`ps-backdrop ${mobileSidebarMode === 'full' ? 'open' : ''}`}
          onClick={() => setMobileSidebarMode('minimized')}
        />
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            MOBILE FLOATING PANELS - Alfred-Style Individual Buttons
            Each button slides from screen edges independently
            (hidden when using UnifiedSidebar)
            ═══════════════════════════════════════════════════════════════════════ */}
        {!hideSidebar && (<>

        {/* Hamburger Button - Always visible on mobile */}
        <button
          className={`mobile-hamburger ${mobileSidebarMode === 'full' ? 'open' : ''}`}
          onClick={() => {
            setMobileSidebarMode(mobileSidebarMode === 'full' ? 'closed' : 'full');
            setThemeDropdownOpen(false);
            setLangDropdownOpen(false);
          }}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* BOOK Button - Slides from LEFT (next to hamburger) - State of the Art */}
        <button
          className={`float-nav-book ${mobileSidebarMode === 'full' ? 'visible' : ''}`}
          onClick={() => { handleOpenBooking(); setMobileSidebarMode('closed'); }}
          aria-label={lang === 'en' ? 'Book Now' : 'הזמן עכשיו'}
        >
          <span className="float-book-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeLinecap="round"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2"/>
            </svg>
          </span>
          <span className="float-book-text">{lang === 'en' ? 'Book' : 'הזמן'}</span>
        </button>

        {/* HOME Button - Slides from LEFT (next to hamburger) */}
        <button
          className={`float-nav-home ${mobileSidebarMode === 'full' ? 'visible' : ''} ${currentPage === 'resort' ? 'active' : ''}`}
          onClick={() => { navigateToPage('resort'); setMobileSidebarMode('closed'); }}
          aria-label={lang === 'en' ? 'Home' : 'בית'}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12h6v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* APARTMENTS Button - Slides from LEFT (next to home) */}
        <button
          className={`float-nav-apartments ${mobileSidebarMode === 'full' ? 'visible' : ''} ${currentPage === 'apartments' ? 'active' : ''}`}
          onClick={() => { navigateToPage('apartments'); setMobileSidebarMode('closed'); }}
          aria-label={lang === 'en' ? 'Apartments' : 'דירות'}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* THEME Button - Slides from RIGHT (same line) */}
        <button
          className={`float-control-theme ${mobileSidebarMode === 'full' ? 'visible' : ''}`}
          onClick={(e) => { e.stopPropagation(); setThemeDropdownOpen(!themeDropdownOpen); setLangDropdownOpen(false); }}
          aria-label={lang === 'en' ? 'Theme' : 'ערכת נושא'}
        >
          <span className="float-theme-icon">
            <span className="float-theme-quad" style={{ background: '#ffffff' }} />
            <span className="float-theme-quad" style={{ background: '#faf5f0' }} />
            <span className="float-theme-quad" style={{ background: '#e8d5c4' }} />
            <span className="float-theme-quad" style={{ background: '#1a1a1a' }} />
          </span>
        </button>

        {/* Theme Dropdown Panel */}
        <div className={`float-dropdown float-dropdown-theme ${themeDropdownOpen ? 'open' : ''}`}>
          <button onClick={() => { setTheme('white'); setThemeDropdownOpen(false); }} className={theme === 'white' ? 'active' : ''}>
            <span style={{ background: '#ffffff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }} />
          </button>
          <button onClick={() => { setTheme('cream'); setThemeDropdownOpen(false); }} className={theme === 'cream' ? 'active' : ''}>
            <span style={{ background: '#faf5f0' }} />
          </button>
          <button onClick={() => { setTheme('petra'); setThemeDropdownOpen(false); }} className={theme === 'petra' ? 'active' : ''}>
            <span style={{ background: '#e8d5c4' }} />
          </button>
          <button onClick={() => { setTheme('dark'); setThemeDropdownOpen(false); }} className={theme === 'dark' ? 'active' : ''}>
            <span style={{ background: '#1a1a1a' }} />
          </button>
        </div>

        {/* LANGUAGE Button - Slides from RIGHT (same line) */}
        <button
          className={`float-control-lang ${mobileSidebarMode === 'full' ? 'visible' : ''}`}
          onClick={(e) => { e.stopPropagation(); setLangDropdownOpen(!langDropdownOpen); setThemeDropdownOpen(false); }}
          aria-label={lang === 'en' ? 'Language' : 'שפה'}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor"/>
          </svg>
        </button>

        {/* Language Dropdown Panel */}
        <div className={`float-dropdown float-dropdown-lang ${langDropdownOpen ? 'open' : ''}`}>
          <button onClick={() => { setLang('en'); setLangDropdownOpen(false); }} className={lang === 'en' ? 'active' : ''}>
            🇬🇧
          </button>
          <button onClick={() => { setLang('he'); setLangDropdownOpen(false); }} className={lang === 'he' ? 'active' : ''}>
            🇮🇱
          </button>
        </div>

        </>)}

        {/* ─── Main Content Area ─────────────────────────────────────────────── */}
        <main className="main-content">
          {/* ═══════════════════════════════════════════════════════════════════════
              APARTMENTS PAGE - GRID LISTING
              ═══════════════════════════════════════════════════════════════════════ */}
          {currentPage === 'apartments' ? (
            <div className="cb-apartments">
              {/* Project Tabs - Centered below nav buttons */}
              <div className="apt-tabs">
                <button
                  className={`apt-tab ${activeProject === 'seaside' ? 'active' : ''}`}
                  onClick={() => setActiveProject('seaside')}
                >
                  {lang === 'en' ? 'Sea Side' : 'סי סייד'}
                </button>
                <button
                  className={`apt-tab ${activeProject === 'eilat42' ? 'active' : ''}`}
                  onClick={() => setActiveProject('eilat42')}
                >
                  {lang === 'en' ? 'Eilat 42' : 'אילת 42'}
                </button>
                <button className="apt-tab">
                  {lang === 'en' ? 'Beach View' : 'נוף לים'}
                </button>
                <button className="apt-tab">
                  {lang === 'en' ? 'Family' : 'משפחות'}
                </button>
              </div>

              {/* Section: Popular / Featured */}
              <section className="apt-section">
                <div className="apt-section-header">
                  <h2 className="apt-section-title">
                    {lang === 'en'
                      ? `Popular in ${activeProject === 'seaside' ? 'Sea Side' : 'Eilat 42'}`
                      : `פופולריים ב${activeProject === 'seaside' ? 'סי סייד' : 'אילת 42'}`
                    }
                  </h2>
                  <button className="apt-section-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                <div className="apt-scroll" key={`${activeProject}-popular`}>
                  {currentApartments.slice(0, 8).map((apt, index) => (
                    <article
                      key={apt.id}
                      className="apt-card"
                      onClick={(e) => openApartmentModal(apt, e)}
                    >
                      <div className="apt-card-image">
                        <SmoothImage src={apt.images[0]} alt={apt.name[lang]} />

                        {/* Favorite Button */}
                        <button
                          className="apt-card-favorite"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>

                        {/* Image Dots */}
                        {apt.images.length > 1 && (
                          <div className="apt-card-dots">
                            {apt.images.slice(0, 5).map((_, i) => (
                              <span key={i} className={`apt-card-dot ${i === 0 ? 'active' : ''}`} />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="apt-card-info">
                        <div className="apt-card-header">
                          <h3 className="apt-card-title">{apt.name[lang]}</h3>
                          <span className="apt-card-rating">
                            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            {apt.rating || '4.9'}
                          </span>
                        </div>
                        <p className="apt-card-details">
                          {apt.specs.beds} {lang === 'en' ? 'beds' : 'מיטות'} · {apt.specs.sqm} {lang === 'en' ? 'sqm' : 'מ״ר'}
                        </p>
                        <p className="apt-card-price">
                          <strong>₪{apt.price || '850'}</strong> {lang === 'en' ? '/ night' : '/ לילה'}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Section: More Options */}
              {currentApartments.length > 8 && (
                <section className="apt-section">
                  <div className="apt-section-header">
                    <h2 className="apt-section-title">
                      {lang === 'en' ? 'More apartments' : 'עוד דירות'}
                    </h2>
                    <button className="apt-section-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <div className="apt-scroll" key={`${activeProject}-more`}>
                    {currentApartments.slice(8).map((apt, index) => (
                      <article
                        key={apt.id}
                        className="apt-card"
                        onClick={(e) => openApartmentModal(apt, e)}
                      >
                        <div className="apt-card-image">
                          <SmoothImage src={apt.images[0]} alt={apt.name[lang]} />

                          <button
                            className="apt-card-favorite"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>

                          {apt.images.length > 1 && (
                            <div className="apt-card-dots">
                              {apt.images.slice(0, 5).map((_, i) => (
                                <span key={i} className={`apt-card-dot ${i === 0 ? 'active' : ''}`} />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="apt-card-info">
                          <div className="apt-card-header">
                            <h3 className="apt-card-title">{apt.name[lang]}</h3>
                            <span className="apt-card-rating">
                              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              {apt.rating || '4.8'}
                            </span>
                          </div>
                          <p className="apt-card-details">
                            {apt.specs.beds} {lang === 'en' ? 'beds' : 'מיטות'} · {apt.specs.sqm} {lang === 'en' ? 'sqm' : 'מ״ר'}
                          </p>
                          <p className="apt-card-price">
                            <strong>₪{apt.price || '750'}</strong> {lang === 'en' ? '/ night' : '/ לילה'}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Section: Beach View (if Seaside) */}
              {activeProject === 'seaside' && (
                <section className="apt-section">
                  <div className="apt-section-header">
                    <h2 className="apt-section-title">
                      {lang === 'en' ? 'Stunning beach views' : 'נוף מדהים לחוף'}
                    </h2>
                    <button className="apt-section-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <div className="apt-scroll" key={`${activeProject}-beach`}>
                    {currentApartments.filter(apt => apt.specs.view === 'sea' || true).slice(0, 6).map((apt, index) => (
                      <article
                        key={`beach-${apt.id}`}
                        className="apt-card"
                        onClick={(e) => openApartmentModal(apt, e)}
                      >
                        <div className="apt-card-image">
                          <SmoothImage src={apt.images[1] || apt.images[0]} alt={apt.name[lang]} />

                          <button
                            className="apt-card-favorite"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>

                          {apt.images.length > 1 && (
                            <div className="apt-card-dots">
                              {apt.images.slice(0, 5).map((_, i) => (
                                <span key={i} className={`apt-card-dot ${i === 0 ? 'active' : ''}`} />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="apt-card-info">
                          <div className="apt-card-header">
                            <h3 className="apt-card-title">{apt.name[lang]}</h3>
                            <span className="apt-card-rating">
                              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              5.0
                            </span>
                          </div>
                          <p className="apt-card-details">
                            {lang === 'en' ? 'Ocean view · Balcony' : 'נוף לים · מרפסת'}
                          </p>
                          <p className="apt-card-price">
                            <strong>₪{apt.price || '950'}</strong> {lang === 'en' ? '/ night' : '/ לילה'}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
        /* ═══════════════════════════════════════════════════════════════════════
           RESORT PAGE - CHEVAL BLANC INSPIRED
           ═══════════════════════════════════════════════════════════════════════ */
        <>
          <div className="cb-resort-page">
            {/* Architectural Grid Lines - Left Side */}
            <div className="cb-arch-grid cb-arch-grid-left">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="cb-arch-line-h" style={{ top: `${12 + i * 11}%` }} />
              ))}
              <div className="cb-arch-line-v cb-arch-line-v-1" />
              <div className="cb-arch-line-v cb-arch-line-v-2" />
            </div>

            {/* Architectural Grid Lines - Right Side */}
            <div className="cb-arch-grid cb-arch-grid-right">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="cb-arch-line-h" style={{ top: `${12 + i * 11}%` }} />
              ))}
              <div className="cb-arch-line-v cb-arch-line-v-1" />
              <div className="cb-arch-line-v cb-arch-line-v-2" />
            </div>

            {/* Hero Section - Cheval Blanc Inspired */}
            <section id="hero" className="cb-hero cb-hero-framed">
              {/* Decorative frame lines */}
              <div className="cb-hero-frame-lines">
                <div className="cb-frame-line cb-frame-line-top" />
                <div className="cb-frame-line cb-frame-line-bottom" />
                <div className="cb-frame-line cb-frame-line-left" />
                <div className="cb-frame-line cb-frame-line-right" />
              </div>

              {/* Video Container - Contained & Elegant */}
              <div className="cb-hero-media cb-hero-contained">
                {/* Video */}
                <div className={`cb-hero-fallback ${videoLoaded ? 'hidden' : ''}`} />
                <video
                  key="resort-hero-video"
                  ref={heroVideoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className={`cb-hero-video ${videoLoaded ? 'loaded' : ''}`}
                >
                  <source src={URLS.heroVideo} type="video/mp4" />
                </video>

                {/* Elegant location badge */}
                <div className="cb-hero-location">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor"/>
                  </svg>
                  <span>{lang === 'en' ? 'Eilat, Israel' : 'אילת, ישראל'}</span>
                </div>

                {/* Centered Book Button - Cheval Blanc style */}
                <button
                  className="cb-hero-book-btn"
                  onClick={() => handleOpenBooking()}
                >
                  {lang === 'en' ? 'Book a room' : 'הזמן חדר'}
                </button>
              </div>
            </section>

            {/* Tagline Section */}
            <section className="cb-tagline-section">
              <div className="cb-thin-line" />
              <p className="cb-tagline">{text.hero.subtitle}</p>
              <div className="cb-thin-line" />
            </section>

            {/* Eilat 42 Gallery - State of the Art */}
            <section id="eilat42" className="cb-gallery">
              <div className="cb-gallery-header reveal">
                <span className="cb-gallery-eyebrow">{lang === 'en' ? 'Eilat 42' : 'אילת 42'}</span>
                <h2 className="cb-gallery-title">{lang === 'en' ? 'The Residence' : 'המתחם'}</h2>
              </div>
              <div className="cb-gallery-grid">
                {EILAT42_GALLERY.map((img, idx) => (
                  <div key={idx} className={`cb-gallery-item cb-gallery-item-${idx + 1} reveal`}>
                    <SmoothImage src={img} alt={`Eilat 42 ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </section>

            {/* Stats Section */}
            <section className="cb-stats">
              <div className="cb-stats-grid">
                <div className="cb-stat reveal">
                  <span className="cb-stat-value">28</span>
                  <span className="cb-stat-label">{lang === 'en' ? 'Luxury Suites' : 'סוויטות יוקרה'}</span>
                </div>
                <div className="cb-stat-divider" />
                <div className="cb-stat reveal">
                  <span className="cb-stat-value">1</span>
                  <span className="cb-stat-label">{lang === 'en' ? 'Minute to Beach' : 'דקה מהחוף'}</span>
                </div>
                <div className="cb-stat-divider" />
                <div className="cb-stat reveal">
                  <span className="cb-stat-value">5★</span>
                  <span className="cb-stat-label">{lang === 'en' ? 'Service' : 'שירות'}</span>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                SEASIDE - LEGENDARY GALLERY EXPERIENCE
                Making history in elegance and design
                ═══════════════════════════════════════════════════════════════════ */}

            {/* Seaside Hero - Standalone Masterpiece */}
            <section id="seaside" className="cb-seaside-hero">
              <div className="cb-seaside-hero-header reveal">
                <span className="cb-seaside-eyebrow">{lang === 'en' ? 'Seaside' : 'סי סייד'}</span>
                <h2 className="cb-seaside-title">{lang === 'en' ? 'Where Sea Meets Sky' : 'היכן שהים פוגש את השמיים'}</h2>
              </div>
              <div className="cb-seaside-hero-frame reveal">
                <div className="cb-seaside-frame-line cb-seaside-frame-top" />
                <div className="cb-seaside-frame-line cb-seaside-frame-bottom" />
                <div className="cb-seaside-hero-image">
                  <SmoothImage src={SEASIDE_GALLERY.hero} alt="Seaside Resort Aerial View" />
                </div>
                <div className="cb-seaside-hero-overlay" />
                <div className="cb-seaside-hero-brand">
                  <span className="cb-seaside-hero-text">SEASIDE</span>
                </div>
              </div>
            </section>

            {/* Seaside Horizontal Scroll Gallery */}
            <section className="cb-seaside-scroll">
              <div className="cb-seaside-scroll-track">
                {SEASIDE_GALLERY.scroll.map((img, idx) => {
                  const labels = [
                    { en: 'The Pool', he: 'הבריכה' },
                    { en: 'Grand Atrium', he: 'האטריום' },
                    { en: 'The Lounge', he: 'הטרקלין' },
                    { en: 'By Night', he: 'בלילה' },
                    { en: 'Golden Hour', he: 'שעת הזהב' },
                    { en: 'Elegance', he: 'אלגנטיות' },
                    { en: 'The Welcome', he: 'הקבלה' },
                  ];
                  const label = labels[idx] || labels[0];
                  return (
                    <div key={idx} className="cb-seaside-scroll-item">
                      <SmoothImage src={img} alt={`Seaside ${label.en}`} />
                      <span className="cb-scroll-label">{lang === 'en' ? label.en : label.he}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Second Feature Section */}
            <section className="cb-feature">
              <div className="cb-feature-grid">
                <div className="cb-feature-content reveal">
                  <h2 className="cb-section-title">{text.suites.title}</h2>
                  <p className="cb-section-text">{text.suites.subtitle}</p>
                  <a href="#" className="cb-link" onClick={(e) => { e.preventDefault(); navigateToPage('apartments'); }}>
                    {lang === 'en' ? 'View all rooms' : 'צפה בכל החדרים'}
                  </a>
                </div>
                <div className="cb-feature-image reveal">
                  <SmoothImage src={HERO_IMAGES[1]} alt="Suites" />
                </div>
              </div>
            </section>

            {/* Artistic Mid-Page Video - Cheval Blanc Style */}
            <section className="cb-midpage-video">
              {/* Decorative extending lines */}
              <div className="cb-midpage-lines">
                <div className="cb-midpage-line cb-midpage-line-left" />
                <div className="cb-midpage-line cb-midpage-line-right" />
              </div>

              <div className="cb-midpage-video-container">
                {/* Elegant thin frame */}
                <div className="cb-midpage-frame" />

                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="cb-midpage-video-player"
                >
                  <source src="/hero2.mp4" type="video/mp4" />
                </video>

                {/* Artistic overlay with brand */}
                <div className="cb-midpage-overlay" />
                <div className="cb-midpage-content">
                  <span className="cb-midpage-brand">RENTLY</span>
                  <span className="cb-midpage-tagline">{lang === 'en' ? 'Luxury Living' : 'חיי יוקרה'}</span>
                </div>

                {/* Centered Book Button */}
                <button
                  className="cb-midpage-book-btn"
                  onClick={() => handleOpenBooking()}
                >
                  {lang === 'en' ? 'Book a room' : 'הזמן חדר'}
                </button>
              </div>
            </section>

            {/* Amenities Section */}
            <section id="amenities" className="cb-amenities">
              <h2 className="cb-amenities-title reveal">{text.amenities.title}</h2>
              <div className="cb-amenities-grid">
                {text.amenities.items.map((item, i) => (
                  <div key={i} className="cb-amenity reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="cb-amenity-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience Section */}
            <section id="about" className="cb-experience">
              <div className="cb-experience-grid">
                <div className="cb-experience-image reveal">
                  <SmoothImage src={HERO_IMAGES[2]} alt="Experience" />
                </div>
                <div className="cb-experience-content reveal">
                  <h2 className="cb-section-title">{text.experience.title}</h2>
                  <div className="cb-experience-items">
                    {text.experience.items.map((item, i) => (
                      <div key={i} className="cb-experience-item">
                        <span className="cb-experience-name">{item.name}</span>
                        <span className="cb-experience-desc">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Magical Closing Video Section */}
            <section className="cb-closing-video">
              <div className="cb-closing-video-container">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="cb-closing-video-player"
                >
                  <source src={URLS.heroVideo} type="video/mp4" />
                </video>
                <div className="cb-closing-video-overlay" />
                <div className="cb-closing-video-content">
                  <span className="cb-closing-tagline">{lang === 'en' ? 'Your escape awaits' : 'הבריחה שלך מחכה'}</span>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="cb-contact">
              <div className="cb-contact-inner">
                <h2 className="cb-contact-title">{text.contact.title} {text.contact.title2}</h2>
                <p className="cb-contact-subtitle">{lang === 'en' ? 'Begin your luxury escape in Eilat' : 'התחילו את חופשת היוקרה שלכם באילת'}</p>
                <div className="cb-contact-links">
                  <a href={URLS.whatsapp} target="_blank" rel="noopener noreferrer" className="cb-contact-link">
                    WhatsApp
                  </a>
                  <span className="cb-contact-divider">·</span>
                  <a href="mailto:info@rently.co.il" className="cb-contact-link">
                    info@rently.co.il
                  </a>
                  <span className="cb-contact-divider">·</span>
                  <a href={URLS.waze} target="_blank" rel="noopener noreferrer" className="cb-contact-link">
                    {lang === 'en' ? 'Eilat, Israel' : 'אילת, ישראל'}
                  </a>
                </div>
                <button className="cb-book-btn" onClick={() => handleOpenBooking()}>
                  {text.contact.reserveNow}
                </button>
              </div>
            </section>

            {/* Footer */}
            <footer className="cb-footer">
              <div className="cb-footer-inner">
                <div className="cb-footer-brand">Rently Eilat</div>
                <div className="cb-footer-tagline">Where Desert Meets Sea</div>
                <div className="cb-footer-social">
                  <a href={URLS.instagram} target="_blank" rel="noopener noreferrer">{Icons.instagram}</a>
                  <a href={URLS.facebook} target="_blank" rel="noopener noreferrer">{Icons.facebook}</a>
                </div>
              </div>
            </footer>
          </div>
        </>
      )}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHATSAPP BUTTON
          ═══════════════════════════════════════════════════════════════════════ */}
      <a href={URLS.whatsapp} target="_blank" rel="noopener noreferrer" className="whatsapp">
        {Icons.whatsapp}
      </a>

      {/* ═══════════════════════════════════════════════════════════════════════
          BOOKING - Now powered by Hostly Booking Engine
          The BookingModal component is rendered in App.jsx via BookingProvider
          Old SimpleBooking.it integration removed
          ═══════════════════════════════════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════════════════════════════════
          APARTMENT MODAL - PORTAL TO BODY (True Airbnb Standard)
          Rendered outside scroll container for perfect positioning
          ═══════════════════════════════════════════════════════════════════════ */}
      {selectedApartment && createPortal(
        <div
          className={`cb-suite-modal cb-suite-modal--${modalTransition} ${theme} ${isRTL ? 'rtl' : 'ltr'}`}
          style={cardOriginRef.current && modalTransition === 'expanding' ? {
            '--card-origin-top': `${cardOriginRef.current.top}px`,
            '--card-origin-left': `${cardOriginRef.current.left}px`,
            '--card-origin-width': `${cardOriginRef.current.width}px`,
            '--card-origin-height': `${cardOriginRef.current.height}px`,
          } : undefined}
          onClick={(e) => {
            // Close when clicking backdrop (not the modal content)
            if (e.target === e.currentTarget) closeApartmentModal();
          }}
        >
          {/* Close Button */}
          <button className="cb-suite-close" onClick={closeApartmentModal}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Main Suite Showcase - IRON LOCKED */}
          <div className="cb-suite-showcase">
            {/* Image with swipe support */}
            <div
              className="cb-suite-media"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                e.currentTarget.dataset.touchStartX = touch.clientX;
              }}
              onTouchEnd={(e) => {
                const touchStartX = parseFloat(e.currentTarget.dataset.touchStartX);
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > 50) {
                  if (diff > 0) {
                    setApartmentImageIndex(prev => (prev + 1) % selectedApartment.images.length);
                  } else {
                    setApartmentImageIndex(prev => prev === 0 ? selectedApartment.images.length - 1 : prev - 1);
                  }
                }
              }}
            >
              <div className="cb-suite-media-inner">
                <img
                  key={apartmentImageIndex}
                  src={selectedApartment.images[apartmentImageIndex]}
                  alt={selectedApartment.name[lang]}
                  className="cb-suite-image"
                />
              </div>

              {/* Navigation Arrows */}
              {selectedApartment.images.length > 1 && (
                <>
                  <button
                    className="cb-suite-nav-arrow cb-suite-nav-prev"
                    onClick={() => setApartmentImageIndex(prev => prev === 0 ? selectedApartment.images.length - 1 : prev - 1)}
                    aria-label="Previous image"
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className="cb-suite-nav-arrow cb-suite-nav-next"
                    onClick={() => setApartmentImageIndex(prev => (prev + 1) % selectedApartment.images.length)}
                    aria-label="Next image"
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}

              {/* Thumbnail Strip */}
              {selectedApartment.images.length > 1 && (
                <div className="cb-suite-thumbnails">
                  {selectedApartment.images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`cb-suite-thumb ${idx === apartmentImageIndex ? 'active' : ''}`}
                      onClick={() => setApartmentImageIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Suite Info - NO SCROLL */}
            <div className="cb-suite-info" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
              <h1 className="cb-suite-title">{selectedApartment.name[lang]}</h1>

              <p className="cb-suite-desc">
                {selectedApartment.description[lang]}
              </p>

              {/* Amenities Icons */}
              <div className="cb-suite-amenities">
                <div className="cb-suite-amenity">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M2 22l10-5 10 5M2 17l10-5 10 5M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor"/>
                  </svg>
                  <span>{lang === 'en' ? 'Scenic views' : 'נוף מרהיב'}</span>
                </div>
                <div className="cb-suite-amenity">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M3 22V8l9-6 9 6v14H3zM9 22v-8h6v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{selectedApartment.specs.beds} {lang === 'en' ? 'bedroom' : 'חדרי שינה'}</span>
                </div>
                <div className="cb-suite-amenity">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor"/>
                    <path d="M3 9h18M9 21V9" stroke="currentColor"/>
                  </svg>
                  <span>{selectedApartment.specs.sqm} {lang === 'en' ? 'sqm' : 'מ״ר'}</span>
                </div>
                <div className="cb-suite-amenity">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{selectedApartment.specs.guests || '4'} {lang === 'en' ? 'guests' : 'אורחים'}</span>
                </div>
              </div>

              {/* Reserve Button - Opens Hostly Booking */}
              <button
                className="cb-suite-book-btn"
                onClick={() => {
                  const apt = selectedApartment;
                  closeApartmentModal();
                  setTimeout(() => handleOpenBooking(apt), 300);
                }}
              >
                {lang === 'en' ? 'Reserve' : 'הזמן עכשיו'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Page Transition Overlay - Full Screen ──────────────────────────── */}
      <div className={`page-transition-overlay ${pageTransition ? 'active' : ''}`} />
    </div>
  );
};

export default EilatLuxuryResort;