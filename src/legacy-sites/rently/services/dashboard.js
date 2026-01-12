/**
 * Dashboard API Service
 *
 * Connects to Hostly Analytics APIs (Public endpoints)
 * State-of-the-art error handling and data transformation
 */

const API_BASE = 'http://localhost:3000/api/public/rently/analytics'

/**
 * Fetch all analytics data from single endpoint
 */
export async function fetchAllAnalytics(from, to) {
  const url = `${API_BASE}?from=${from}&to=${to}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Unknown API error')
    }

    return data.data
  } catch (error) {
    console.error(`[Dashboard API]:`, error)
    throw error
  }
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Get date range for period
 */
export function getDateRange(period = '30d') {
  const to = new Date()
  const from = new Date()

  switch (period) {
    case '7d':
      from.setDate(from.getDate() - 7)
      break
    case '30d':
      from.setDate(from.getDate() - 30)
      break
    case '90d':
      from.setDate(from.getDate() - 90)
      break
    case '1y':
      from.setFullYear(from.getFullYear() - 1)
      break
    default:
      from.setDate(from.getDate() - 30)
  }

  return {
    from: formatDate(from),
    to: formatDate(to),
  }
}

/**
 * Transform channel data for donut chart
 * Prefers pre-processed channelData from API if available
 */
export function transformChannelData(revenueData) {
  // Use pre-processed data from API if available
  if (revenueData?.channelData && revenueData.channelData.length > 0) {
    return revenueData.channelData
  }

  // Fallback: process byChannel data
  if (!revenueData?.byChannel) return []

  const channelColors = {
    'airbnb': '#FF5A5F',
    'booking': '#003580',
    'booking_com': '#003580',
    'direct': '#b5846d',
    'vrbo': '#3D67FF',
    'expedia': '#FFCC00',
    'other': '#9CA3AF',
  }

  const channelNames = {
    'airbnb': 'Airbnb',
    'booking': 'Booking.com',
    'booking_com': 'Booking.com',
    'direct': 'Direct',
    'vrbo': 'VRBO',
    'expedia': 'Expedia',
  }

  const total = Object.values(revenueData.byChannel).reduce((sum, val) => sum + val, 0)

  return Object.entries(revenueData.byChannel)
    .map(([channel, value]) => ({
      channel: channelNames[channel.toLowerCase()] || channel.charAt(0).toUpperCase() + channel.slice(1),
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: channelColors[channel.toLowerCase()] || channelColors.other,
    }))
    .sort((a, b) => b.value - a.value)
}

/**
 * Transform revenue timeline for area chart
 */
export function transformRevenueTimeline(revenueData) {
  if (!revenueData?.timeline) return []

  return revenueData.timeline.map(point => ({
    date: point.date,
    value: point.revenue || 0,
    label: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
  }))
}

/**
 * Generate smart alerts from analytics data
 */
export function generateAlerts(data) {
  const alerts = []

  // Low occupancy alert
  if (data.occupancy?.occupancyRate < 50) {
    alerts.push({
      id: 'low-occupancy',
      type: 'warning',
      title: 'Low Occupancy',
      message: `Overall occupancy is ${data.occupancy.occupancyRate.toFixed(0)}%. Consider adjusting your pricing strategy.`,
      action: 'Adjust Rates',
    })
  }

  // High rating celebration
  if (data.properties?.some(p => p.rating >= 4.8)) {
    const topRated = data.properties.find(p => p.rating >= 4.8)
    alerts.push({
      id: 'high-rating',
      type: 'success',
      title: 'Excellent Rating',
      message: `${topRated.name} has a ${topRated.rating}★ rating. Great job!`,
    })
  }

  // Revenue trend alert
  if (data.revenue?.trend && data.revenue.trend < -10) {
    alerts.push({
      id: 'revenue-decline',
      type: 'warning',
      title: 'Revenue Declining',
      message: `Revenue is down ${Math.abs(data.revenue.trend).toFixed(1)}% compared to previous period.`,
      action: 'View Analytics',
    })
  }

  // Peak season opportunity
  if (data.forecast?.some(f => f.occupancyPrediction > 80)) {
    const peak = data.forecast.find(f => f.occupancyPrediction > 80)
    alerts.push({
      id: 'peak-opportunity',
      type: 'info',
      title: 'Peak Season Ahead',
      message: `${peak.month} shows ${peak.occupancyPrediction}% predicted occupancy. Consider premium pricing.`,
      action: 'Set Premium Rates',
    })
  }

  return alerts
}

export default {
  fetchAllAnalytics,
  transformChannelData,
  transformRevenueTimeline,
  generateAlerts,
  getDateRange,
}
