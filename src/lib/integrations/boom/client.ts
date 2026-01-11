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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'checked_in' | 'checked_out'
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
  source?: string // airbnb, booking_com, vrbo, direct, hostly_direct
  channel?: string
  payout_price?: number
  host_service_fee?: number
  commission?: number
}

export interface BoomReview {
  id: string
  reservation_id: string
  listing_id: number
  rating: number
  comment: string
  guest_name: string
  created_at: string
  response?: string
  responded_at?: string
  categories?: {
    cleanliness?: number
    communication?: number
    check_in?: number
    accuracy?: number
    location?: number
    value?: number
  }
}

export interface BoomCalendarDay {
  date: string
  available: boolean
  price?: number
  min_nights?: number
  note?: string
}

export interface BoomReservationsResponse {
  reservations: BoomReservation[]
  pagi_info?: {
    count: number
    page: number
    per_page: number
    total_pages: number
  }
}

export interface BoomReviewsResponse {
  reviews: BoomReview[]
  average_rating?: number
  total_count?: number
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

export class BoomClient {
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

  /**
   * Get all reservations with optional filters
   * This is CRITICAL for analytics - fetches ALL booking history
   */
  async getReservations(params?: {
    from?: string        // Start date (YYYY-MM-DD)
    to?: string          // End date (YYYY-MM-DD)
    status?: string      // pending, confirmed, cancelled, completed
    listing_id?: number  // Filter by specific listing
    page?: number        // Pagination
    per_page?: number    // Items per page (max 100)
  }): Promise<BoomReservationsResponse> {
    const query = new URLSearchParams()
    if (params?.from) query.append('from', params.from)
    if (params?.to) query.append('to', params.to)
    if (params?.status) query.append('status', params.status)
    if (params?.listing_id) query.append('listing_id', params.listing_id.toString())
    if (params?.page) query.append('page', params.page.toString())
    if (params?.per_page) query.append('per_page', params.per_page.toString())

    const queryString = query.toString()
    const result = await this.request<BoomReservationsResponse | null>(
      `/reservations${queryString ? `?${queryString}` : ''}`
    )

    // Handle empty responses (204 No Content returns empty object)
    if (!result || !result.reservations) {
      return { reservations: [] }
    }

    return result
  }

  /**
   * Get a single reservation by ID
   */
  async getReservation(reservationId: string): Promise<BoomReservation> {
    const response = await this.request<{ reservation: BoomReservation }>(
      `/reservations/${reservationId}`
    )
    return response.reservation
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId: string, reason?: string): Promise<void> {
    await this.request<void>(`/reservations/${reservationId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CALENDAR & AVAILABILITY - Push updates to all OTAs via Boom
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Update availability for a listing
   * This pushes availability changes to ALL connected OTAs (Airbnb, Booking.com, VRBO)
   */
  async updateAvailability(
    listingId: number | string,
    dates: Array<{
      date: string       // YYYY-MM-DD
      available: boolean
      min_nights?: number
      note?: string
    }>
  ): Promise<{ success: boolean; updated: number }> {
    const payload = {
      listing_id: typeof listingId === 'string' ? parseInt(listingId) : listingId,
      dates: dates.map(d => ({
        date: d.date,
        available: d.available,
        min_nights: d.min_nights,
        note: d.note,
      })),
    }

    return this.request<{ success: boolean; updated: number }>('/calendar/availability', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Update rates/pricing for a listing
   * This pushes price changes to ALL connected OTAs
   */
  async updateRates(
    listingId: number | string,
    rates: Array<{
      date: string      // YYYY-MM-DD
      price: number     // Base price for the night
      currency?: string // Default: listing currency
    }>
  ): Promise<{ success: boolean; updated: number }> {
    const payload = {
      listing_id: typeof listingId === 'string' ? parseInt(listingId) : listingId,
      rates: rates.map(r => ({
        date: r.date,
        price: r.price,
        currency: r.currency || 'ILS',
      })),
    }

    return this.request<{ success: boolean; updated: number }>('/calendar/rates', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Get calendar data for a listing
   * Returns availability and pricing for a date range
   */
  async getCalendar(
    listingId: number | string,
    from: string,
    to: string
  ): Promise<BoomCalendarDay[]> {
    const params = new URLSearchParams({
      from,
      to,
    })

    const response = await this.request<{ calendar: BoomCalendarDay[] }>(
      `/listings/${listingId}/calendar?${params.toString()}`
    )
    return response.calendar || []
  }

  /**
   * Block dates for a listing (owner block, maintenance, etc.)
   */
  async blockDates(
    listingId: number | string,
    dates: string[],
    reason?: string
  ): Promise<{ success: boolean; blocked: number }> {
    const result = await this.updateAvailability(listingId, dates.map(date => ({
      date,
      available: false,
      note: reason || 'Blocked via Hostly',
    })))
    return { success: result.success, blocked: result.updated }
  }

  /**
   * Unblock dates for a listing
   */
  async unblockDates(
    listingId: number | string,
    dates: string[]
  ): Promise<{ success: boolean; unblocked: number }> {
    const result = await this.updateAvailability(listingId, dates.map(date => ({
      date,
      available: true,
    })))
    return { success: result.success, unblocked: result.updated }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // REVIEWS - Guest feedback management
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Get reviews for a listing
   */
  async getReviews(
    listingId: number | string,
    params?: {
      page?: number
      per_page?: number
    }
  ): Promise<BoomReviewsResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.per_page) query.append('per_page', params.per_page.toString())

    const queryString = query.toString()
    return this.request<BoomReviewsResponse>(
      `/listings/${listingId}/reviews${queryString ? `?${queryString}` : ''}`
    )
  }

  /**
   * Reply to a review
   */
  async replyToReview(
    reviewId: string,
    message: string
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  /**
   * Get all reviews across all listings (for dashboard)
   */
  async getAllReviews(params?: {
    from?: string
    to?: string
    min_rating?: number
    responded?: boolean
    page?: number
  }): Promise<BoomReviewsResponse> {
    const query = new URLSearchParams()
    if (params?.from) query.append('from', params.from)
    if (params?.to) query.append('to', params.to)
    if (params?.min_rating) query.append('min_rating', params.min_rating.toString())
    if (params?.responded !== undefined) query.append('responded', params.responded.toString())
    if (params?.page) query.append('page', params.page.toString())

    const queryString = query.toString()
    return this.request<BoomReviewsResponse>(
      `/reviews${queryString ? `?${queryString}` : ''}`
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ANALYTICS - Aggregate data for insights
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Fetch ALL reservations for a date range (handles pagination)
   * This is the foundation for our analytics engine
   */
  async fetchAllReservations(
    from: string,
    to: string,
    options?: { status?: string; listingId?: number }
  ): Promise<BoomReservation[]> {
    const allReservations: BoomReservation[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await this.getReservations({
        from,
        to,
        status: options?.status,
        listing_id: options?.listingId,
        page,
        per_page: 100,
      })

      // Handle empty responses
      const reservations = response.reservations || []
      allReservations.push(...reservations)

      // Check if there are more pages
      if (response.pagi_info) {
        hasMore = page < response.pagi_info.total_pages
      } else {
        hasMore = reservations.length === 100
      }
      page++

      // Rate limiting - don't hammer the API
      if (hasMore) {
        await new Promise(r => setTimeout(r, 100))
      }
    }

    return allReservations
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
