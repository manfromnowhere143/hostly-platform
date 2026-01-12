// ═══════════════════════════════════════════════════════════════════════════════
// RENTLY - CONFIGURATION & DATA
// ═══════════════════════════════════════════════════════════════════════════════
// All translations, apartment data, URLs, and configuration constants
// ═══════════════════════════════════════════════════════════════════════════════

// ─── External URLs ───────────────────────────────────────────────────────────
export const URLS = {
  booking: "https://www.simplebooking.it/ibe2/hotel/10849?lang=EN&cur=ILS",
  whatsapp: "https://wa.me/972506111747",
  instagram: "https://www.instagram.com/rently.ys/",
  facebook: "https://www.facebook.com/Rentlyys",
  waze: "https://www.waze.com/live-map/directions?to=ll.29.548566%2C34.951952",
  heroVideo: "https://xkmvvdvft005bytr.public.blob.vercel-storage.com/1767634443013-IMG_4784.mov",
  aptVideo: "/hero2.mp4",
};

// ─── Hero Images ─────────────────────────────────────────────────────────────
export const HERO_IMAGES = [
  "https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634337893-l3jtei-PHOTO-2025-12-28-21-24-01_2.jpg",
  "https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634340731-dhswbh-PHOTO-2025-12-28-21-24-01.jpg",
  "https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634344088-g0m5se-PHOTO-2025-12-28-21-24-02_3.jpg",
  "https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634347821-cg18qq-PHOTO-2025-12-28-21-24-02.jpg",
  "https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634350602-genla6-PHOTO-2025-12-28-21-24-03_2.jpg",
  "https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634353534-yq59i0-PHOTO-2025-12-28-21-24-03_3.jpg",
  "https://xkmvvdvft005bytr.public.blob.vercel-storage.com/uploads/7348f31f-34f3-49aa-9470-f803364a159a/1767634356222-p71qye-PHOTO-2025-12-28-21-24-03_4.jpg"
];

