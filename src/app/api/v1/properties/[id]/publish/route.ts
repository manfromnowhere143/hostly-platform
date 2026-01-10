import { NextRequest } from 'next/server'
import { success, error, handleError } from '@/lib/utils/api'
import { requireAuth } from '@/lib/auth/context'
import { propertyService } from '@/lib/services/property.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/v1/properties/:id/publish - Publish property
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const context = await requireAuth()
    const { id } = await params

    const property = await propertyService.publish(context, id)

    return success(property)
  } catch (err) {
    if (err instanceof Error && err.message === 'Property not found') {
      return error('NOT_FOUND', 'Property not found', undefined, 404)
    }
    return handleError(err)
  }
}

// DELETE /api/v1/properties/:id/publish - Unpublish property
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const context = await requireAuth()
    const { id } = await params

    const property = await propertyService.unpublish(context, id)

    return success(property)
  } catch (err) {
    if (err instanceof Error && err.message === 'Property not found') {
      return error('NOT_FOUND', 'Property not found', undefined, 404)
    }
    return handleError(err)
  }
}
