// ═══════════════════════════════════════════════════════════════════════════════
// RENTLY BOOKING SERVICE - Production Ready
// ═══════════════════════════════════════════════════════════════════════════════
// Works in two modes:
// 1. HOSTLY MODE: Connects to Hostly platform API (when API_URL is set)
// 2. STANDALONE MODE: Works independently with direct pricing/availability
// ═══════════════════════════════════════════════════════════════════════════════

// Support both Vite (import.meta.env) and Next.js (process.env) environments
const getEnvVar = (viteKey, nextKey, defaultValue = '') => {
  // Next.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[nextKey] || defaultValue;
  }
  // Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[viteKey] || defaultValue;
  }
  return defaultValue;
};

const API_BASE = getEnvVar('VITE_HOSTLY_API_URL', 'NEXT_PUBLIC_HOSTLY_API_URL', '');
const ORG_SLUG = getEnvVar('VITE_HOSTLY_ORG_SLUG', 'NEXT_PUBLIC_HOSTLY_ORG_SLUG', 'rently');
const STANDALONE_MODE = !API_BASE || API_BASE === 'standalone';

// Debug logging for configuration
console.log('[BookingService] Configuration:', {
  API_BASE,
  ORG_SLUG,
  STANDALONE_MODE,
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING CONFIGURATION - Rently Specific
// ═══════════════════════════════════════════════════════════════════════════════
const PRICING_CONFIG = {
  // Base nightly rates in ILS (cents)
  seaside: {
    baseRate: 85000, // ₪850/night
    weekendRate: 110000, // ₪1,100/night (Fri-Sat)
    holidayRate: 130000, // ₪1,300/night
    minNights: 2,
  },
  eilat42: {
    baseRate: 75000, // ₪750/night
    weekendRate: 95000, // ₪950/night
    holidayRate: 115000, // ₪1,150/night
    minNights: 2,
  },
  // Additional fees
  cleaningFee: 25000, // ₪250
  serviceFee: 0.12, // 12%
  // Discounts
  weeklyDiscount: 0.10, // 10% off for 7+ nights
  monthlyDiscount: 0.20, // 20% off for 28+ nights
};

// Israeli holidays for 2025-2026
const HOLIDAYS = [
  '2025-03-13', '2025-03-14', // Purim
  '2025-04-12', '2025-04-13', '2025-04-18', '2025-04-19', // Passover
  '2025-05-01', '2025-05-02', // Independence Day
  '2025-06-01', '2025-06-02', // Shavuot
  '2025-09-22', '2025-09-23', '2025-09-24', // Rosh Hashanah
  '2025-10-01', '2025-10-02', // Yom Kippur
  '2025-10-06', '2025-10-07', '2025-10-13', '2025-10-14', // Sukkot
  '2025-12-25', '2025-12-26', // Hanukkah
];

// ─── Date Helpers ─────────────────────────────────────────────────────────────
const isWeekend = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  return day === 5 || day === 6; // Friday or Saturday
};

const isHoliday = (date) => {
  const dateStr = formatDate(date);
  return HOLIDAYS.includes(dateStr);
};

// ═══════════════════════════════════════════════════════════════════════════════
// STANDALONE PRICING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

function calculatePricing(property, checkIn, checkOut, adults, children, promoCode) {
  const project = property?.project || 'seaside';
  const config = PRICING_CONFIG[project] || PRICING_CONFIG.seaside;

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  if (nights < config.minNights) {
    throw new Error(`Minimum ${config.minNights} nights required`);
  }

  // Calculate nightly breakdown
  const nightlyRates = [];
  let totalAccommodation = 0;

  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    let rate = config.baseRate;
    let rateType = 'standard';

    if (isHoliday(currentDate)) {
      rate = config.holidayRate;
      rateType = 'holiday';
    } else if (isWeekend(currentDate)) {
      rate = config.weekendRate;
      rateType = 'weekend';
    }

    nightlyRates.push({
      date: formatDate(currentDate),
      rate,
      rateType,
    });

    totalAccommodation += rate;
  }

  // Calculate discounts
  let discount = 0;
  let discountType = null;

  if (nights >= 28) {
    discount = totalAccommodation * PRICING_CONFIG.monthlyDiscount;
    discountType = 'monthly';
  } else if (nights >= 7) {
    discount = totalAccommodation * PRICING_CONFIG.weeklyDiscount;
    discountType = 'weekly';
  }

  // Promo code discount
  let promoDiscount = 0;
  if (promoCode) {
    const code = promoCode.toUpperCase();
    if (code === 'WELCOME10') {
      promoDiscount = totalAccommodation * 0.10;
    } else if (code === 'SUMMER15') {
      promoDiscount = totalAccommodation * 0.15;
    } else if (code === 'VIP20') {
      promoDiscount = totalAccommodation * 0.20;
    }
  }

  const subtotal = totalAccommodation - discount - promoDiscount;
  const cleaningFee = PRICING_CONFIG.cleaningFee;
  const serviceFee = Math.round(subtotal * PRICING_CONFIG.serviceFee);
  const grandTotal = subtotal + cleaningFee + serviceFee;

  // Calculate taxes (17% VAT)
  const taxes = Math.round(grandTotal * 0.17);
  const grandTotalWithTax = grandTotal + taxes;

  // Build discounts array to match API format
  const discounts = [];
  if (discount > 0) {
    discounts.push({
      type: discountType,
      description: discountType === 'monthly' ? 'Monthly stay discount (20%)' : 'Weekly stay discount (10%)',
      amount: discount,
    });
  }
  if (promoDiscount > 0) {
    discounts.push({
      type: 'promo',
      description: `Promo code: ${promoCode}`,
      amount: promoDiscount,
    });
  }

  return {
    nights,
    nightlyRates: nightlyRates.map(r => ({
      date: r.date,
      price: r.rate,
      reason: r.rateType,
    })),
    pricing: {
      accommodationTotal: totalAccommodation,
      averageNightlyRate: Math.round(totalAccommodation / nights),
      cleaningFee,
      serviceFee,
      taxes,
      discounts,
      discountTotal: discount + promoDiscount,
      grandTotal: grandTotalWithTax,
      currency: 'ILS',
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STANDALONE AVAILABILITY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

function generateCalendar(property, days = 90) {
  const calendar = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const project = property?.project || 'seaside';
  const config = PRICING_CONFIG[project] || PRICING_CONFIG.seaside;

  // In standalone mode, all dates are available
  // Real availability comes from Boom PMS when connected to Hostly
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = formatDate(date);

    let price = config.baseRate;
    if (isHoliday(date)) {
      price = config.holidayRate;
    } else if (isWeekend(date)) {
      price = config.weekendRate;
    }

    calendar.push({
      date: dateStr,
      available: true,
      price,
      minNights: config.minNights,
    });
  }

  return calendar;
}

function checkDateAvailability(property, checkIn, checkOut) {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if dates are in the past
  if (startDate < today) {
    return { available: false, reason: 'Check-in date is in the past' };
  }

  // Check minimum nights
  const project = property?.project || 'seaside';
  const config = PRICING_CONFIG[project] || PRICING_CONFIG.seaside;

  if (nights < config.minNights) {
    return { available: false, reason: `Minimum stay is ${config.minNights} nights` };
  }

  // For standalone mode, most dates are available
  // In production, this would check against Boom calendar
  return {
    available: true,
    nights,
    minNights: config.minNights,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API REQUEST HELPER (for Hostly mode)
// ═══════════════════════════════════════════════════════════════════════════════

const request = async (endpoint, options = {}) => {
  if (STANDALONE_MODE) {
    throw new Error('API not available in standalone mode');
  }

  const url = `${API_BASE}/api/public/${ORG_SLUG}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!data.success) {
    const error = new Error(data.error?.message || 'Request failed');
    error.code = data.error?.code;
    throw error;
  }

  return data.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING API - Works in both modes
// ═══════════════════════════════════════════════════════════════════════════════

export const bookingAPI = {
  // ─── Get Properties ──────────────────────────────────────────────────────────
  async getProperties() {
    if (STANDALONE_MODE) {
      // Return empty - properties come from rently.config
      return [];
    }
    return request('/properties');
  },

  // ─── Get Available Properties for Date Range ─────────────────────────────────
  async getAvailableProperties({ checkIn, checkOut, adults = 2, children = 0 }) {
    if (STANDALONE_MODE) {
      console.log('[BookingService] STANDALONE_MODE - returning empty properties');
      // In standalone mode, return all properties as available
      return {
        checkIn,
        checkOut,
        available: 0,
        properties: [],
      };
    }

    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: adults.toString(),
      children: children.toString(),
    });

    const url = `${API_BASE}/api/public/${ORG_SLUG}/available-properties?${params}`;
    console.log('[BookingService] Fetching available properties:', url);

    const response = await fetch(url);
    const data = await response.json();

    console.log('[BookingService] API Response:', {
      success: data.success,
      available: data.data?.available,
      total: data.data?.total,
      propertiesCount: data.data?.properties?.length,
    });

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to get available properties');
    }

    return data.data;
  },

  // ─── Get Property with Calendar ─────────────────────────────────────────────
  async getProperty(slug, property = null) {
    if (STANDALONE_MODE) {
      // Generate calendar for the property
      return {
        property,
        calendar: generateCalendar(property),
      };
    }
    return request(`/properties/${slug}`);
  },

  // ─── Check Availability ──────────────────────────────────────────────────────
  async checkAvailability({ property, propertyId, checkIn, checkOut, adults = 2, children = 0 }) {
    if (STANDALONE_MODE) {
      return checkDateAvailability(property, checkIn, checkOut);
    }
    return request('/availability', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        checkIn,
        checkOut,
        adults,
        children,
      }),
    });
  },

  // ─── Get Quote ───────────────────────────────────────────────────────────────
  async getQuote({ property, propertyId, checkIn, checkOut, adults, children = 0, promoCode }) {
    if (STANDALONE_MODE) {
      return calculatePricing(property, checkIn, checkOut, adults, children, promoCode);
    }
    return request('/quote', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        checkIn,
        checkOut,
        adults,
        children,
        promoCode,
      }),
    });
  },

  // ─── Create Booking ──────────────────────────────────────────────────────────
  async createBooking({
    property,
    propertyId,
    checkIn,
    checkOut,
    adults,
    children = 0,
    guest,
    promoCode,
    specialRequests,
  }) {
    if (STANDALONE_MODE) {
      // In standalone mode, generate a mock booking
      const pricing = calculatePricing(property, checkIn, checkOut, adults, children, promoCode);

      // Generate confirmation code
      const confirmationCode = `RNTLY-${Date.now().toString(36).toUpperCase()}`;

      return {
        bookingId: `booking_${Date.now()}`,
        confirmationCode,
        status: 'pending_payment',
        ...pricing,
        guest,
        checkIn,
        checkOut,
        property: {
          id: property?.id,
          name: property?.name,
        },
        // For standalone, we'll use a demo payment flow
        clientSecret: 'demo_mode',
        paymentIntentId: `pi_demo_${Date.now()}`,
      };
    }

    return request('/book', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        checkIn,
        checkOut,
        adults,
        children,
        guest,
        promoCode,
        specialRequests,
      }),
    });
  },

  // ─── Mode Check ──────────────────────────────────────────────────────────────
  isStandaloneMode() {
    return STANDALONE_MODE;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (date, lang = 'en') => {
  if (!date) return '';
  const d = new Date(date);
  const options = { month: 'short', day: 'numeric' };
  return d.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', options);
};

export const formatFullDate = (date, lang = 'en') => {
  if (!date) return '';
  const d = new Date(date);
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', options);
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const diffDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate - startDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRICE FORMATTING
// ═══════════════════════════════════════════════════════════════════════════════

export const formatPrice = (amount, currency = 'ILS') => {
  // Amount is in cents (agorot)
  const value = amount / 100;

  if (currency === 'ILS') {
    return `₪${value.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default bookingAPI;
