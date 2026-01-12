/**
 * PRICE INTELLIGENCE HOOK - STATE OF THE ART
 *
 * High-performance React hook for price intelligence.
 * Features:
 * - SWR pattern (stale-while-revalidate) for instant display
 * - In-memory cache with 5-minute TTL
 * - Debounced date updates (300ms)
 * - Optimistic UI (shows cached data while fetching)
 * - Parallel prefetch on modal open
 * - Background refresh without loading states
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { fetchPriceIntelligence } from '../services/priceIntelligence'

// ════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE (SWR Pattern)
// ════════════════════════════════════════════════════════════════════════════════

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(params) {
  const id = params.boomId || params.propertyId
  return `${id}-${params.checkIn || ''}-${params.checkOut || ''}-${params.guests}-${params.flexDays}`
}

function getFromCache(key) {
  const entry = cache.get(key)
  if (!entry) return null

  // Check if still fresh (not stale)
  const isStale = Date.now() - entry.timestamp > CACHE_TTL
  return { data: entry.data, isStale }
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() })

  // Cleanup old entries (keep max 50)
  if (cache.size > 50) {
    const oldest = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 10)
    oldest.forEach(([k]) => cache.delete(k))
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// DEBOUNCE UTILITY
// ════════════════════════════════════════════════════════════════════════════════

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Hook for price intelligence data with SWR pattern
 *
 * @param {Object} params
 * @param {string} [params.propertyId] - Property ID (Hostly)
 * @param {number} [params.boomId] - Boom PMS ID (preferred for direct lookups)
 * @param {string} [params.checkIn] - Check-in date
 * @param {string} [params.checkOut] - Check-out date
 * @param {number} [params.guests] - Number of guests
 * @param {number} [params.flexDays] - Days of flexibility
 * @param {boolean} [params.enabled] - Whether to fetch (default true)
 */
export function usePriceIntelligence({
  propertyId,
  boomId,
  checkIn,
  checkOut,
  guests = 2,
  flexDays = 3,
  enabled = true,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Debounce date changes to avoid rapid refetching
  const debouncedCheckIn = useDebouncedValue(checkIn, 300)
  const debouncedCheckOut = useDebouncedValue(checkOut, 300)

  // Track in-flight requests to prevent duplicates
  const abortControllerRef = useRef(null)
  const lastFetchKeyRef = useRef('')

  // Build params object (prefer boomId for direct PMS lookups)
  const params = useMemo(() => ({
    propertyId,
    boomId,
    checkIn: debouncedCheckIn,
    checkOut: debouncedCheckOut,
    guests,
    flexDays,
  }), [propertyId, boomId, debouncedCheckIn, debouncedCheckOut, guests, flexDays])

  // Fetch function with SWR pattern
  const doFetch = useCallback(async (fetchParams, options = {}) => {
    const { background = false } = options
    const cacheKey = getCacheKey(fetchParams)

    // Check cache first
    const cached = getFromCache(cacheKey)

    // If we have fresh cached data, return immediately
    if (cached && !cached.isStale) {
      setData(cached.data)
      setLoading(false)
      return cached.data
    }

    // If we have stale data, show it immediately (optimistic)
    if (cached) {
      setData(cached.data)
      setIsRefreshing(true)
    } else if (!background) {
      setLoading(true)
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const result = await fetchPriceIntelligence(fetchParams)

      // Store in cache
      setCache(cacheKey, result)
      setData(result)
      setError(null)

      return result
    } catch (err) {
      // Don't set error if we have cached data (graceful degradation)
      if (!cached) {
        console.error('[usePriceIntelligence] Error:', err)
        setError(err.message || 'Failed to load price data')
      }
      return null
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Main effect - fetch when params change
  useEffect(() => {
    const hasId = boomId || propertyId
    if (!enabled || !hasId) {
      return
    }

    const cacheKey = getCacheKey(params)

    // Skip if same as last fetch
    if (cacheKey === lastFetchKeyRef.current) {
      return
    }
    lastFetchKeyRef.current = cacheKey

    doFetch(params)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [params, enabled, doFetch, boomId, propertyId])

  // Prefetch without dates (for base insights) - runs immediately on property change
  useEffect(() => {
    const hasId = boomId || propertyId
    if (!enabled || !hasId) return

    // Prefetch base data (no dates) in background for instant scarcity/insights
    const baseParams = { propertyId, boomId, guests, flexDays }
    const baseCacheKey = getCacheKey(baseParams)
    const cached = getFromCache(baseCacheKey)

    // If no cached base data, prefetch in background
    if (!cached) {
      doFetch(baseParams, { background: true })
    } else if (!data) {
      // Show cached base data immediately while waiting for date-specific data
      setData(cached.data)
    }
  }, [propertyId, boomId, guests, flexDays, enabled, doFetch, data])

  // Manual refetch function
  const refetch = useCallback(() => {
    lastFetchKeyRef.current = '' // Clear to force refetch
    if (boomId || propertyId) {
      doFetch(params)
    }
  }, [params, propertyId, boomId, doFetch])

  return {
    // Data (with safe defaults)
    data,
    calendar: data?.calendar || [],
    insights: data?.insights || [],
    scarcity: data?.scarcity || null,
    alternatives: data?.alternatives || [],
    priceStats: data?.priceStats || null,
    requestedDates: data?.requestedDates || null,

    // State
    loading,        // True on initial load (no cached data)
    isRefreshing,   // True when refreshing stale data in background
    error,

    // Computed
    hasData: !!data,
    isFresh: !isRefreshing && !!data,

    // Actions
    refetch,
  }
}

export default usePriceIntelligence
