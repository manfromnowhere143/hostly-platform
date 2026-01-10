/**
 * Occupancy Analytics API
 *
 * GET /api/v1/analytics/occupancy
 * Returns occupancy metrics and trends
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth/context'
import { createAnalyticsService } from '@/lib/services/analytics.service'

export async function GET(request: NextRequest) {
  try {
    const context = await requirePermission('analytics:read')

    const { searchParams } = new URL(request.url)

    // Default to last 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const from = searchParams.get('from') || thirtyDaysAgo.toISOString().split('T')[0]
    const to = searchParams.get('to') || now.toISOString().split('T')[0]
    const propertyId = searchParams.get('propertyId') || undefined
    const granularity = (searchParams.get('granularity') as 'day' | 'week' | 'month') || 'day'

    const analyticsService = await createAnalyticsService(context.organizationId)

    const [metrics, trend] = await Promise.all([
      analyticsService.getOccupancyMetrics(from, to, propertyId),
      analyticsService.getOccupancyTrend(from, to, granularity),
    ])

    return NextResponse.json({
      success: true,
      data: {
        period: { from, to },
        metrics,
        trend,
      },
    })
  } catch (error) {
    console.error('[Occupancy Analytics] Error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch occupancy analytics' },
      { status: 500 }
    )
  }
}
