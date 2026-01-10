/**
 * BOOM API CLIENT - State of the Art
 *
 * Official integration with Boom PMS (boomnow.com)
 * Handles all communication with Boom's Open API v1
 *
 * API Documentation: https://boomnow.stoplight.io
 * Base URL: https://app.boomnow.com/open_api/v1
 *
 * Features:
 * - Token caching with auto-refresh
 * - Request retry with exponential backoff
 * - Comprehensive error handling
 * - Full TypeScript types
 */

const BOOM_API_URL = process.env.BOOM_API_URL || 'https://app.boomnow.com/open_api/v1'
const BOOM_CLIENT_ID = process.env.BOOM_CLIENT_ID
const BOOM_CLIENT_SECRET = process.env.BOOM_CLIENT_SECRET

// ════════════════════════════════════════════════════════════════════════════════
// TYPES - Based on actual Boom API responses
// ════════════════════════════════════════════════════════════════════════════════

interface BoomTokenResponse {
  token_type: string
  expires_in: number
  access_token: string
}

export interface BoomListing {
  id: number
  title: string
  nickname?: string
  pictures: Array<{ picture: string; nickname?: string }>
  amenities: string[]
  beds: number
  baths: number
  city_name: string
  lat: number
  lng: number
  accommodates: number
  address?: {
    street?: string
    city?: string
    country?: string
  }
  marketing_content?: {
    description?: string
    space?: string
    neighborhood?: string
  }
  extra_info?: Record<string, any>
  days_rates?: Record<string, any>
  is_multi_unit?: boolean
  ota_type?: string
}

export interface BoomPricing {
  nights_count: number
  day_rate: number
  subtotal: number
  cleaning_fee: number
  discount: number
  taxes: number
  taxes_breakdown: Array<{
    title: string
    amount: number
    type: string
  }>
  fees_breakdown: Array<{
    title?: string
    amount?: number
  }>
  fare_accommodation: number
  adjusted_fare_accommodation: number
  total: number
  security_deposit: number
}

export interface BoomReservation {
  id: string
  status: string
  check_in: string
  check_out: string
  guest_name: string
  guest_count: number
  listing: {
    id: string
    name: string
  }
  created_at?: string
  updated_at?: string
  total_price?: number
  currency?: string
  guest?: {
    name: string
    email: string
    phone?: string
  }
  notes?: string
  confirmation_code?: string
  source?: string
}

interface BoomListingsResponse {
  listings: Array<{ listing: BoomListing }>
  pagi_info?: {
    count: number
    page: number
    per_page: number
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// ERROR CLASSES
// ════════════════════════════════════════════════════════════════════════════════

export class BoomAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
    public responseBody?: string
  ) {
    super(message)
    this.name = 'BoomAPIError'
  }
}

