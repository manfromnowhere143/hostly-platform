/**
 * CALENDAR SYNC API - State of the Art
 *
 * Admin endpoints for calendar synchronization:
 * - GET: Sync status and health check
 * - POST: Trigger sync operations
 *
 * Operations:
 * - sync_property: Sync single property from Boom
 * - sync_all: Sync all mapped properties
 * - block_dates: Manually block dates
 * - unblock_dates: Remove manual blocks
 */

import { NextRequest, NextResponse } from 'next/server'
import { calendarSyncService } from '@/lib/services/calendar-sync.service'
import prisma from '@/lib/db/client'

/**
 * GET /api/v1/calendar/sync
 * Returns sync health status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get('propertyId')

    if (propertyId) {
      // Get status for specific property
      const status = await calendarSyncService.getSyncStatus(propertyId)
      return NextResponse.json({
        success: true,
        data: status,
      })
    }

    // Get overall sync statistics
    const mappedProperties = await prisma.property.count({
      where: {
        metadata: {
          path: ['boomId'],
          not: null,
        },
      },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const blockedDays = await prisma.calendarDay.count({
      where: {
        date: { gte: today },
        status: 'blocked',
      },
    })

    const bookedDays = await prisma.calendarDay.count({
      where: {
        date: { gte: today },
        status: 'booked',
      },
    })

    // Get recent sync events
    const recentSyncs = await prisma.event.findMany({
      where: {
        type: { startsWith: 'calendar.sync' },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        type: true,
        aggregateId: true,
        data: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        health: 'operational',
        statistics: {
          mappedProperties,
          blockedDays,
          bookedDays,
        },
        recentSyncs: recentSyncs.map((e) => ({
          type: e.type,
          propertyId: e.aggregateId,
          data: e.data,
          timestamp: e.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error('[Calendar Sync API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/calendar/sync
 * Trigger sync operations
 *
 * Body:
 * - action: 'sync_property' | 'sync_all' | 'block_dates' | 'unblock_dates'
 * - propertyId: string (for single property operations)
 * - organizationId: string (for sync_all)
 * - startDate: string (for block/unblock)
 * - endDate: string (for block/unblock)
 * - reason: string (for block_dates)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, propertyId, organizationId, startDate, endDate, reason } = body

    switch (action) {
      case 'sync_property': {
        if (!propertyId) {
          return NextResponse.json(
            { success: false, error: 'propertyId required' },
            { status: 400 }
          )
        }

        const result = await calendarSyncService.syncPropertyFromBoom(propertyId)
        return NextResponse.json({
          success: result.success,
          data: result,
        })
      }

      case 'sync_all': {
        const result = await calendarSyncService.syncAllFromBoom(organizationId)
        return NextResponse.json({
          success: result.success,
          data: result,
        })
      }

      case 'block_dates': {
        if (!propertyId || !startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'propertyId, startDate, and endDate required' },
            { status: 400 }
          )
        }

        const result = await calendarSyncService.blockDates(
          propertyId,
          new Date(startDate),
          new Date(endDate),
          reason || 'Manual block via API'
        )
        return NextResponse.json({
          success: true,
          data: result,
        })
      }

      case 'unblock_dates': {
        if (!propertyId || !startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'propertyId, startDate, and endDate required' },
            { status: 400 }
          )
        }

        const result = await calendarSyncService.unblockDates(
          propertyId,
          new Date(startDate),
          new Date(endDate)
        )
        return NextResponse.json({
          success: true,
          data: result,
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Calendar Sync API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
