/**
 * PRICE INTELLIGENCE SERVICE - STATE OF THE ART
 *
 * Fetches smart pricing data from Hostly API.
 * Powers the price calendar heatmap, flexible dates, and insights.
 */

// Support both Vite and Next.js environments
const getEnv = (key, fallback) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`NEXT_PUBLIC_${key}`] || fallback;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[`VITE_${key}`] || fallback;
  }
  return fallback;
};

const API_BASE = getEnv('HOSTLY_API_URL', 'http://localhost:3000')
const ORG_SLUG = getEnv('HOSTLY_ORG_SLUG', 'rently')

/**
 * Fetch price intelligence for a property
 * @param {Object} params
 * @param {string} params.propertyId - Property ID
 * @param {string} [params.checkIn] - Check-in date (YYYY-MM-DD)
 * @param {string} [params.checkOut] - Check-out date (YYYY-MM-DD)
 * @param {number} [params.guests] - Number of guests
 * @param {number} [params.flexDays] - Days of flexibility (default 3)
 */
export async function fetchPriceIntelligence({
  propertyId,
  checkIn,
  checkOut,
  guests = 2,
  flexDays = 3,
}) {
  const params = new URLSearchParams()

  if (propertyId) params.set('propertyId', propertyId)
  if (checkIn) params.set('checkIn', checkIn)
  if (checkOut) params.set('checkOut', checkOut)
  params.set('guests', guests.toString())
  params.set('flexDays', flexDays.toString())

  const response = await fetch(
    `${API_BASE}/api/public/${ORG_SLUG}/price-intelligence?${params}`
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || 'Failed to fetch price intelligence')
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch price intelligence')
  }

  return data.data
}

/**
 * Format price in ILS (from agorot)
 */
export function formatPrice(agorot, options = {}) {
  const { compact = false, showCurrency = true } = options
  const shekels = agorot / 100

  if (compact && shekels >= 1000) {
    return `${showCurrency ? '₪' : ''}${(shekels / 1000).toFixed(1)}K`
  }

  return new Intl.NumberFormat('he-IL', {
    style: showCurrency ? 'currency' : 'decimal',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(shekels)
}

/**
 * Get color for price level (for heatmap)
 */
export function getPriceLevelColor(level, opacity = 1) {
  const colors = {
    low: `rgba(34, 197, 94, ${opacity})`,      // Green
    medium: `rgba(181, 132, 109, ${opacity})`, // Velvet (brand)
    high: `rgba(249, 115, 22, ${opacity})`,    // Orange
    peak: `rgba(239, 68, 68, ${opacity})`,     // Red
  }
  return colors[level] || colors.medium
}

/**
 * Get background color for price level (lighter version)
 */
export function getPriceLevelBackground(level) {
  const colors = {
    low: 'rgba(34, 197, 94, 0.1)',
    medium: 'rgba(181, 132, 109, 0.1)',
    high: 'rgba(249, 115, 22, 0.1)',
    peak: 'rgba(239, 68, 68, 0.1)',
  }
  return colors[level] || colors.medium
}

/**
 * Format date for display (supports Hebrew locale)
 */
export function formatDate(dateStr, format = 'short', language = 'en') {
  const date = new Date(dateStr)
  const locale = language === 'he' ? 'he-IL' : 'en-US'

  if (format === 'short') {
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  }

  if (format === 'day') {
    return date.toLocaleDateString(locale, { weekday: 'short' })
  }

  if (format === 'full') {
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  return dateStr
}

/**
 * Calculate savings message
 */
export function getSavingsMessage(savings, savingsPercent) {
  if (savings <= 0) return null

  const shekels = Math.round(savings / 100)
  if (savingsPercent >= 15) {
    return `Save ₪${shekels} (${savingsPercent}% off!)`
  }
  return `Save ₪${shekels}`
}
