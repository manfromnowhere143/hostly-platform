/**
 * BOOM INTEGRATION API
 *
 * Admin endpoints for managing Boom PMS integration:
 * - GET: Health check and sync status
 * - POST: Trigger manual sync operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { boomSyncService } from '@/lib/services/boom-sync.service'
import { boomClient } from '@/lib/integrations/boom/client'
import prisma from '@/lib/db/client'

/**
 * GET /api/v1/integrations/boom
 * Returns Boom integration health status
 */
export async function GET() {
  try {
    const health = await boomSyncService.healthCheck()

    // Get recent sync events
    const recentEvents = await prisma.event.findMany({
      where: {
        type: {
          startsWith: 'boom.',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Get unsynced reservations
    const unsyncedReservations = await prisma.reservation.findMany({
      where: {
        status: 'confirmed',
        internalNotes: {
          not: {
            contains: 'Boom ID:',
          },
        },
        property: {
          metadata: {
            path: ['boomId'],
            not: null,
          },
        },
      },
      select: {
        id: true,
        confirmationCode: true,
        checkIn: true,
        checkOut: true,
        property: {
          select: { name: true },
        },
      },
      take: 20,
    })

    return NextResponse.json({
      status: health.connected ? 'healthy' : 'disconnected',
      boom: {
        connected: health.connected,
        listingsCount: health.listingsCount,
        error: health.error,
      },
      hostly: {
        mappedProperties: health.mappedProperties,
        unsyncedReservations: unsyncedReservations.length,
      },
      recentEvents: recentEvents.map(e => ({
        type: e.type,
        timestamp: e.createdAt,
        data: e.data,
      })),
      unsyncedReservations: unsyncedReservations.map(r => ({
        id: r.id,
        confirmationCode: r.confirmationCode,
        property: r.property.name,
        dates: `${r.checkIn.toISOString().split('T')[0]} to ${r.checkOut.toISOString().split('T')[0]}`,
      })),
    })
  } catch (error) {
    console.error('[Boom API] Health check error:', error)
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/integrations/boom
 * Trigger sync operations
 *
 * Body:
 * - action: 'sync_reservation' | 'sync_all_unsynced' | 'test_connection'
 * - reservationId: string (for sync_reservation)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, reservationId } = body

    switch (action) {
      case 'test_connection': {
        const health = await boomClient.healthCheck()
        return NextResponse.json({
          success: health.connected,
          listingsCount: health.listingsCount,
          error: health.error,
        })
      }

      case 'sync_reservation': {
        if (!reservationId) {
          return NextResponse.json(
            { error: 'reservationId required' },
            { status: 400 }
          )
        }

        const result = await boomSyncService.syncReservationToBoom(reservationId)
        return NextResponse.json(result)
      }

      case 'sync_all_unsynced': {
        // Get all unsynced reservations for mapped properties
        const unsynced = await prisma.reservation.findMany({
          where: {
            status: 'confirmed',
            internalNotes: {
              not: {
                contains: 'Boom ID:',
              },
            },
            property: {
              metadata: {
                path: ['boomId'],
                not: null,
              },
            },
          },
          select: { id: true, confirmationCode: true },
        })

        const results = []
        for (const reservation of unsynced) {
          const result = await boomSyncService.syncReservationToBoom(reservation.id)
          results.push({
            reservationId: reservation.id,
            confirmationCode: reservation.confirmationCode,
            ...result,
          })
        }

        return NextResponse.json({
          processed: results.length,
          results,
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Boom API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
