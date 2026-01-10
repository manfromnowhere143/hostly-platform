import { NextRequest } from 'next/server'
import { success, error, handleError } from '@/lib/utils/api'
import { requireAuth } from '@/lib/auth/context'
import { propertyService } from '@/lib/services/property.service'
import { updatePropertySchema } from '@/lib/services/property.schema'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/v1/properties/:id - Get property
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const context = await requireAuth()
    const { id } = await params

    const property = await propertyService.getById(context, id)

    return success(property)
  } catch (err) {
    if (err instanceof Error && err.message === 'Property not found') {
      return error('NOT_FOUND', 'Property not found', undefined, 404)
    }
    return handleError(err)
  }
}

// PUT /api/v1/properties/:id - Update property
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const context = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const data = updatePropertySchema.parse(body)

    const property = await propertyService.update(context, id, data)

    return success(property)
  } catch (err) {
    if (err instanceof Error && err.message === 'Property not found') {
      return error('NOT_FOUND', 'Property not found', undefined, 404)
    }
    return handleError(err)
  }
}

// DELETE /api/v1/properties/:id - Delete property
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const context = await requireAuth()
    const { id } = await params

    await propertyService.delete(context, id)

    return success({ deleted: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Property not found') {
      return error('NOT_FOUND', 'Property not found', undefined, 404)
    }
    if (err instanceof Error && err.message.includes('existing reservations')) {
      return error('CONFLICT', err.message, undefined, 409)
    }
    return handleError(err)
  }
}
