import { NextRequest } from 'next/server'
import { success, handleError } from '@/lib/utils/api'
import { requireAuth } from '@/lib/auth/context'
import { boomSyncService } from '@/lib/integrations/boom/sync'

// POST /api/v1/integrations/boom/sync - Sync with Boom
export async function POST(request: NextRequest) {
  try {
    const context = await requireAuth()
    const body = await request.json()

    const { type = 'all', from, to } = body

    const results: Record<string, unknown> = {}

    // Sync properties
    if (type === 'all' || type === 'properties') {
      results.properties = await boomSyncService.importProperties(context)
    }

    // Sync reservations
    if (type === 'all' || type === 'reservations') {
      results.reservations = await boomSyncService.importReservations(
        context,
        from,
        to
      )
    }

    return success({
      message: 'Sync completed',
      results,
    })
  } catch (err) {
    return handleError(err)
  }
}
