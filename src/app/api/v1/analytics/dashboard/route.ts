/**
 * Host Dashboard Analytics API
 *
 * GET /api/v1/analytics/dashboard
 * Returns comprehensive dashboard data with revenue, occupancy, and performance metrics
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

    const analyticsService = await createAnalyticsService(context.organizationId)
    const dashboard = await analyticsService.getDashboard(from, to)

    return NextResponse.json({
      success: true,
      data: dashboard,
    })
  } catch (error) {
    console.error('[Analytics Dashboard] Error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics dashboard' },
      { status: 500 }
    )
  }
}
