/**
 * Revenue & Occupancy Forecast API
 *
 * GET /api/v1/analytics/forecast
 * Returns predictive analytics based on historical data
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth/context'
import { createAnalyticsService } from '@/lib/services/analytics.service'

export async function GET(request: NextRequest) {
  try {
    const context = await requirePermission('analytics:read')

    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '3', 10)

    // Limit forecast to 12 months max
    const forecastMonths = Math.min(Math.max(1, months), 12)

    const analyticsService = await createAnalyticsService(context.organizationId)
    const forecast = await analyticsService.getForecast(forecastMonths)

    return NextResponse.json({
      success: true,
      data: {
        forecast,
        methodology: 'Moving average with seasonal adjustment',
        disclaimer: 'Predictions based on historical data. Actual results may vary.',
      },
    })
  } catch (error) {
    console.error('[Forecast Analytics] Error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate forecast' },
      { status: 500 }
    )
  }
}
