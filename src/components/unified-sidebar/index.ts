// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SIDEBAR - PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

// Main component
export { UnifiedSidebar, useSidebar } from './UnifiedSidebar';

// Types
export type {
  SidebarMode,
  SidebarTheme,
  SidebarLang,
  HostBrand,
  NavItem,
  NavGroup,
  SocialLink,
  UnifiedSidebarProps,
  SidebarContextValue,
  ThemeConfig,
  LangConfig,
} from './types';

// Configs
export { THEME_CONFIGS, LANG_CONFIGS } from './types';

// Navigation helpers
export {
  getPublicNavGroups,
  getHostNavGroups,
  getSocialLinks,
  getHostBrand,
  Icons,
} from './nav-config';
