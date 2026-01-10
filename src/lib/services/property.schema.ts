import { z } from 'zod'

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  zip: z.string().optional(),
})

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const createPropertySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['apartment', 'villa', 'hotel_room', 'house']),
  description: z.string().optional(),
  address: addressSchema,
  coordinates: coordinatesSchema.optional(),
  timezone: z.string().default('UTC'),
  maxGuests: z.number().int().min(1, 'Must have at least 1 guest'),
  bedrooms: z.number().int().min(0).default(0),
  beds: z.number().int().min(0).default(0),
  bathrooms: z.number().min(0).default(0),
  basePrice: z.number().int().min(0, 'Base price must be positive'),
  currency: z.string().length(3).default('USD'),
  cleaningFee: z.number().int().min(0).default(0),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/).default('15:00'),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/).default('11:00'),
  minNights: z.number().int().min(1).default(1),
  maxNights: z.number().int().min(1).default(365),
  amenities: z.array(z.string()).optional(),
})

export const updatePropertySchema = createPropertySchema.partial()

export const propertyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['draft', 'active', 'inactive']).optional(),
  type: z.enum(['apartment', 'villa', 'hotel_room', 'house']).optional(),
  search: z.string().optional(),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>
