# Rently + Hostly Integration Plan
## State-of-the-Art Unified Platform Architecture

---

## Executive Summary

We are integrating **Rently as the first real host** on Hostly. This requires:
1. A **unified sidebar system** that works in public and host modes
2. A **merged dashboard** combining Rently's design with Hostly's functionality
3. **CSS isolation** to prevent style bleeding
4. **Complete route architecture** for the entire platform

---

## 1. Unified Sidebar System

### Architecture Decision

**Use Rently's sidebar as the base** - it's state-of-the-art:
- GPU-accelerated animations (60fps)
- Mobile-first responsive design
- RTL/Hebrew support built-in
- Collapse/expand with tooltips
- Architectural lines decoration
- Numbered navigation (01, 02, 03...)
- Theme selector (4 themes)
- Language selector

### Sidebar API

```typescript
// src/components/unified-sidebar/UnifiedSidebar.tsx

export type SidebarMode = 'public' | 'host';
export type SidebarContext = 'marketplace' | 'host-page' | 'portal';

export interface UnifiedSidebarProps {
  // Core
  mode: SidebarMode;
  context: SidebarContext;

  // Host Info (for host pages)
  host?: {
    slug: string;
    name: string;
    logo?: string;
    location?: string;
  };

  // Navigation overrides
  customNavItems?: NavItem[];

  // Appearance
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;

  // Localization
  lang?: 'en' | 'he';
  onLangChange?: (lang: 'en' | 'he') => void;

  // Theme
  theme?: 'white' | 'cream' | 'petra' | 'dark';
  onThemeChange?: (theme: string) => void;

  // Callbacks
  onBookClick?: () => void;
  onNavigate?: (href: string) => void;
}

export interface NavItem {
  id: string;
  number?: string;         // "01", "02", etc.
  label: { en: string; he: string };
  icon: React.ComponentType;
  href?: string;
  onClick?: () => void;
  children?: NavItem[];    // For sub-menus
  badge?: string | number;
  requiresAuth?: boolean;  // Only show in host mode
}
```

### Navigation Configuration by Mode

```typescript
// Public Mode (vacationer viewing /h/rently)
const PUBLIC_NAV: NavItem[] = [
  {
    id: 'home',
    number: '01',
    label: { en: 'Home', he: 'בית' },
    icon: HomeIcon,
    href: '/',  // Hostly marketplace
  },
  {
    id: 'apartments',
    number: '02',
    label: { en: 'Apartments', he: 'דירות' },
    icon: BuildingIcon,
    children: [
      { id: 'seaside', label: { en: 'Sea Side', he: 'סי סייד' }, icon: WaveIcon },
      { id: 'eilat42', label: { en: 'Eilat 42', he: 'אילת 42' }, icon: BuildingIcon },
    ],
  },
];

// Host Mode (host logged into portal)
const HOST_NAV: NavItem[] = [
  {
    id: 'dashboard',
    number: '01',
    label: { en: 'Dashboard', he: 'לוח בקרה' },
    icon: ChartIcon,
    href: '/portal',
    requiresAuth: true,
  },
  {
    id: 'website',
    number: '02',
    label: { en: 'My Website', he: 'האתר שלי' },
    icon: GlobeIcon,
    href: '/h/{hostSlug}',  // Opens their host page
    requiresAuth: true,
  },
  {
    id: 'apartments',
    number: '03',
    label: { en: 'Properties', he: 'נכסים' },
    icon: BuildingIcon,
    href: '/portal/properties',
    badge: 28,  // Dynamic count
    requiresAuth: true,
  },
  {
    id: 'reservations',
    number: '04',
    label: { en: 'Reservations', he: 'הזמנות' },
    icon: CalendarIcon,
    href: '/portal/reservations',
    badge: 3,  // Pending reservations
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
];
```

### Sidebar Footer (Always Visible)

```typescript
// Always shows:
// - Theme selector (white/cream/petra/dark)
// - Language selector (EN/HE)
// - Social links (configurable per host)

// In public mode: Book button
// In host mode: No book button (they're the host!)
```

---

## 2. Route Architecture

### Complete Route Table

