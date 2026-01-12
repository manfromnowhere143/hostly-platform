// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGE CONTEXT - Bilingual Support (EN/HE)
// ═══════════════════════════════════════════════════════════════════════════════
// State-of-the-art language switching with RTL support
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Language = 'en' | 'he'

export interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  isRTL: boolean
  t: (key: string) => string
}

// ─── Translations ──────────────────────────────────────────────────────────────

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.explore': 'Explore',
    'header.hosts': 'Hosts',
    'header.signIn': 'Sign In',
    'header.listProperty': 'List Property',
    'header.search': 'Search destinations, properties...',
    'header.dashboard': 'Dashboard',
    'header.myBookings': 'My Bookings',
    'header.settings': 'Settings',
    'header.signOut': 'Sign Out',

    // Marketplace
    'marketplace.where': 'Where',
    'marketplace.searchDest': 'Search destinations',
    'marketplace.checkIn': 'Check in',
    'marketplace.checkOut': 'Check out',
    'marketplace.addDates': 'Add dates',
    'marketplace.who': 'Who',
    'marketplace.addGuests': 'Add guests',
    'marketplace.search': 'Search',
    'marketplace.filters': 'Filters',
    'marketplace.showing': 'Showing',
    'marketplace.of': 'of',
    'marketplace.properties': 'properties',
    'marketplace.night': 'night',
    'marketplace.reviews': 'reviews',
    'marketplace.superhost': 'Superhost',
    'marketplace.reserve': 'Reserve',
    'marketplace.bedrooms': 'Bedrooms',
    'marketplace.bathrooms': 'Bathrooms',
    'marketplace.guests': 'Guests',
    'marketplace.whatOffers': 'What this place offers',
    'marketplace.featuredHost': 'Featured Host',
    'marketplace.exploreHost': 'Explore Rently',
    'marketplace.avgRating': 'Avg Rating',
    'marketplace.becomeHost': 'Become a Host',
    'marketplace.becomeHostDesc': 'Join our community of hosts and start earning by sharing your unique space with travelers.',
    'marketplace.getStarted': 'Get Started',
    'marketplace.hostDescription': 'Experience the finest vacation rentals in Eilat. Our curated collection offers unparalleled comfort, stunning views, and prime locations.',

    // Categories
    'category.beach': 'Beach',
    'category.mountains': 'Mountains',
    'category.city': 'City',
    'category.countryside': 'Countryside',
    'category.lakefront': 'Lakefront',
    'category.luxury': 'Luxury',
    'category.unique': 'Unique',
    'category.desert': 'Desert',

    // Booking
    'booking.bookNow': 'Book Now',
    'booking.dates': 'Dates',
    'booking.apartment': 'Apartment',
    'booking.guests': 'Guests',
    'booking.details': 'Details',
    'booking.payment': 'Payment',
    'booking.total': 'Total',
    'booking.perNight': 'per night',
    'booking.nights': 'nights',
    'booking.serviceFee': 'Service fee',
    'booking.taxes': 'Taxes',
    'booking.continue': 'Continue',
    'booking.back': 'Back',
    'booking.confirm': 'Confirm Booking',

    // Footer
    'footer.rights': 'All rights reserved.',
    'footer.support': 'Support',
    'footer.hosting': 'Hosting',
    'footer.community': 'Community',
    'footer.about': 'About',
  },
  he: {
    // Header
    'header.explore': 'גלה',
    'header.hosts': 'מארחים',
    'header.signIn': 'התחבר',
    'header.listProperty': 'הוסף נכס',
    'header.search': 'חפש יעדים, נכסים...',
    'header.dashboard': 'לוח בקרה',
    'header.myBookings': 'ההזמנות שלי',
    'header.settings': 'הגדרות',
    'header.signOut': 'התנתק',

    // Marketplace
    'marketplace.where': 'לאן',
    'marketplace.searchDest': 'חפש יעדים',
    'marketplace.checkIn': 'צ\'ק אין',
    'marketplace.checkOut': 'צ\'ק אאוט',
    'marketplace.addDates': 'הוסף תאריכים',
    'marketplace.who': 'מי',
    'marketplace.addGuests': 'הוסף אורחים',
    'marketplace.search': 'חפש',
    'marketplace.filters': 'סינון',
    'marketplace.showing': 'מציג',
    'marketplace.of': 'מתוך',
    'marketplace.properties': 'נכסים',
    'marketplace.night': 'לילה',
    'marketplace.reviews': 'ביקורות',
    'marketplace.superhost': 'סופרהוסט',
    'marketplace.reserve': 'הזמן',
    'marketplace.bedrooms': 'חדרי שינה',
    'marketplace.bathrooms': 'חדרי אמבט',
    'marketplace.guests': 'אורחים',
    'marketplace.whatOffers': 'מה המקום מציע',
    'marketplace.featuredHost': 'מארח מומלץ',
    'marketplace.exploreHost': 'גלה את רנטלי',
    'marketplace.avgRating': 'דירוג ממוצע',
    'marketplace.becomeHost': 'הפוך למארח',
    'marketplace.becomeHostDesc': 'הצטרף לקהילת המארחים שלנו והתחל להרוויח על ידי שיתוף המקום המיוחד שלך עם מטיילים.',
    'marketplace.getStarted': 'בוא נתחיל',
    'marketplace.hostDescription': 'חווה את דירות הנופש המשובחות ביותר באילת. הקולקציה שלנו מציעה נוחות יוצאת דופן, נופים מדהימים ומיקומים מעולים.',

    // Categories
    'category.beach': 'חוף',
    'category.mountains': 'הרים',
    'category.city': 'עיר',
    'category.countryside': 'כפר',
    'category.lakefront': 'אגם',
    'category.luxury': 'יוקרה',
    'category.unique': 'מיוחד',
    'category.desert': 'מדבר',

    // Booking
    'booking.bookNow': 'הזמן עכשיו',
    'booking.dates': 'תאריכים',
    'booking.apartment': 'דירה',
    'booking.guests': 'אורחים',
    'booking.details': 'פרטים',
    'booking.payment': 'תשלום',
    'booking.total': 'סה"כ',
    'booking.perNight': 'ללילה',
    'booking.nights': 'לילות',
    'booking.serviceFee': 'דמי שירות',
    'booking.taxes': 'מיסים',
    'booking.continue': 'המשך',
    'booking.back': 'חזור',
    'booking.confirm': 'אשר הזמנה',

    // Footer
    'footer.rights': 'כל הזכויות שמורות.',
    'footer.support': 'תמיכה',
    'footer.hosting': 'אירוח',
    'footer.community': 'קהילה',
    'footer.about': 'אודות',
  },
}

// ─── Context ───────────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextValue | null>(null)

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // Return default for SSR
    return {
      lang: 'en' as Language,
      setLang: () => {},
      isRTL: false,
      t: (key: string) => translations.en[key] || key,
    }
  }
  return ctx
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  // Load saved language
  useEffect(() => {
    const saved = localStorage.getItem('hostly-lang') as Language | null
    if (saved && (saved === 'en' || saved === 'he')) {
      setLangState(saved)
    }
  }, [])

  // Update document direction
  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('hostly-lang', newLang)
  }, [])

  const t = useCallback((key: string) => {
    return translations[lang][key] || translations.en[key] || key
  }, [lang])

  const value: LanguageContextValue = {
    lang,
    setLang,
    isRTL: lang === 'he',
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageContext
