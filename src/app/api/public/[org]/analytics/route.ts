/**
 * Public Analytics API (Demo Data)
 *
 * GET /api/public/[org]/analytics
 * Returns demo analytics data for the dashboard without requiring authentication
 */

import { NextRequest, NextResponse } from 'next/server'

// Generate realistic demo data
function generateDemoData(from: string, to: string) {
  const fromDate = new Date(from)
  const toDate = new Date(to)
  const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))

  // Generate daily revenue timeline
  const timeline = []
  let currentDate = new Date(fromDate)
  let totalRevenue = 0

  for (let i = 0; i < days; i++) {
    // Simulate seasonal patterns - weekends higher
    const dayOfWeek = currentDate.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6
    const baseRevenue = isWeekend ? 8500 : 5500
    const variance = (Math.random() - 0.5) * 3000
    const dailyRevenue = Math.round(baseRevenue + variance)

    timeline.push({
      date: currentDate.toISOString().split('T')[0],
      revenue: dailyRevenue,
    })

    totalRevenue += dailyRevenue
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Channel breakdown (realistic distribution)
  const byChannel = {
    airbnb: Math.round(totalRevenue * 0.42),
    booking: Math.round(totalRevenue * 0.31),
    direct: Math.round(totalRevenue * 0.19),
    vrbo: Math.round(totalRevenue * 0.08),
  }

  // Property performance
  const properties = [
    { id: 'prop_s3', name: 'Mykonos - Sea Side #3', revenue: { totalRevenue: 34200 }, occupancy: { occupancyRate: 89 }, rating: 4.9 },
    { id: 'prop_s80', name: 'Rose - Sea Side #80', revenue: { totalRevenue: 28400 }, occupancy: { occupancyRate: 82 }, rating: 4.8 },
    { id: 'prop_s29', name: 'Lily - Sea Side #29', revenue: { totalRevenue: 25100 }, occupancy: { occupancyRate: 78 }, rating: 4.7 },
    { id: 'prop_e10', name: 'Mango - Eilat 42 #10', revenue: { totalRevenue: 22800 }, occupancy: { occupancyRate: 75 }, rating: 4.6 },
    { id: 'prop_s111', name: 'Jasmine - Sea Side #111', revenue: { totalRevenue: 19500 }, occupancy: { occupancyRate: 71 }, rating: 4.8 },
    { id: 'prop_s151', name: 'Tulip - Sea Side #151', revenue: { totalRevenue: 17200 }, occupancy: { occupancyRate: 68 }, rating: 4.5 },
    { id: 'prop_e15', name: 'Peach - Eilat 42 #15', revenue: { totalRevenue: 15800 }, occupancy: { occupancyRate: 65 }, rating: 4.4 },
    { id: 'prop_s167', name: 'Lotus - Sea Side #167', revenue: { totalRevenue: 14100 }, occupancy: { occupancyRate: 62 }, rating: 4.6 },
  ]

  // Forecast data
  const forecast = [
    { month: 'February 2026', revenuePrediction: 98400, occupancyPrediction: 71, confidence: 78 },
    { month: 'March 2026', revenuePrediction: 112800, occupancyPrediction: 76, confidence: 72 },
    { month: 'April 2026', revenuePrediction: 145200, occupancyPrediction: 84, confidence: 68 },
  ]

  const avgOccupancy = properties.reduce((sum, p) => sum + p.occupancy.occupancyRate, 0) / properties.length

  return {
    summary: {
      totalRevenue,
      occupancyRate: avgOccupancy,
      averageDailyRate: Math.round(totalRevenue / days / 0.73), // Assuming 73% occupancy
      totalBookings: Math.round(days * 0.73 * 2.5), // ~2.5 bookings per occupied day across all properties
      bookingsTrend: 15.2,
    },
    revenue: {
      total: totalRevenue,
      trend: 12.3,
      adrTrend: 8.1,
      byChannel,
      timeline,
    },
    occupancy: {
      occupancyRate: avgOccupancy,
      trend: 5.2,
      breakdown: [],
    },
    properties,
    forecast,
    period: { from, to },
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  try {
    const { org } = await params

    // For demo, only support 'rently' organization
    if (org !== 'rently') {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Default to last 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const from = searchParams.get('from') || thirtyDaysAgo.toISOString().split('T')[0]
    const to = searchParams.get('to') || now.toISOString().split('T')[0]

    const data = generateDemoData(from, to)

    return NextResponse.json({
      success: true,
      data,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    console.error('[Public Analytics] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// Enable CORS for frontend access
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