| Route | Component | Sidebar Mode | Sidebar Context | Description |
|-------|-----------|--------------|-----------------|-------------|
| `/` | `MarketplacePage` | N/A (no sidebar) | `marketplace` | Hostly main search page |
| `/search` | `SearchResultsPage` | N/A | `marketplace` | Search results with Hostly cards |
| `/listing/{slug}` | `ListingDetailPage` | N/A | `marketplace` | Individual listing detail |
| `/h/{hostSlug}` | `HostPageRouter` | `public` | `host-page` | Host personal page |
| `/h/rently` | `RentlyLuxuryWrapper` | `public` | `host-page` | Exact Rently website |
| `/portal` | `PortalDashboard` | `host` | `portal` | Host dashboard |
| `/portal/properties` | `PropertiesPage` | `host` | `portal` | Manage properties |
| `/portal/reservations` | `ReservationsPage` | `host` | `portal` | Manage bookings |
| `/portal/website` | `WebsiteBuilderPage` | `host` | `portal` | Edit host website |
| `/portal/reports` | `ReportsPage` | `host` | `portal` | Analytics dashboard |
| `/portal/settings` | `SettingsPage` | `host` | `portal` | Host settings |

### Host Identity Resolution

```typescript
// src/lib/host/identity.ts

export interface HostIdentity {
  id: string;           // Database ID
  slug: string;         // URL slug (e.g., 'rently')
  name: string;         // Display name
  orgSlug: string;      // Hostly org for API calls
  isLegacySite: boolean; // Has custom-built site
  legacyComponent?: string; // Component name if legacy
}

// Resolution flow:
// 1. URL param: /h/{hostSlug}
// 2. Database lookup: hosts.findBySlug(hostSlug)
// 3. Session check: Is viewer the host owner?
// 4. Return mode: 'public' or 'host'

export async function resolveHostIdentity(
  hostSlug: string,
  session?: UserSession
): Promise<{
  host: HostIdentity;
  mode: 'public' | 'host';
  isOwner: boolean;
}> {
  const host = await db.hosts.findBySlug(hostSlug);

  if (!host) {
    throw new NotFoundError(`Host not found: ${hostSlug}`);
  }

  const isOwner = session?.userId === host.ownerId;
  const mode = isOwner ? 'host' : 'public';

  return { host, mode, isOwner };
}
```

### Legacy Site Detection

```typescript
// src/lib/host/legacy-sites.ts

export const LEGACY_SITES: Record<string, {
  component: string;
  wrapper: string;
}> = {
  rently: {
    component: 'EilatLuxuryResort',
    wrapper: 'RentlyLuxuryWrapper',
  },
  // Future legacy sites can be added here
};

export function isLegacySite(hostSlug: string): boolean {
  return hostSlug in LEGACY_SITES;
}
```

---

## 3. Dashboard Merge Strategy

### Current State

| Aspect | Rently Dashboard | Hostly Dashboard |
|--------|------------------|------------------|
| Design | State-of-the-art, velvet colors | Functional, generic |
| Charts | Revenue, Channel, Forecast | Revenue, Occupancy |
| RTL | Full support | Partial |
| Mobile | Excellent | Good |
| Skeleton | Yes | Yes |
| API | Direct fetch | SWR caching |

### Merge Decision

**Use Rently Dashboard design + Hostly Dashboard functionality**

### Component Map

| Final Component | Source | Enhancements |
|-----------------|--------|--------------|
| `SummaryCards` | Rently | Add Hostly's click-through analytics |
| `RevenueChart` | Rently | Add Hostly's drill-down feature |
| `OccupancyChart` | Hostly | Apply Rently styling |
| `ChannelBreakdown` | Rently | Keep as-is |
| `PropertyRankings` | Rently | Add sorting from Hostly |
| `ForecastPanel` | Rently | Keep as-is |
| `AlertsPanel` | Rently | Keep as-is |
| `ReservationsTable` | Hostly | Apply Rently styling |

### Dashboard File Structure

