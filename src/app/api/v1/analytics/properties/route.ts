/**
 * Property Performance Analytics API
 *
 * GET /api/v1/analytics/properties
 * Returns performance metrics for all properties
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
    const sortBy = searchParams.get('sortBy') || 'revenue' // revenue, occupancy, rating
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const analyticsService = await createAnalyticsService(context.organizationId)
    let properties = await analyticsService.getPropertyPerformance(from, to)

    // Sort by requested metric
    switch (sortBy) {
      case 'occupancy':
        properties = properties.sort((a, b) => b.occupancy.occupancyRate - a.occupancy.occupancyRate)
        break
      case 'rating':
        properties = properties.sort((a, b) => b.rating - a.rating)
        break
      case 'revenue':
      default:
        properties = properties.sort((a, b) => b.revenue.totalRevenue - a.revenue.totalRevenue)
    }

    // Apply limit
    properties = properties.slice(0, limit)

    // Calculate portfolio totals
    const totals = {
      totalRevenue: properties.reduce((sum, p) => sum + p.revenue.totalRevenue, 0),
      averageOccupancy: properties.length > 0
        ? properties.reduce((sum, p) => sum + p.occupancy.occupancyRate, 0) / properties.length
        : 0,
      averageRating: properties.filter(p => p.rating > 0).length > 0
        ? properties.filter(p => p.rating > 0).reduce((sum, p) => sum + p.rating, 0) / properties.filter(p => p.rating > 0).length
        : 0,
      totalProperties: properties.length,
    }

    return NextResponse.json({
      success: true,
      data: {
        period: { from, to },
        properties,
        totals,
      },
    })
  } catch (error) {
    console.error('[Property Analytics] Error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch property analytics' },
      { status: 500 }
    )
  }
}
