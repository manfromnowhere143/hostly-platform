/**
 * Revenue Analytics API
 *
 * GET /api/v1/analytics/revenue
 * Returns detailed revenue metrics and channel breakdown
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

    const analyticsService = await createAnalyticsService(context.organizationId)

    const [metrics, byChannel] = await Promise.all([
      analyticsService.getRevenueMetrics(from, to, propertyId),
      analyticsService.getRevenueByChannel(from, to),
    ])

    return NextResponse.json({
      success: true,
      data: {
        period: { from, to },
        metrics,
        byChannel,
      },
    })
  } catch (error) {
    console.error('[Revenue Analytics] Error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    )
  }
}
