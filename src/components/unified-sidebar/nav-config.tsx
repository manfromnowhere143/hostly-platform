// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SIDEBAR - NAVIGATION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
// Navigation items for public mode (vacationers) and host mode (property managers)
// ═══════════════════════════════════════════════════════════════════════════════

import type { NavGroup, SocialLink } from './types';

// ─── Icons ─────────────────────────────────────────────────────────────────────

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3m4-4h.01M7 13h.01M7 9h.01M11 17h.01M11 13h.01M11 9h.01M15 17h.01M15 13h.01M15 9h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d="M3 15c2.5-2.5 5.5-2.5 8 0s5.5 2.5 8 0M3 11c2.5-2.5 5.5-2.5 8 0s5.5 2.5 8 0M3 7c2.5-2.5 5.5-2.5 8 0s5.5 2.5 8 0" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" stroke="currentColor" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="3" stroke="currentColor" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" stroke="currentColor" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" />
      <rect x="14" y="3" width="7" height="5" rx="1" stroke="currentColor" />
      <rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" />
      <rect x="3" y="16" width="7" height="5" rx="1" stroke="currentColor" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" stroke="currentColor" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" stroke="currentColor" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />
    </svg>
  );
}

// ─── Public Navigation (Vacationers viewing host page) ─────────────────────────

export function getPublicNavGroups(hostSlug: string): NavGroup[] {
  // Rently-specific navigation
  if (hostSlug === 'rently') {
    return [
      {
        id: 'main',
        items: [
          {
            id: 'home',
            number: '01',
            label: { en: 'Home', he: 'בית' },
            icon: HomeIcon,
            scrollTo: 'hero',
          },
          {
            id: 'apartments',
            number: '02',
            label: { en: 'Apartments', he: 'דירות' },
            icon: BuildingIcon,
            action: { navigateTo: 'apartments' },
            children: [
              {
                id: 'seaside',
                label: { en: 'Sea Side', he: 'סי סייד' },
                icon: WaveIcon,
                action: { navigateTo: 'apartments', activeProject: 'seaside' },
              },
              {
                id: 'eilat42',
                label: { en: 'Eilat 42', he: 'אילת 42' },
                icon: SunIcon,
                action: { navigateTo: 'apartments', activeProject: 'eilat42' },
              },
            ],
          },
          {
            id: 'location',
            number: '03',
            label: { en: 'Location', he: 'מיקום' },
            icon: MapPinIcon,
            scrollTo: 'contact',
          },
          {
            id: 'contact',
            number: '04',
            label: { en: 'Contact', he: 'צור קשר' },
            icon: PhoneIcon,
            scrollTo: 'contact',
          },
          {
            id: 'about',
            number: '05',
            label: { en: 'About', he: 'אודות' },
            icon: InfoIcon,
            scrollTo: 'about',
          },
        ],
      },
      // Host management - Only visible for authenticated hosts
      {
        id: 'host-actions',
        items: [
          {
            id: 'dashboard',
            number: '06',
            label: { en: 'Dashboard', he: 'לוח בקרה' },
            icon: DashboardIcon,
            href: '/portal',
            requiresAuth: true,
          },
          {
            id: 'back-to-hostly',
            label: { en: 'Hostly Marketplace', he: 'שוק הוסטלי' },
            icon: ArrowLeftIcon,
            href: '/',
          },
        ],
      },
    ];
  }

  // Default public navigation for other hosts
  return [
    {
      id: 'main',
      items: [
        {
          id: 'home',
          number: '01',
          label: { en: 'Home', he: 'בית' },
          icon: HomeIcon,
          href: `/h/${hostSlug}`,
        },
        {
          id: 'properties',
          number: '02',
          label: { en: 'Properties', he: 'נכסים' },
          icon: BuildingIcon,
          href: `/h/${hostSlug}/properties`,
        },
        {
          id: 'about',
          number: '03',
          label: { en: 'About', he: 'אודות' },
          icon: InfoIcon,
          href: `/h/${hostSlug}/about`,
        },
        {
          id: 'contact',
          number: '04',
          label: { en: 'Contact', he: 'צור קשר' },
          icon: PhoneIcon,
          href: `/h/${hostSlug}/contact`,
        },
      ],
    },
  ];
}

