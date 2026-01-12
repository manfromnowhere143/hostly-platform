// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SIDEBAR - STATE OF THE ART
// ═══════════════════════════════════════════════════════════════════════════════
// Single sidebar component for the entire Hostly platform.
// Adapts to public mode (vacationers) and host mode (property managers).
// Mobile-first, RTL-ready, GPU-accelerated animations.
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import type {
  UnifiedSidebarProps,
  SidebarContextValue,
  NavItem,
  NavGroup,
  SidebarTheme,
  SidebarLang,
} from './types';
import { THEME_CONFIGS, LANG_CONFIGS } from './types';
import './styles/unified-sidebar.css';

// ─── Context ───────────────────────────────────────────────────────────────────

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within UnifiedSidebar');
  return ctx;
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" strokeWidth="1">
      <path d="M20 4L4 12l16 8 16-8-16-8z" stroke="currentColor" />
      <path d="M4 28l16 8 16-8" stroke="currentColor" />
      <path d="M4 20l16 8 16-8" stroke="currentColor" />
    </svg>
  );
}

function ChevronIcon({ className, direction = 'right' }: { className?: string; direction?: 'left' | 'right' | 'up' | 'down' }) {
  const paths = {
    right: 'M9 18l6-6-6-6',
    left: 'M15 18l-6-6 6-6',
    down: 'M6 9l6 6 6-6',
    up: 'M6 15l6-6 6-6',
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d={paths[direction]} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

function CalendarBookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeLinecap="round" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

// ─── Theme Icon ────────────────────────────────────────────────────────────────

function ThemeIcon({ theme }: { theme: SidebarTheme }) {
  const colors = {
    white: ['#fff', '#f5f5f5', '#e5e5e5', '#d4d4d4'],
    cream: ['#faf7f2', '#f5f0e8', '#e8e4dc', '#ddd5cb'],
    petra: ['#f5f0eb', '#ebe4dc', '#ddd5cb', '#cec4b8'],
    dark: ['#1a1a1a', '#2d2d2d', '#404040', '#525252'],
  };
  return (
    <div className="us-theme-icon">
      {colors[theme].map((color, i) => (
        <span key={i} style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

// ─── Social Icons ──────────────────────────────────────────────────────────────

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

// ─── Nav Item Component ────────────────────────────────────────────────────────

function NavItemComponent({
  item,
  isActive,
  collapsed,
  lang,
  onNavigate,
  expandedGroups,
  toggleGroup,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  lang: SidebarLang;
  onNavigate: (item: NavItem) => void;
  expandedGroups: Set<string>;
  toggleGroup: (id: string) => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedGroups.has(item.id);
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      toggleGroup(item.id);
    } else if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else {
      onNavigate(item);
    }
  };

  const content = (
    <>
      <Icon className="us-nav-icon" />
      <div className="us-nav-left">
        {item.number && <span className="us-nav-number">{item.number}</span>}
        <span className="us-nav-label">{item.label[lang]}</span>
      </div>
      {hasChildren && (
        <ChevronIcon
          className={`us-nav-chevron ${isExpanded ? 'open' : ''}`}
          direction="down"
        />
      )}
      {item.badge && !collapsed && (
        <span className="us-nav-badge">{item.badge}</span>
      )}
    </>
  );

  const className = `us-nav-item ${isActive ? 'active' : ''} ${hasChildren && isExpanded ? 'expanded' : ''}`;
  const tooltip = collapsed ? item.label[lang] : undefined;

  // Render as Link or button
  if (item.href && !hasChildren) {
    return (
      <div className="us-nav-group">
        <Link href={item.href} className={className} data-tooltip={tooltip} onClick={handleClick}>
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div className="us-nav-group">
      <button type="button" className={className} data-tooltip={tooltip} onClick={handleClick}>
        {content}
      </button>

      {/* Children (sub-menu) */}
      {hasChildren && (
        <>
          {/* Normal view (expanded sidebar) */}
          <div className={`us-nav-children ${isExpanded ? 'open' : ''}`}>
            {item.children!.map((child) => {
              const ChildIcon = child.icon;
              return child.href ? (
                <Link
                  key={child.id}
                  href={child.href}
                  className="us-nav-child"
                  onClick={() => onNavigate(child)}
                >
                  <ChildIcon className="us-nav-child-icon" />
                  <span className="us-nav-child-label">{child.label[lang]}</span>
                </Link>
              ) : (
                <button
                  key={child.id}
                  type="button"
                  className="us-nav-child"
                  onClick={() => {
                    if (child.onClick) {
                      child.onClick();
                    } else {
                      // Handle scrollTo navigation for children
                      onNavigate(child);
                    }
                  }}
                >
                  <ChildIcon className="us-nav-child-icon" />
                  <span className="us-nav-child-label">{child.label[lang]}</span>
                </button>
              );
            })}
          </div>

          {/* Popup view (collapsed sidebar) */}
          <div className={`us-nav-popup ${isExpanded ? 'open' : ''}`}>
            {item.children!.map((child) => {
              const ChildIcon = child.icon;
              return child.href ? (
                <Link
                  key={child.id}
                  href={child.href}
                  className="us-popup-item"
                  onClick={() => {
                    toggleGroup(item.id);
                    onNavigate(child);
                  }}
                >
                  <ChildIcon className="us-popup-icon" />
                  <span>{child.label[lang]}</span>
                </Link>
              ) : (
                <button
                  key={child.id}
                  type="button"
                  className="us-popup-item"
                  onClick={() => {
                    toggleGroup(item.id);
                    if (child.onClick) {
                      child.onClick();
                    } else {
                      // Handle scrollTo navigation for children
                      onNavigate(child);
                    }
                  }}
                >
                  <ChildIcon className="us-popup-icon" />
                  <span>{child.label[lang]}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function UnifiedSidebar({
  mode,
  host,
  navGroups = [],
  onNavigate,
  activePath,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  defaultCollapsed = false,
  theme: controlledTheme,
  onThemeChange,
  showThemeSelector = true,
  lang: controlledLang,
  onLangChange,
  showLangSelector = true,
  showBookButton = true,
  onBookClick,
  bookButtonText = { en: 'Book Now', he: 'הזמן עכשיו' },
  socialLinks = [],
  mobileOpen: controlledMobileOpen,
  onMobileClose,
  headerExtra,
  footerExtra,
  className = '',
}: UnifiedSidebarProps) {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [collapsed, setCollapsedState] = useState(defaultCollapsed);
  const [theme, setThemeState] = useState<SidebarTheme>('white');
  const [lang, setLangState] = useState<SidebarLang>('en');
  const [mobileOpen, setMobileOpenState] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Controlled vs uncontrolled
  const isCollapsed = controlledCollapsed ?? collapsed;
  const currentTheme = controlledTheme ?? theme;
  const currentLang = controlledLang ?? lang;
  const isMobileOpen = controlledMobileOpen ?? mobileOpen;
  const isRTL = currentLang === 'he';

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    onCollapsedChange?.(value);
  }, [onCollapsedChange]);

  const setTheme = useCallback((value: SidebarTheme) => {
    setThemeState(value);
    onThemeChange?.(value);
    localStorage.setItem('hostly-theme', value);
  }, [onThemeChange]);

  const setLang = useCallback((value: SidebarLang) => {
    setLangState(value);
    onLangChange?.(value);
    localStorage.setItem('hostly-lang', value);
  }, [onLangChange]);

  const setMobileOpen = useCallback((value: boolean) => {
    setMobileOpenState(value);
    if (!value) onMobileClose?.();
  }, [onMobileClose]);

  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleNavigate = useCallback((item: NavItem) => {
    onNavigate?.(item);
    if (isMobile) setMobileOpen(false);
  }, [onNavigate, isMobile, setMobileOpen]);

  // ─── Effects ───────────────────────────────────────────────────────────────

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('hostly-theme') as SidebarTheme | null;
    const savedLang = localStorage.getItem('hostly-lang') as SidebarLang | null;
    if (savedTheme && !controlledTheme) setThemeState(savedTheme);
    if (savedLang && !controlledLang) setLangState(savedLang);
  }, [controlledTheme, controlledLang]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.us-control-group')) {
        setThemeDropdownOpen(false);
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // ─── Context Value ─────────────────────────────────────────────────────────
  const contextValue: SidebarContextValue = {
    mode,
    collapsed: isCollapsed,
    setCollapsed,
    theme: currentTheme,
    setTheme,
    lang: currentLang,
    setLang,
    isRTL,
    isMobile,
    mobileOpen: isMobileOpen,
    setMobileOpen,
  };

  // ─── Translations ──────────────────────────────────────────────────────────
  const t = {
    book: bookButtonText[currentLang],
    theme: currentLang === 'en' ? 'Theme' : 'ערכת נושא',
    language: currentLang === 'en' ? 'Language' : 'שפה',
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        className={`
          unified-sidebar
          ${isCollapsed ? 'collapsed' : ''}
          ${isMobileOpen ? 'mobile-open' : ''}
          ${isRTL ? 'rtl' : 'ltr'}
          theme-${currentTheme}
          ${className}
        `}
        data-mode={mode}
      >
        {/* Architectural lines */}
        <div className="us-line us-line-1" />
        <div className="us-line us-line-2" />

        {/* Mobile controls */}
        {isMobile && isMobileOpen && (
          <div className="us-mobile-controls">
            <button
              type="button"
              className="us-mobile-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <CloseIcon className="us-mobile-close-icon" />
            </button>

            {showBookButton && mode === 'public' && (
              <button
                type="button"
                className="us-mobile-book"
                onClick={() => {
                  onBookClick?.();
                  setMobileOpen(false);
                }}
              >
                <CalendarBookIcon className="us-mobile-book-icon" />
                <span className="us-mobile-book-text">{t.book}</span>
              </button>
            )}
          </div>
        )}

        {/* Header */}
        <header className="us-header">
          <div className="us-logo-icon">
            {host?.logo || <LogoIcon />}
          </div>
          <div className="us-logo-text">
            <span className="us-logo-brand">{host?.name || 'Hostly'}</span>
            {host?.location && (
              <span className="us-logo-location">{host.location}</span>
            )}
          </div>

          {/* Collapse toggle (desktop only) */}
          {!isMobile && (
            <button
              type="button"
              className="us-collapse-btn"
              onClick={() => setCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronIcon direction={isCollapsed ? (isRTL ? 'left' : 'right') : (isRTL ? 'right' : 'left')} />
            </button>
          )}

          {headerExtra}
        </header>

        {/* Navigation */}
        <nav className="us-nav">
          {navGroups.map((group) => (
            <div key={group.id} className="us-nav-section">
              {group.label && !isCollapsed && (
                <h3 className="us-nav-group-label">{group.label[currentLang]}</h3>
              )}
              {group.items
                .filter((item) => !item.requiresAuth || mode === 'host')
                .map((item) => {
                  // Determine if this item is active based on path matching
                  const isItemActive = activePath
                    ? item.href === activePath ||
                      (item.href && activePath.startsWith(item.href) && item.href !== '/portal') ||
                      item.children?.some(child => child.href === activePath)
                    : false;

                  return (
                    <NavItemComponent
                      key={item.id}
                      item={item}
                      isActive={isItemActive}
                      collapsed={isCollapsed}
                      lang={currentLang}
                      onNavigate={handleNavigate}
                      expandedGroups={expandedGroups}
                      toggleGroup={toggleGroup}
                    />
                  );
                })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <footer className="us-footer">
          {/* Controls */}
          <div className="us-controls">
            {/* Theme Selector */}
            {showThemeSelector && (
              <div className="us-control-group">
                <button
                  type="button"
                  className={`us-control-btn ${themeDropdownOpen ? 'active' : ''}`}
                  onClick={() => {
                    setThemeDropdownOpen(!themeDropdownOpen);
                    setLangDropdownOpen(false);
                  }}
                >
                  <ThemeIcon theme={currentTheme} />
                  <span className="us-control-label">{t.theme}</span>
                </button>
                <div className={`us-dropdown ${themeDropdownOpen ? 'open' : ''}`}>
                  {THEME_CONFIGS.map((config) => (
                    <button
                      key={config.id}
                      type="button"
                      className={currentTheme === config.id ? 'active' : ''}
                      onClick={() => {
                        setTheme(config.id);
                        setThemeDropdownOpen(false);
                      }}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label[currentLang]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language Selector */}
            {showLangSelector && (
              <div className="us-control-group">
                <button
                  type="button"
                  className={`us-control-btn ${langDropdownOpen ? 'active' : ''}`}
                  onClick={() => {
                    setLangDropdownOpen(!langDropdownOpen);
                    setThemeDropdownOpen(false);
                  }}
                >
                  <span className="us-lang-flag">
                    {LANG_CONFIGS.find((c) => c.id === currentLang)?.flag}
                  </span>
                  <span className="us-control-label">
                    {currentLang === 'en' ? 'EN' : 'עב'}
                  </span>
                </button>
                <div className={`us-dropdown ${langDropdownOpen ? 'open' : ''}`}>
                  {LANG_CONFIGS.map((config) => (
                    <button
                      key={config.id}
                      type="button"
                      className={currentLang === config.id ? 'active' : ''}
                      onClick={() => {
                        setLang(config.id);
                        setLangDropdownOpen(false);
                      }}
                    >
                      <span>{config.flag}</span>
                      <span>{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Book Button (public mode only) */}
          {showBookButton && mode === 'public' && !isMobile && (
            <button
              type="button"
              className="us-book-btn"
              onClick={onBookClick}
            >
              <span className="us-book-icon">
                <CalendarBookIcon />
              </span>
              <span className="us-book-text">{t.book}</span>
              <ChevronIcon direction={isRTL ? 'left' : 'right'} className="us-book-arrow" />
            </button>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="us-social">
              {socialLinks.map((link) => {
                const SocialIcon = link.icon;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                  >
                    <SocialIcon />
                  </a>
                );
              })}
            </div>
          )}

          {footerExtra}
        </footer>
      </aside>

      {/* Mobile backdrop */}
      {isMobile && isMobileOpen && (
        <div
          className="us-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </SidebarContext.Provider>
  );
}

export default UnifiedSidebar;
