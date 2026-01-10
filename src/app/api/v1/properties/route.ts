import { NextRequest } from 'next/server'
import { success, handleError, paginate } from '@/lib/utils/api'
import { requireAuth } from '@/lib/auth/context'
import { propertyService } from '@/lib/services/property.service'
import { createPropertySchema, propertyQuerySchema } from '@/lib/services/property.schema'

// GET /api/v1/properties - List properties
export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth()

    // Parse query params
    const { searchParams } = new URL(request.url)
    const query = propertyQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      type: searchParams.get('type'),
      search: searchParams.get('search'),
    })

    const result = await propertyService.list(context, query)

    const { data, meta } = paginate(
      result.properties,
      result.total,
      result.page,
      result.limit
    )

    return success(data, meta)
  } catch (err) {
    return handleError(err)
  }
}

// POST /api/v1/properties - Create property
export async function POST(request: NextRequest) {
  try {
    const context = await requireAuth()
    const body = await request.json()
    const data = createPropertySchema.parse(body)

    const property = await propertyService.create(context, data)

    return success(property, undefined, 201)
  } catch (err) {
    return handleError(err)
  }
}