// ─── Host Navigation (Property managers in portal) ─────────────────────────────

export function getHostNavGroups(hostSlug: string): NavGroup[] {
  return [
    {
      id: 'management',
      items: [
        {
          id: 'dashboard',
          number: '01',
          label: { en: 'Dashboard', he: 'לוח בקרה' },
          icon: DashboardIcon,
          href: '/portal',
          requiresAuth: true,
        },
        {
          id: 'website',
          number: '02',
          label: { en: 'My Website', he: 'האתר שלי' },
          icon: GlobeIcon,
          href: `/h/${hostSlug}`,
          requiresAuth: true,
        },
        {
          id: 'properties',
          number: '03',
          label: { en: 'Properties', he: 'נכסים' },
          icon: BuildingIcon,
          href: '/portal/properties',
          badge: 28,
          requiresAuth: true,
        },
        {
          id: 'reservations',
          number: '04',
          label: { en: 'Reservations', he: 'הזמנות' },
          icon: CalendarIcon,
          href: '/portal/reservations',
          badge: 3,
          requiresAuth: true,
        },
        {
          id: 'analytics',
          number: '05',
          label: { en: 'Analytics', he: 'אנליטיקה' },
          icon: ChartIcon,
          href: '/portal/reports',
          requiresAuth: true,
        },
        {
          id: 'settings',
          number: '06',
          label: { en: 'Settings', he: 'הגדרות' },
          icon: CogIcon,
          href: '/portal/settings',
          requiresAuth: true,
        },
      ],
    },
    {
      id: 'back',
      items: [
        {
          id: 'back-to-hostly',
          label: { en: 'Back to Hostly', he: 'חזרה להוסטלי' },
          icon: ArrowLeftIcon,
          href: '/',
        },
      ],
    },
  ];
}

// ─── Social Links ──────────────────────────────────────────────────────────────

export function getSocialLinks(hostSlug: string): SocialLink[] {
  // Rently-specific social links
  if (hostSlug === 'rently') {
    return [
      {
        id: 'instagram',
        label: 'Instagram',
        href: 'https://instagram.com/rently_luxury',
        icon: InstagramIcon,
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        href: 'https://wa.me/972501234567',
        icon: WhatsAppIcon,
      },
      {
        id: 'facebook',
        label: 'Facebook',
        href: 'https://facebook.com/rentlyluxury',
        icon: FacebookIcon,
      },
    ];
  }

  // Default social links
  return [];
}

// ─── Host Branding ─────────────────────────────────────────────────────────────

export interface HostBrandConfig {
  slug: string;
  name: string;
  location?: string;
  tagline?: { en: string; he: string };
}

export function getHostBrand(hostSlug: string): HostBrandConfig | null {
  const hosts: Record<string, HostBrandConfig> = {
    rently: {
      slug: 'rently',
      name: 'Rently',
      location: 'Eilat, Israel',
      tagline: {
        en: 'Luxury Vacation Rentals',
        he: 'השכרת נופש יוקרתית',
      },
    },
  };

  return hosts[hostSlug] || null;
}

// ─── Export All Icons for External Use ─────────────────────────────────────────

export const Icons = {
  Home: HomeIcon,
  Building: BuildingIcon,
  Wave: WaveIcon,
  Sun: SunIcon,
  MapPin: MapPinIcon,
  Phone: PhoneIcon,
  Info: InfoIcon,
  Dashboard: DashboardIcon,
  Globe: GlobeIcon,
  Calendar: CalendarIcon,
  Chart: ChartIcon,
  Cog: CogIcon,
  User: UserIcon,
  Instagram: InstagramIcon,
  WhatsApp: WhatsAppIcon,
  Facebook: FacebookIcon,
};