// ─── Translations ────────────────────────────────────────────────────────────
export const TRANSLATIONS = {
  en: {
    nav: {
      resort: 'Resort',
      apartments: 'Apartments',
      amenities: 'Amenities',
      contact: 'Contact',
      reserve: 'Reserve Now'
    },
    hero: {
      eyebrow: 'EILAT · RED SEA · ISRAEL',
      subtitle: 'Welcome to Rently',
      line1: 'Luxury Apartments in a Prime Location.',
      line2: 'Just a minute\'s walk from the sea, offering elegant design',
      line3: 'and personalized service to ensure the perfect vacation.',
      cta: 'It\'s time to unwind and enjoy a getaway like no other.'
    },
    architecture: {
      title: 'ARCHITECTURAL',
      title2: 'MASTERPIECE',
      p1: 'A stunning glass-crowned atrium rises through the heart of our resort, creating a dramatic vertical garden that connects earth to sky.',
      p2: 'Modern minimalism meets warm hospitality in spaces designed for the discerning traveler.'
    },
    suites: {
      title: 'REFINED LIVING',
      subtitle: 'Each suite is a sanctuary of contemporary design with unobstructed views of the Red Sea.'
    },
    amenities: {
      title: 'RESORT',
      title2: 'AMENITIES',
      items: [
        { name: 'INFINITY POOL', desc: 'Temperature-controlled waters with panoramic Red Sea views' },
        { name: 'SPA & WELLNESS', desc: 'Full-service spa with desert stone treatments' },
        { name: 'PRIVATE BEACH', desc: 'Exclusive access to pristine coastline' },
        { name: 'FITNESS CENTER', desc: 'State-of-the-art equipment with mountain views' }
      ]
    },
    experience: {
      title: 'THE RENTLY',
      title2: 'EXPERIENCE',
      items: [
        { num: '01', name: 'DESERT MEETS SEA', desc: 'Where the Negev touches the Red Sea coral reefs' },
        { num: '02', name: 'CURATED SERVICE', desc: 'Personalized attention from our concierge team' },
        { num: '03', name: 'ARCHITECTURAL BEAUTY', desc: 'Award-winning design in natural harmony' }
      ]
    },
    contact: {
      title: 'PLAN YOUR',
      title2: 'ESCAPE',
      reservations: 'RESERVATIONS',
      email: 'EMAIL',
      location: 'LOCATION',
      navigate: 'NAVIGATE',
      openWaze: 'Open in Waze',
      reserveNow: 'Reserve Now'
    },
    apartments: {
      eyebrow: 'OUR COLLECTIONS',
      title: 'LUXURY',
      title2: 'RESIDENCES',
      subtitle: 'Discover our curated collection of luxury apartments in Eilat\'s most prestigious complexes.',
      seaside: 'Sea Side',
      eilat42: 'Eilat 42',
      seasideDesc: 'Premium beachfront residences with stunning sea views',
      eilat42Desc: 'Modern luxury apartments with pool access',
      unit: 'Unit',
      bedrooms: 'Bedrooms',
      bathrooms: 'Baths',
      area: 'Area',
      floor: 'Floor',
      explore: 'Explore',
      reserve: 'Reserve Now',
      request: 'WhatsApp',
      night: '/night',
      off: 'OFF',
      from: 'From',
      features: 'Features',
      comingSoon: 'Photos Coming Soon'
    },
    footer: {
      rights: '© 2026 Rently Luxury Resort. All rights reserved.'
    }
  },
  he: {
    nav: {
      resort: 'הנופש',
      apartments: 'דירות',
      amenities: 'מתקנים',
      contact: 'צור קשר',
      reserve: 'הזמן עכשיו'
    },
    hero: {
      eyebrow: 'אילת · ים סוף · ישראל',
      subtitle: 'ברוכים הבאים לרנטלי',
      line1: 'דירות יוקרה במיקום מושלם.',
      line2: 'דקת הליכה מהים, עיצוב אלגנטי',
      line3: 'ושירות אישי שיבטיחו את החופשה המושלמת.',
      cta: 'הגיע הזמן להירגע וליהנות מחופשה שאין שנייה לה.'
    },
    architecture: {
      title: 'יצירת מופת',
      title2: 'אדריכלית',
      p1: 'אטריום זכוכית מרהיב מתרומם בלב הנופש שלנו, יוצר גן אנכי דרמטי שמחבר בין אדמה לשמיים.',
      p2: 'מינימליזם מודרני פוגש אירוח חם בחללים שתוכננו לנוסע המבין.'
    },
    suites: {
      title: 'מגורי פאר',
      subtitle: 'כל סוויטה היא מקדש של עיצוב עכשווי עם נופים פתוחים לים סוף.'
    },
    amenities: {
      title: 'מתקני',
      title2: 'הנופש',
      items: [
        { name: 'בריכת אינסוף', desc: 'מים מחוממים עם נופים פנורמיים לים סוף' },
        { name: 'ספא ובריאות', desc: 'ספא מלא עם טיפולי אבני מדבר' },
        { name: 'חוף פרטי', desc: 'גישה בלעדית לקו החוף הבתולי' },
        { name: 'חדר כושר', desc: 'ציוד מתקדם עם נופים להרים' }
      ]
    },
    experience: {
      title: 'חוויית',
      title2: 'רנטלי',
      items: [
        { num: '01', name: 'מדבר פוגש ים', desc: 'שם מדבר הנגב נוגע בשוניות האלמוגים' },
        { num: '02', name: 'שירות אצור', desc: 'תשומת לב אישית מצוות הקונסיירז\'' },
        { num: '03', name: 'יופי אדריכלי', desc: 'עיצוב עטור פרסים בהרמוניה טבעית' }
      ]
    },
    contact: {
      title: 'תכננו את',
      title2: 'הבריחה שלכם',
      reservations: 'הזמנות',
      email: 'אימייל',
      location: 'מיקום',
      navigate: 'ניווט',
      openWaze: 'פתח בוייז',
      reserveNow: 'הזמן עכשיו'
    },
    apartments: {
      eyebrow: 'הקולקציות שלנו',
      title: 'דירות',
      title2: 'יוקרה',
      subtitle: 'גלו את קולקציית דירות היוקרה שלנו במתחמים היוקרתיים ביותר באילת.',
      seaside: 'סי סייד',
      eilat42: 'אילת 42',
      seasideDesc: 'דירות פרימיום על קו החוף עם נוף מדהים לים',
      eilat42Desc: 'דירות יוקרה מודרניות עם גישה לבריכה',
      unit: 'דירה',
      bedrooms: 'חדרים',
      bathrooms: 'אמבט',
      area: 'שטח',
      floor: 'קומה',
      explore: 'גלה',
      reserve: 'הזמן עכשיו',
      request: 'וואטסאפ',
      night: '/לילה',
      off: 'הנחה',
      from: 'החל מ',
      features: 'תכונות',
      comingSoon: 'תמונות בקרוב'
    },
    footer: {
      rights: '© 2026 רנטלי נופש יוקרה. כל הזכויות שמורות.'
    }
  }
};

