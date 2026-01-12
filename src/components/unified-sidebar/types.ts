// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SIDEBAR - TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
// State-of-the-art sidebar system for Hostly platform.
// Works in public mode (vacationers) and host mode (property managers).
// ═══════════════════════════════════════════════════════════════════════════════

import type { ComponentType, ReactNode } from 'react';

// ─── Core Types ────────────────────────────────────────────────────────────────

export type SidebarMode = 'public' | 'host';
export type SidebarTheme = 'white' | 'cream' | 'petra' | 'dark';
export type SidebarLang = 'en' | 'he';

// ─── Host Identity ─────────────────────────────────────────────────────────────

export interface HostBrand {
  slug: string;
  name: string;
  location?: string;
  logo?: ReactNode;
  tagline?: { en: string; he: string };
}

// ─── Navigation ────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  number?: string;                    // "01", "02", etc. (architectural numbering)
  label: { en: string; he: string };
  icon: ComponentType<{ className?: string }>;
  href?: string;                      // Route to navigate
  onClick?: () => void;               // Custom action
  scrollTo?: string;                  // Scroll to section ID
  children?: NavItem[];               // Sub-menu items
  badge?: string | number;            // Notification badge
  requiresAuth?: boolean;             // Only show in host mode
  hideInCollapsed?: boolean;          // Hide when sidebar collapsed
}

export interface NavGroup {
  id: string;
  label?: { en: string; he: string }; // Optional group label
  items: NavItem[];
}

// ─── Social Links ──────────────────────────────────────────────────────────────

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

// ─── Sidebar Props ─────────────────────────────────────────────────────────────

export interface UnifiedSidebarProps {
  // ─── Mode & Context ───────────────────────────────────────────────────────
  mode: SidebarMode;

  // ─── Host Branding ────────────────────────────────────────────────────────
  host?: HostBrand;

  // ─── Navigation ───────────────────────────────────────────────────────────
  navGroups?: NavGroup[];
  onNavigate?: (item: NavItem) => void;
  activePath?: string;                   // Current pathname for active state

  // ─── Appearance ───────────────────────────────────────────────────────────
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  defaultCollapsed?: boolean;

  // ─── Theme ────────────────────────────────────────────────────────────────
  theme?: SidebarTheme;
  onThemeChange?: (theme: SidebarTheme) => void;
  showThemeSelector?: boolean;

  // ─── Language ─────────────────────────────────────────────────────────────
  lang?: SidebarLang;
  onLangChange?: (lang: SidebarLang) => void;
  showLangSelector?: boolean;

  // ─── Book Button ──────────────────────────────────────────────────────────
  showBookButton?: boolean;
  onBookClick?: () => void;
  bookButtonText?: { en: string; he: string };

  // ─── Social Links ─────────────────────────────────────────────────────────
  socialLinks?: SocialLink[];

  // ─── Mobile ───────────────────────────────────────────────────────────────
  mobileOpen?: boolean;
  onMobileClose?: () => void;

  // ─── Custom Content ───────────────────────────────────────────────────────
  headerExtra?: ReactNode;
  footerExtra?: ReactNode;

  // ─── CSS Class Overrides ──────────────────────────────────────────────────
  className?: string;
}

// ─── Sidebar Context ───────────────────────────────────────────────────────────

export interface SidebarContextValue {
  mode: SidebarMode;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  theme: SidebarTheme;
  setTheme: (theme: SidebarTheme) => void;
  lang: SidebarLang;
  setLang: (lang: SidebarLang) => void;
  isRTL: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

// ─── Theme Configuration ───────────────────────────────────────────────────────

export interface ThemeConfig {
  id: SidebarTheme;
  label: { en: string; he: string };
  icon: string;         // Emoji or icon
  colors: {
    bg: string;
    text: string;
    border: string;
  };
}

export const THEME_CONFIGS: ThemeConfig[] = [
  {
    id: 'white',
    label: { en: 'Light', he: 'בהיר' },
    icon: '☀️',
    colors: { bg: '#ffffff', text: '#1a1a1a', border: '#e5e5e5' },
  },
  {
    id: 'cream',
    label: { en: 'Cream', he: 'קרם' },
    icon: '🥐',
    colors: { bg: '#faf7f2', text: '#2d2a26', border: '#e8e4dc' },
  },
  {
    id: 'petra',
    label: { en: 'Stone', he: 'אבן' },
    icon: '🏛️',
    colors: { bg: '#f5f0eb', text: '#3d3630', border: '#ddd5cb' },
  },
  {
    id: 'dark',
    label: { en: 'Dark', he: 'כהה' },
    icon: '🌙',
    colors: { bg: '#1a1a1a', text: '#f5f5f5', border: '#333333' },
  },
];

// ─── Language Configuration ────────────────────────────────────────────────────

export interface LangConfig {
  id: SidebarLang;
  label: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANG_CONFIGS: LangConfig[] = [
  { id: 'en', label: 'English', flag: '🇺🇸', dir: 'ltr' },
  { id: 'he', label: 'עברית', flag: '🇮🇱', dir: 'rtl' },
];