```
src/components/dashboard/
├── index.ts
├── Dashboard.tsx           # Main container
├── DashboardSkeleton.tsx   # Loading state
├── SummaryCards.tsx        # KPI cards
├── RevenueChart.tsx        # Revenue over time
├── OccupancyChart.tsx      # Occupancy heatmap
├── ChannelBreakdown.tsx    # Booking channels
├── PropertyRankings.tsx    # Property performance
├── ForecastPanel.tsx       # AI predictions
├── AlertsPanel.tsx         # Smart alerts
├── ReservationsTable.tsx   # Recent bookings
└── styles/
    └── dashboard.css       # All dashboard styles
```

---

## 4. CSS Isolation Strategy

### Problem

Rently CSS uses global class names (`.rently`, `.permanent-sidebar`, etc.) that could conflict with Hostly styles.

### Solution: CSS Layers + Scoping

```css
/* src/styles/layers.css */

/* Define layer order - first declared = lowest priority */
@layer reset, tokens, hostly, legacy-rently, utilities;

/* Hostly base styles */
@layer hostly {
  /* All Hostly styles */
}

/* Legacy Rently styles - scoped under .rently-site */
@layer legacy-rently {
  .rently-site {
    /* All Rently styles imported here */
    @import './legacy-sites/rently/styles/index.css';
  }
}
```

### Mounting Strategy

```tsx
// When rendering Rently site
<div className="rently-site">
  <RentlyLuxuryWrapper />
</div>

// When rendering Hostly pages
<div className="hostly-app">
  <HostlyComponent />
</div>
```

### Sidebar CSS Approach

The unified sidebar will use **new CSS** that:
1. Takes visual design from Rently's sidebar
2. Uses CSS variables for theming
3. Is namespaced under `.unified-sidebar`
4. Works in both Hostly and Rently contexts

---

## 5. Implementation Plan (5 PRs)

### PR 1: Unified Sidebar Component
**Files:**
```
src/components/unified-sidebar/
├── UnifiedSidebar.tsx
├── SidebarNav.tsx
├── SidebarHeader.tsx
├── SidebarFooter.tsx
├── SidebarControls.tsx (theme/lang)
├── hooks/
│   ├── useSidebarMode.ts
│   └── useSidebarNav.ts
├── types.ts
└── styles/
    └── unified-sidebar.css
```

**Tasks:**
- [ ] Create UnifiedSidebar component with mode prop
- [ ] Port Rently sidebar CSS to new namespace
- [ ] Add public/host mode navigation switching
- [ ] Add theme/language controls
- [ ] Add RTL support
- [ ] Add mobile responsive behavior
- [ ] Add collapse/expand with tooltips

### PR 2: Host Identity & Route System
**Files:**
```
src/lib/host/
├── identity.ts
├── legacy-sites.ts
└── types.ts

src/app/h/[hostSlug]/
├── page.tsx (updated)
├── layout.tsx (new - adds sidebar)
└── loading.tsx

src/app/portal/
├── layout.tsx (new - adds sidebar in host mode)
└── page.tsx (updated)
```

**Tasks:**
- [ ] Create host identity resolution
- [ ] Update /h/[hostSlug] route to use unified sidebar
- [ ] Add layout.tsx with sidebar for host pages
- [ ] Add layout.tsx with sidebar for portal pages
- [ ] Add mode detection (public vs host)

### PR 3: Dashboard Merge
**Files:**
```
src/components/dashboard/
├── Dashboard.tsx
├── [all components listed above]
└── styles/dashboard.css

src/app/portal/page.tsx (update to use merged dashboard)
```

**Tasks:**
- [ ] Copy Rently dashboard components to Hostly
- [ ] Apply Rently styling to Hostly components
- [ ] Add SWR caching layer
- [ ] Connect to Hostly API
- [ ] Add RTL support throughout
- [ ] Add responsive breakpoints

### PR 4: Marketplace Integration
**Files:**
```
src/app/page.tsx (Hostly marketplace)
src/app/listing/[slug]/page.tsx
src/components/listing/
├── ListingCard.tsx
├── ListingDetail.tsx
└── HostPreview.tsx (shows "View more by this host")
```

**Tasks:**
- [ ] Add "View more by this host" link to listings
- [ ] Create HostPreview component
- [ ] Ensure Rently listings appear in marketplace
- [ ] Style Rently listings with unified Hostly cards