// ─── Apartment Image Helper ──────────────────────────────────────────────────
const getAptImages = (project, folder, count = 4) => {
  const maxImages = Math.min(count, 8);
  return Array.from({ length: maxImages }, (_, i) => `/apartments/${project}/${folder}/${i + 1}.jpg`);
};

// ─── Sea Side Apartments ─────────────────────────────────────────────────────
const seasideBaseApartments = [
  { id: 's3', unit: '3', name: { en: "Mykonos", he: "מיקונוס" }, folder: 'mykonos' },
  { id: 's22', unit: '22', name: { en: "Poppy", he: "פופי" }, folder: 'poppy' },
  { id: 's29', unit: '29', name: { en: "Lily", he: "לילי" }, folder: 'lily' },
  { id: 's33', unit: '33', name: { en: "Camellia", he: "קמיליה" }, folder: '33-camellia' },
  { id: 's49', unit: '49', name: { en: "Ivy", he: "אייבי" }, folder: 'ivy' },
  { id: 's62', unit: '62', name: { en: "Zinnia", he: "זיניה" }, folder: 'zinnia' },
  { id: 's63', unit: '63', name: { en: "Daisy", he: "דייזי" }, folder: 'daisy' },
  { id: 's78', unit: '78', name: { en: "Clover", he: "תלתן" }, folder: '78-clover' },
  { id: 's79', unit: '79', name: { en: "Tranquil", he: "טרנקיל" }, folder: 'tranquil' },
  { id: 's80', unit: '80', name: { en: "Rose", he: "רוז" }, folder: 'rose' },
  { id: 's81', unit: '81', name: { en: "Rosy", he: "רוזי" }, folder: 'rosy' },
  { id: 's86', unit: '86', name: { en: "Flora", he: "פלורה" }, folder: 'flora' },
  { id: 's95', unit: '95', name: { en: "Zinnia II", he: "זיניה" }, folder: 'zinnia2' },
  { id: 's111', unit: '111', name: { en: "Jasmine", he: "יסמין" }, folder: 'jasmine' },
  { id: 's129', unit: '129', name: { en: "Marigold", he: "מרי גולד" }, folder: 'marigold' },
  { id: 's140', unit: '140', name: { en: "Laura", he: "לורה" }, folder: 'laura' },
  { id: 's151', unit: '151', name: { en: "Tulip", he: "טוליפ" }, folder: 'tulip' },
  { id: 's159', unit: '159', name: { en: "Lavender", he: "לבנדר" }, folder: 'lavender' },
  { id: 's167', unit: '167', name: { en: "Lotus", he: "לוטוס" }, folder: 'lotus' },
  { id: 's168', unit: '168', name: { en: "Sunflower", he: "חמניה" }, folder: 'sunflower' },
  { id: 's172', unit: '172', name: { en: "Dahlia", he: "דליה" }, folder: 'dahlia' },
  { id: 's197', unit: '197', name: { en: "Violet", he: "ויאולט" }, folder: 'violet' },
  { id: 's199', unit: '199', name: { en: "Orchid", he: "אורכיד" }, folder: 'orchid' },
  { id: 's205', unit: '205', name: { en: "Lagoon", he: "לגון" }, folder: 'lagoon' }
];

