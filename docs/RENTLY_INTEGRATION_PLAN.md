# Rently-Luxury Integration Plan

## Rently-Luxury DNA Inventory

### 1. Main Page Structure (Section Order)

The original `EilatLuxuryResort.jsx` (V12) has a sophisticated single-page structure with two main "pages" (resort vs apartments) that transition smoothly:

**Resort Page Sections:**
1. **Loading Overlay** - Animated brand reveal with RENTLY letters, architectural lines, progress bar
2. **Hero** - Full-screen video with parallax, animated text reveal, booking CTA
3. **Architecture Section** - Split layout with image gallery + text
4. **Suites Section** - Video background with suite preview
5. **Amenities Section** - Grid of amenity cards with icons
6. **Experience Section** - Numbered list with descriptions
7. **Contact Section** - Contact info grid with Waze integration
8. **Footer** - Social links, copyright

**Apartments Page Sections:**
1. **Hero** - Apartment video with overlay text
2. **Project Tabs** - Sea Side vs Eilat 42 toggle
3. **Apartment Grid** - Cards with FLIP animation on click
4. **Apartment Modal** - Full gallery with booking integration

### 2. Styling/Tokens Architecture

**CSS Architecture (10-layer system):**
```
1. TOKENS       - Design variables (colors, typography, spacing, shadows, animations)
2. BASE         - Fonts, reset, global styles
3. THEMES       - Color schemes (white, cream, petra, dark)
4. ANIMATIONS   - Keyframes, transitions, scroll-reveal
5. LAYOUT       - App structure, header, sidebar
6. COMPONENTS   - UI components (loading, hero, cards, modal, etc.)
7. PAGES        - Page-specific styles
8. UTILITIES    - GPU, accessibility, cursor
9. RTL          - Hebrew language support
10. RESPONSIVE  - Mobile overrides (MUST be last)
```

**Key Design Tokens:**
- Primary Brand (Velvet): `#b5846d`
- Velvet Light: `#c9a08c`
- Velvet Dark: `#9a6d58`
- Gold Accent: `#d4af37`
- Gold Light: `#f4e4bc`

**Theme Support:**
- White (default)
- Cream
- Petra (stone-inspired)
- Dark

### 3. Core Components

| Component | File | Purpose |
|-----------|------|---------|
| `EilatLuxuryResort` | `EilatLuxuryResort.jsx` | Main page (1500+ lines) |
| `BookingModal` | `components/booking/BookingModal.jsx` | 5-step booking flow |
| `DatePicker` | `components/booking/DatePicker.jsx` | Calendar with availability |
| `PropertySelector` | `components/booking/PropertySelector.jsx` | Apartment selection |
| `GuestSelector` | `components/booking/GuestSelector.jsx` | Guest count |
| `PricingBreakdown` | `components/booking/PricingBreakdown.jsx` | Price details |
| `GuestForm` | `components/booking/GuestForm.jsx` | Guest information |
| `PaymentForm` | `components/booking/PaymentForm.jsx` | Stripe integration |
| `BookingConfirmation` | `components/booking/BookingConfirmation.jsx` | Success state |
| `SmartInsights` | `components/pricing/SmartInsights.jsx` | Price intelligence |
| `FlexibleDates` | `components/pricing/FlexibleDates.jsx` | Alternative dates |
| `BookingContext` | `context/BookingContext.jsx` | State management |

### 4. Data Dependencies

**External APIs:**
- Hostly/Boom API for availability checking
- Stripe for payments
- Vercel Blob for media storage

**Configuration (rently.config.js):**
- `URLS` - External links (WhatsApp, Instagram, Waze, video URLs)
- `HERO_IMAGES` - 7 hero carousel images
- `TRANSLATIONS` - Full EN/HE translation object
- `SEASIDE_APARTMENTS` - 24 apartments with images, specs, pricing
- `EILAT42_APARTMENTS` - 4 apartments
- `PERFORMANCE_CONFIG` - Video, animation, image settings

**Apartment Data Shape:**
```javascript
{
  id: 's3',              // Unique ID
  unit: '3',             // Unit number
  name: { en, he },      // Bilingual name
  folder: 'mykonos',     // Image folder
  images: [...],         // Array of image URLs
  project: 'seaside',    // Project identifier
  subtitle: { en, he },  // Bilingual subtitle
  description: { en, he },
  specs: { beds, baths, sqm },
  price: '₪1,400',
  amenities: { en, he }
}
```

### 5. Assets Needed

**Video Assets:**
- Hero video: `https://xkmvvdvft005bytr.public.blob.vercel-storage.com/1767634443013-IMG_4784.mov`
- Apartment video: `/hero2.mp4`

**Image Assets:**
- 7 hero carousel images (Vercel Blob)
- Apartment images: `/apartments/{project}/{folder}/{1-8}.jpg`
- ~28 apartment folders with 4-8 images each

---

## Integration Plan

### Architecture Decision: Exact Integration (NOT Recreation)

The original Rently-Luxury website will be embedded **exactly as-is** into Hostly. No component recreation - the actual components, styles, and logic will be imported.

### Route Structure

```
Hostly Platform Routes:
├── /                           → Hostly marketplace (unified cards)
├── /search                     → Search results (Hostly cards)
├── /listing/{slug}             → Individual listing detail (Hostly)
├── /h/{hostSlug}               → Host page (embedded original site)
│   └── /h/rently               → EXACT Rently-Luxury website
│   └── /h/other-host           → Other host's spec-generated page
└── /portal/...                 → Host management portal
```

