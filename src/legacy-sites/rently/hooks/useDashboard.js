/**
 * useDashboard Hook
 *
 * State-of-the-art data fetching for Host Dashboard
 * Handles loading, error states, and data transformation
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  fetchAllAnalytics,
  transformChannelData,
  transformRevenueTimeline,
  generateAlerts,
  getDateRange,
} from '../services/dashboard'

/**
 * Main dashboard data hook
 */
export function useDashboard(period = '30d') {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const dateRange = useMemo(() => getDateRange(period), [period])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { from, to } = dateRange

      // Fetch all data from single endpoint
      const analyticsData = await fetchAllAnalytics(from, to)

      // Transform data for charts
      const channelData = transformChannelData(analyticsData.revenue)
      const revenueTimeline = transformRevenueTimeline(analyticsData.revenue)

      // Combine all data
      const combinedData = {
        summary: analyticsData.summary || {
          totalRevenue: 0,
          occupancyRate: 0,
          averageDailyRate: 0,
          totalBookings: 0,
        },
        revenue: analyticsData.revenue || { total: 0, trend: 0, byChannel: {} },
        occupancy: analyticsData.occupancy || { occupancyRate: 0, breakdown: [] },
        forecast: analyticsData.forecast || [],
        properties: analyticsData.properties || [],
        // Transformed data for charts
        channelData,
        revenueTimeline,
        alerts: [],
        period: analyticsData.period || { from, to },
        // Data source info
        source: analyticsData.source || 'unknown',
        meta: analyticsData.meta || null,
      }

      // Generate smart alerts
      combinedData.alerts = generateAlerts(combinedData)

      setData(combinedData)
    } catch (err) {
      console.error('[useDashboard] Error:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    period,
    dateRange,
  }
}

export default useDashboard