export class BoomAuthError extends BoomAPIError {
  constructor(message: string) {
    super(message, 401, '/auth/token')
    this.name = 'BoomAuthError'
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CLIENT CLASS
// ════════════════════════════════════════════════════════════════════════════════

class BoomClient {
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null
  private isConfigured: boolean

  constructor() {
    this.isConfigured = !!(BOOM_CLIENT_ID && BOOM_CLIENT_SECRET)
  }

  /**
   * Check if Boom integration is configured
   */
  isEnabled(): boolean {
    return this.isConfigured
  }

  /**
   * Get or refresh access token with caching
   */
  private async getAccessToken(): Promise<string> {
    if (!this.isConfigured) {
      throw new BoomAuthError('Boom credentials not configured')
    }

    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken
    }

    console.log('[Boom] Refreshing access token...')

    const response = await fetch(`${BOOM_API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: BOOM_CLIENT_ID,
        client_secret: BOOM_CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new BoomAuthError(`Authentication failed: ${response.status} - ${error}`)
    }

    const data: BoomTokenResponse = await response.json()

    this.accessToken = data.access_token
    // expires_in from Boom is a Unix timestamp, not seconds from now
    // If it's a large number (> 1 year in seconds), treat as timestamp
    if (data.expires_in > 31536000) {
      this.tokenExpiry = new Date(data.expires_in * 1000 - 60000) // 60s buffer
    } else {
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000)
    }

    console.log('[Boom] Token refreshed, expires:', this.tokenExpiry.toISOString())
    return this.accessToken
  }

  /**
   * Make authenticated request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2
  ): Promise<T> {
    const token = await this.getAccessToken()

    const url = `${BOOM_API_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()

      // Retry on 5xx errors
      if (response.status >= 500 && retries > 0) {
        console.warn(`[Boom] Server error ${response.status}, retrying...`)
        await new Promise(r => setTimeout(r, 1000 * (3 - retries)))
        return this.request<T>(endpoint, options, retries - 1)
      }

      // Retry on auth error (token might have expired)
      if (response.status === 401 && retries > 0) {
        console.warn('[Boom] Auth error, refreshing token and retrying...')
        this.accessToken = null
        this.tokenExpiry = null
        return this.request<T>(endpoint, options, retries - 1)
      }

      throw new BoomAPIError(
        `API request failed: ${response.status}`,
        response.status,
        endpoint,
        errorBody
      )
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) return {} as T

    return JSON.parse(text)
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LISTINGS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Get all listings with optional filters
   */
  async getListings(params?: {
    check_in?: string
    check_out?: string
    adults?: number
    children?: number
    city?: string
    region?: string
    page?: number
  }): Promise<BoomListing[]> {
    const query = new URLSearchParams()
    if (params?.check_in) query.append('check_in', params.check_in)
    if (params?.check_out) query.append('check_out', params.check_out)
    if (params?.adults) query.append('adults', params.adults.toString())
    if (params?.children) query.append('children', params.children.toString())
    if (params?.city) query.append('city', params.city)
    if (params?.region) query.append('region', params.region)
    if (params?.page) query.append('page', params.page.toString())

    const queryString = query.toString()
    const response = await this.request<BoomListingsResponse>(
      `/listings${queryString ? `?${queryString}` : ''}`
    )

    return (response.listings || []).map(item => item.listing || item)
  }

  /**
   * Get single listing by ID
   */
  async getListing(listingId: number | string): Promise<BoomListing> {
    const response = await this.request<{ listing: BoomListing }>(
      `/listings/${listingId}`
    )
    return response.listing
  }

  /**
   * Get pricing for a listing
   */
  async getPricing(
    listingId: number | string,
    checkIn: string,
    checkOut: string,
    guestsCount: number,
    couponCode?: string
  ): Promise<BoomPricing> {
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      guests_count: guestsCount.toString(),
    })
    if (couponCode) params.append('coupon_code', couponCode)

    const response = await this.request<{ info: BoomPricing }>(
      `/listings/${listingId}/pricing?${params.toString()}`
    )
    return response.info
  }

  /**
   * Get all regions
   */
  async getRegions(): Promise<string[]> {
    return this.request<string[]>('/listings/regions')
  }

  /**
   * Get all cities
   */
  async getCities(): Promise<string[]> {
    return this.request<string[]>('/listings/cities')
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RESERVATIONS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Create a new reservation
   * Note: This endpoint's exact format may need adjustment based on Boom's requirements
   */
  async createReservation(data: {
    listing_id: number | string
    check_in: string
    check_out: string
    guests_count: number
    first_name: string
    last_name: string
    email: string
    phone?: string
    coupon_code?: string
    notes?: string
  }): Promise<BoomReservation> {
    // Format dates as array [check_in, check_out] as required by Boom
    const payload = {
      listing_id: typeof data.listing_id === 'string' ? parseInt(data.listing_id) : data.listing_id,
      range: [data.check_in, data.check_out],
      guests_count: data.guests_count,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      coupon_code: data.coupon_code,
      notes: data.notes,
      source: 'hostly_direct', // Identify bookings from Hostly
    }

    return this.request<BoomReservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Test connection to Boom API
   */
  async healthCheck(): Promise<{
    connected: boolean
    listingsCount?: number
    error?: string
  }> {
    if (!this.isConfigured) {
      return { connected: false, error: 'Credentials not configured' }
    }

    try {
      const listings = await this.getListings()
      return {
        connected: true,
        listingsCount: listings.length,
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Singleton instance
export const boomClient = new BoomClient()