// ─── Eilat 42 Apartments ─────────────────────────────────────────────────────
const eilat42BaseApartments = [
  { id: 'e10', unit: '10', building: '1', name: { en: "Mango", he: "מנגו" }, folder: '10-mango' },
  { id: 'e13', unit: '13', building: '5', name: { en: "Strawberry", he: "תות" }, folder: '13-strawberry' },
  { id: 'e15', unit: '15', building: '7', name: { en: "Peach", he: "אפרסק" }, folder: '15-peach' },
  { id: 'e21', unit: '21', building: '5', name: { en: "Blueberry", he: "אוכמניה" }, folder: '21-blueberry' }
];

// ─── Generate Full Apartment Data ────────────────────────────────────────────
// Use seeded random for consistent data across renders
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const SEASIDE_APARTMENTS = seasideBaseApartments.map((apt, idx) => ({
  ...apt,
  images: getAptImages('seaside', apt.folder, 8),
  project: 'seaside',
  subtitle: { en: "SEA SIDE RESIDENCE", he: "דירת סי סייד" },
  description: {
    en: "Luxurious beachfront apartment in the prestigious Sea Side complex with stunning Red Sea views.",
    he: "דירת נופש יוקרתית במתחם סי סייד היוקרתי עם נוף מרהיב לים סוף."
  },
  specs: {
    beds: Math.floor(seededRandom(idx * 7) * 2) + 1,
    baths: 1,
    sqm: Math.floor(seededRandom(idx * 13) * 40) + 45
  },
  price: `₪${(Math.floor(seededRandom(idx * 17) * 800) + 1400).toLocaleString()}`,
  amenities: {
    en: ["Sea View", "Beach Access", "Pool", "Parking"],
    he: ["נוף לים", "גישה לחוף", "בריכה", "חניה"]
  }
}));

export const EILAT42_APARTMENTS = eilat42BaseApartments.map((apt, idx) => ({
  ...apt,
  images: getAptImages('eilat42', apt.folder, 8),
  project: 'eilat42',
  subtitle: {
    en: `EILAT 42 · BUILDING ${apt.building}`,
    he: `אילת 42 · בניין ${apt.building}`
  },
  description: {
    en: "Modern luxury apartment in the Eilat 42 complex with pool view and premium amenities.",
    he: "דירת יוקרה מודרנית במתחם אילת 42 עם נוף לבריכה ומתקנים פרימיום."
  },
  specs: { beds: 1, baths: 1, sqm: 53 },
  price: `₪${(Math.floor(seededRandom(idx * 23) * 400) + 1600).toLocaleString()}`,
  amenities: {
    en: ["Pool View", "Modern Design", "Balcony", "Parking"],
    he: ["נוף לבריכה", "עיצוב מודרני", "מרפסת", "חניה"]
  }
}));

// ─── Performance Configuration ───────────────────────────────────────────────
export const PERFORMANCE_CONFIG = {
  // Video autoplay retry settings
  video: {
    retryDelay: 300,           // ms before retry
    safetyTimeout: 1500,       // ms before forcing fade-in
    intersectionThreshold: 0.1 // When to start loading video
  },
  // Animation settings
  animation: {
    loadingDuration: 2000,     // Loading screen duration
    transitionDuration: 350,   // Page transition duration
    revealThreshold: 0.1       // Intersection threshold for reveals
  },
  // Image loading settings
  images: {
    preloadCount: 6,           // Number of apartment images to preload
    lazyLoadThreshold: '200px' // Rootmargin for lazy loading
  }
};

export default {
  URLS,
  HERO_IMAGES,
  TRANSLATIONS,
  SEASIDE_APARTMENTS,
  EILAT42_APARTMENTS,
  PERFORMANCE_CONFIG
};