### PR 5: Polish & Integration Testing
**Tasks:**
- [ ] End-to-end flow testing
- [ ] Mobile responsive testing
- [ ] RTL testing
- [ ] Performance optimization
- [ ] CSS cleanup and minification
- [ ] Documentation

---

## 6. File-Level Integration Map

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/unified-sidebar/UnifiedSidebar.tsx` | Main sidebar component |
| `src/components/unified-sidebar/styles/unified-sidebar.css` | Sidebar styles (from Rently) |
| `src/lib/host/identity.ts` | Host identity resolution |
| `src/lib/host/legacy-sites.ts` | Legacy site configuration |
| `src/app/h/[hostSlug]/layout.tsx` | Host page layout with sidebar |
| `src/app/portal/layout.tsx` | Portal layout with sidebar |
| `src/components/dashboard/Dashboard.tsx` | Merged dashboard |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/h/[hostSlug]/page.tsx` | Use unified sidebar |
| `src/app/portal/page.tsx` | Use merged dashboard |
| `src/legacy-sites/rently/EilatLuxuryResort.jsx` | Remove internal sidebar |
| `src/components/layout/Sidebar.tsx` | Deprecate (replaced by unified) |

### Files to Keep

| File | Reason |
|------|--------|
| `src/legacy-sites/rently/styles/*` | CSS still needed for Rently content |
| `src/legacy-sites/rently/components/*` | Components still used |

---

## 7. Testing Checklist

### Vacationer Flow
- [ ] Can access Hostly marketplace at `/`
- [ ] Can search for apartments
- [ ] Sees Rently listings in unified card format
- [ ] Can click listing to see detail
- [ ] Can click "View more by this host" → lands on `/h/rently`
- [ ] Sees Rently website with public sidebar
- [ ] Sidebar shows: Home, Apartments, Theme, Language
- [ ] Can change theme (white/cream/petra/dark)
- [ ] Can change language (EN/HE with RTL)
- [ ] Can book apartment via booking modal

### Host Flow (Rently Owner)
- [ ] Can log in at `/portal`
- [ ] Sees sidebar in host mode
- [ ] Sidebar shows: Dashboard, Website, Properties, etc.
- [ ] Dashboard shows analytics
- [ ] Can click "My Website" → opens `/h/rently` in host mode
- [ ] Sidebar still shows host mode controls
- [ ] Can edit website settings

### Mobile Testing
- [ ] Sidebar collapses to floating dock on mobile
- [ ] All touch targets are accessible
- [ ] Swipe gestures work
- [ ] Bottom safe area respected (iOS)

### RTL Testing
- [ ] Hebrew text displays correctly
- [ ] Sidebar flips to right side
- [ ] All animations flip direction
- [ ] Charts/graphs flip appropriately

---

## 8. Design Tokens (Unified)

```css
/* src/styles/tokens/unified.css */

:root {
  /* Brand - Velvet (from Rently) */
  --velvet: #b5846d;
  --velvet-light: #c9a08c;
  --velvet-dark: #9a6d58;

  /* Gold accent */
  --gold: #d4af37;
  --gold-light: #f4e4bc;

  /* Sidebar */
  --sidebar-width-expanded: 280px;
  --sidebar-width-collapsed: 72px;
  --sidebar-timing: cubic-bezier(0.4, 0, 0.2, 1);
  --sidebar-timing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --sidebar-duration: 350ms;
  --sidebar-duration-fast: 200ms;

  /* Typography */
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Montserrat', sans-serif;
  --font-hebrew-display: 'Frank Ruhl Libre', serif;
  --font-hebrew: 'Heebo', sans-serif;
}
```

---

## Summary

This plan delivers:
1. **One sidebar component** that adapts to context
2. **Complete route architecture** with public/host mode detection
3. **Merged dashboard** with best of both systems
4. **CSS isolation** preventing style conflicts
5. **5 incremental PRs** for safe deployment

The result is a **state-of-the-art platform** where:
- Vacationers browse unified marketplace → click host → see premium host page
- Hosts log in → see analytics dashboard → manage their website

All mobile-first, RTL-ready, and performance-optimized.