### Implementation Strategy

**Phase 1: Symlink/Copy Rently into Hostly**
```
hostly-platform/
├── src/
│   ├── legacy-sites/
│   │   └── rently/           ← Copied from rently-luxury/src
│   │       ├── EilatLuxuryResort.jsx
│   │       ├── rently.config.js
│   │       ├── context/
│   │       ├── components/
│   │       ├── services/
│   │       ├── hooks/
│   │       └── styles/
```

**Phase 2: Create Host Page Router**
```typescript
// src/app/h/[hostSlug]/page.tsx

export default async function HostPage({ params }) {
  const { hostSlug } = params;

  // Check if this is a legacy/exact site (Rently)
  if (hostSlug === 'rently') {
    return <RentlyLuxuryWrapper />;
  }

  // Otherwise, load spec and render with HostPageRenderer
  const spec = await loadHostSpec(hostSlug);
  return <HostPageRenderer spec={spec} />;
}
```

**Phase 3: Rently Wrapper Component**
```typescript
// src/app/h/rently/RentlyLuxuryWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import '@/legacy-sites/rently/styles/index.css';

// Dynamic import to avoid SSR issues
const EilatLuxuryResort = dynamic(
  () => import('@/legacy-sites/rently/EilatLuxuryResort'),
  { ssr: false }
);

const BookingModal = dynamic(
  () => import('@/legacy-sites/rently/components/booking/BookingModal'),
  { ssr: false }
);

export default function RentlyLuxuryWrapper() {
  return (
    <BookingProvider>
      <EilatLuxuryResort />
      <BookingModal />
    </BookingProvider>
  );
}
```

**Phase 4: Data Bridge**

The Rently site already has Hostly API integration via `BookingContext`:
- Uses `bookingAPI` service for availability/quotes
- Transforms apartment data to Hostly property format
- Uses `apartmentToProperty()` function for ID mapping

**Property ID Mapping:**
```javascript
// Original Rently ID → Hostly Property ID
's3' → 'prop_s3'     // Sea Side Mykonos
'e10' → 'prop_e10'   // Eilat 42 Mango

// Original Rently Slug → Hostly Slug
'mykonos' → 'seaside-mykonos'
'mango' → 'eilat42-mango'
```

### CSS Isolation

To prevent Rently styles from leaking into Hostly:

1. **Scope all Rently CSS under `.rently` container** (already done)
2. **Use CSS Layers for priority:**
```css
@layer hostly, rently;

@layer rently {
  /* All Rently styles */
}
```

3. **Next.js CSS Module approach** for legacy sites

### Testing Instructions

1. **Start Hostly dev server:**
```bash
cd hostly-platform
npm run dev
```

2. **Navigate to Rently host page:**
```
http://localhost:3000/h/rently
```

3. **Verify exact functionality:**
- [ ] Loading animation plays with RENTLY brand reveal
- [ ] Hero video autoplays and fades in smoothly
- [ ] Language toggle (EN/HE) works with RTL support
- [ ] Theme toggle (white/cream/petra/dark) works
- [ ] Page transitions (Resort ↔ Apartments) animate correctly
- [ ] Apartment cards have FLIP animation on click
- [ ] Apartment modal shows gallery with keyboard navigation
- [ ] Booking modal opens with correct flow (5 steps)
- [ ] Calendar shows availability from API
- [ ] Smart Insights panel shows price intelligence
- [ ] Mobile responsive with luxury dock navigation
- [ ] Sidebar collapses/expands correctly

4. **Verify Hostly marketplace still works:**
```
http://localhost:3000
```
- [ ] Unified cards display correctly
- [ ] Search functionality works
- [ ] "View more by this host" links to `/h/rently`

### File Mapping Reference

| Rently Source | Hostly Destination |
|--------------|-------------------|
| `rently-luxury/src/EilatLuxuryResort.jsx` | `hostly-platform/src/legacy-sites/rently/EilatLuxuryResort.jsx` |
| `rently-luxury/src/rently.config.js` | `hostly-platform/src/legacy-sites/rently/rently.config.js` |
| `rently-luxury/src/context/` | `hostly-platform/src/legacy-sites/rently/context/` |
| `rently-luxury/src/components/` | `hostly-platform/src/legacy-sites/rently/components/` |
| `rently-luxury/src/services/` | `hostly-platform/src/legacy-sites/rently/services/` |
| `rently-luxury/src/hooks/` | `hostly-platform/src/legacy-sites/rently/hooks/` |
| `rently-luxury/src/styles/` | `hostly-platform/src/legacy-sites/rently/styles/` |
| `rently-luxury/public/apartments/` | `hostly-platform/public/apartments/` |

### Key Guarantees

1. **Exactness**: The Rently site will render pixel-perfect as it does standalone
2. **Isolation**: Rently CSS/JS won't affect other Hostly pages
3. **Performance**: Same loading animation, video autoplay, GPU optimizations
4. **Functionality**: All features work - themes, languages, booking flow, modals
5. **Data**: Connected to same Hostly/Boom APIs for real availability

---

## Next Steps

1. [ ] Copy Rently source files to `hostly-platform/src/legacy-sites/rently/`
2. [ ] Copy public assets to `hostly-platform/public/`
3. [ ] Create `RentlyLuxuryWrapper` component
4. [ ] Update `/h/rently` route to use wrapper
5. [ ] Add CSS layer isolation
6. [ ] Test all functionality
7. [ ] Add "View more by this host" links in marketplace cards
