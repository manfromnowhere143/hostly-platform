// ════════════════════════════════════════════════════════════════════════════
// HOSTLY TYPE DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════

// Tenant Context - attached to every authenticated request
export interface TenantContext {
  organizationId: string
  organizationSlug: string
  userId: string
  userRole: 'owner' | 'admin' | 'staff' | 'viewer'
  permissions: string[]
}

// JWT Payload
export interface JWTPayload {
  sub: string // userId
  org: string // organizationId
  slug: string // organizationSlug
  role: string
  permissions: string[]
  iat: number
  exp: number
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Array<{
    field: string
    message: string
  }>
}

export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  hasMore?: boolean
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

// Property types
export interface PropertyAddress {
  street: string
  city: string
  state?: string
  country: string
  zip?: string
}

export interface PropertyCoordinates {
  lat: number
  lng: number
}

// Quote types
export interface NightlyRate {
  date: string
  price: number
  reason?: string
}

export interface Discount {
  type: 'promo' | 'weekly' | 'monthly' | 'custom'
  code?: string
  description: string
  amount: number
}

// Booking request
export interface BookingRequest {
  propertyId: string
  checkIn: string // ISO date
  checkOut: string // ISO date
  adults: number
  children?: number
  infants?: number
  guest: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  paymentMethodId?: string // Stripe payment method
  promoCode?: string
}

// Availability check
export interface AvailabilityCheck {
  propertyId: string
  checkIn: string
  checkOut: string
  adults: number
  children?: number
}

export interface AvailabilityResult {
  available: boolean
  reason?: string
  alternatives?: Array<{
    checkIn: string
    checkOut: string
    price: number
  }>
}
