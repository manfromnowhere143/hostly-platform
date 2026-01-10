/**
 * Boom API Client
 *
 * Integrates with Boom PMS for:
 * - Property sync
 * - Reservation sync
 * - Availability sync
 * - Rate management
 */

const BOOM_API_URL = process.env.BOOM_API_URL || 'https://api.boomnow.com'
const BOOM_CLIENT_ID = process.env.BOOM_CLIENT_ID!
const BOOM_CLIENT_SECRET = process.env.BOOM_CLIENT_SECRET!

interface BoomTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface BoomProperty {
  id: string
  name: string
  type: string
  description?: string
  address: {
    street?: string
    city: string
    state?: string
    country: string
    zip?: string
  }
  max_guests: number
  bedrooms: number
  bathrooms: number
  base_rate: number
  currency: string
  amenities: string[]
  images: Array<{
    url: string
    caption?: string
  }>
  status: string
}

interface BoomReservation {
  id: string
  property_id: string
  confirmation_code: string
  check_in: string
  check_out: string
  guest: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  guests: {
    adults: number
    children: number
    infants: number
  }
  pricing: {
    accommodation: number
    cleaning: number
    fees: number
    taxes: number
    total: number
    currency: string
  }
  status: string
  source: string
  created_at: string
}

interface BoomAvailability {
  property_id: string
  date: string
  available: boolean
  price?: number
  min_nights?: number
}

class BoomClient {
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  // Get or refresh access token
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken
    }

    // Get new token
    const response = await fetch(`${BOOM_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: BOOM_CLIENT_ID,
        client_secret: BOOM_CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      throw new Error(`Boom auth failed: ${response.status}`)
    }

    const data: BoomTokenResponse = await response.json()

    this.accessToken = data.access_token
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000)

    return this.accessToken
  }

  // Make authenticated request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken()

    const response = await fetch(`${BOOM_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Boom API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // ════════════════════════════════════════════════════════════════════════
  // PROPERTIES
  // ════════════════════════════════════════════════════════════════════════

  async getProperties(): Promise<BoomProperty[]> {
    return this.request<BoomProperty[]>('/v1/properties')
  }

  async getProperty(propertyId: string): Promise<BoomProperty> {
    return this.request<BoomProperty>(`/v1/properties/${propertyId}`)
  }

  // ════════════════════════════════════════════════════════════════════════
  // RESERVATIONS
  // ════════════════════════════════════════════════════════════════════════

  async getReservations(params?: {
    property_id?: string
    from?: string
    to?: string
    status?: string
  }): Promise<BoomReservation[]> {
    const query = new URLSearchParams()
    if (params?.property_id) query.append('property_id', params.property_id)
    if (params?.from) query.append('from', params.from)
    if (params?.to) query.append('to', params.to)
    if (params?.status) query.append('status', params.status)

    const queryString = query.toString()
    return this.request<BoomReservation[]>(
      `/v1/reservations${queryString ? `?${queryString}` : ''}`
    )
  }

  async getReservation(reservationId: string): Promise<BoomReservation> {
    return this.request<BoomReservation>(`/v1/reservations/${reservationId}`)
  }

  async createReservation(data: {
    property_id: string
    check_in: string
    check_out: string
    guest: {
      first_name: string
      last_name: string
      email: string
      phone?: string
    }
    adults: number
    children?: number
    infants?: number
  }): Promise<BoomReservation> {
    return this.request<BoomReservation>('/v1/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async cancelReservation(reservationId: string): Promise<void> {
    await this.request(`/v1/reservations/${reservationId}/cancel`, {
      method: 'POST',
    })
  }

  // ════════════════════════════════════════════════════════════════════════
  // AVAILABILITY
  // ════════════════════════════════════════════════════════════════════════

  async getAvailability(
    propertyId: string,
    from: string,
    to: string
  ): Promise<BoomAvailability[]> {
    return this.request<BoomAvailability[]>(
      `/v1/properties/${propertyId}/availability?from=${from}&to=${to}`
    )
  }

  async updateAvailability(
    propertyId: string,
    dates: Array<{
      date: string
      available: boolean
      price?: number
      min_nights?: number
    }>
  ): Promise<void> {
    await this.request(`/v1/properties/${propertyId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ dates }),
    })
  }

  // ════════════════════════════════════════════════════════════════════════
  // RATES
  // ════════════════════════════════════════════════════════════════════════

  async getRates(
    propertyId: string,
    from: string,
    to: string
  ): Promise<Array<{ date: string; price: number }>> {
    return this.request(`/v1/properties/${propertyId}/rates?from=${from}&to=${to}`)
  }

  async updateRates(
    propertyId: string,
    rates: Array<{ date: string; price: number }>
  ): Promise<void> {
    await this.request(`/v1/properties/${propertyId}/rates`, {
      method: 'PUT',
      body: JSON.stringify({ rates }),
    })
  }
}

export const boomClient = new BoomClient()
export type { BoomProperty, BoomReservation, BoomAvailability }
