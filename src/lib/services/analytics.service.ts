/**
 * Analytics Service - State-of-the-Art Business Intelligence
 *
 * Leverages Boom PMS data to provide actionable insights:
 * - Revenue analytics by channel, property, period
 * - Occupancy rates and forecasting
 * - Channel performance metrics
 * - Guest insights and trends
 *
 * @author Claude Code
 * @version 1.0.0
 */

import prisma from '@/lib/db/client'
import { BoomClient, BoomReservation } from '@/lib/integrations/boom/client'

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface RevenueMetrics {
  totalRevenue: number
  accommodationRevenue: number
  cleaningRevenue: number
  extrasRevenue: number
  averageDailyRate: number
  revenuePerAvailableNight: number
  currency: string
}

export interface OccupancyMetrics {
  occupancyRate: number
  bookedNights: number
  availableNights: number
  blockedNights: number
  averageLengthOfStay: number
}

export interface ChannelMetrics {
  channel: string
  reservations: number
  revenue: number
  averageBookingValue: number
  percentage: number
}

export interface PropertyPerformance {
  propertyId: string
  propertyName: string
  revenue: RevenueMetrics
  occupancy: OccupancyMetrics
  topChannel: string
  rating: number
  reviewCount: number
}

export interface AnalyticsDashboard {
  period: {
    from: string
    to: string
  }
  summary: {
    totalRevenue: number
    totalReservations: number
    averageOccupancy: number
    averageDailyRate: number
    totalGuests: number
  }
  revenueByChannel: ChannelMetrics[]
  revenueByProperty: PropertyPerformance[]
  occupancyTrend: Array<{ date: string; rate: number }>
  revenueTrend: Array<{ date: string; amount: number }>
  topPerformers: PropertyPerformance[]
  alerts: AnalyticsAlert[]
}

export interface AnalyticsAlert {
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
  propertyId?: string
  actionUrl?: string
}

export interface ForecastResult {
  period: string
  predictedRevenue: number
  predictedOccupancy: number
  confidence: number
}

interface PropertyWithMetadata {
  id: string
  name: string
  metadata: { boomId?: number } | null
}

// ============================================================================
// Analytics Service Class
// ============================================================================

export class AnalyticsService {
  private boomClient: BoomClient
  private organizationId: string

  constructor(organizationId: string, boomClient: BoomClient) {
    this.organizationId = organizationId
    this.boomClient = boomClient
  }

  // --------------------------------------------------------------------------
  // Revenue Analytics
  // --------------------------------------------------------------------------

  /**
   * Calculate revenue metrics for a given period
   */
  async getRevenueMetrics(
    from: string,
    to: string,
    propertyId?: string
  ): Promise<RevenueMetrics> {
    const reservations = await this.getReservationsForPeriod(from, to, propertyId)

    let totalRevenue = 0
    let accommodationRevenue = 0
    let cleaningRevenue = 0
    let totalNights = 0

    for (const res of reservations) {
      const nightsInPeriod = this.calculateNightsInPeriod(
        res.check_in,
        res.check_out,
        from,
        to
      )

      if (nightsInPeriod > 0) {
        const totalPrice = res.total_price || 0
        const nights = this.daysBetween(res.check_in, res.check_out) || 1
        const pricePerNight = totalPrice / nights
        const revenueInPeriod = pricePerNight * nightsInPeriod

        totalRevenue += revenueInPeriod
        accommodationRevenue += revenueInPeriod * 0.85 // Estimate: 85% accommodation
        totalNights += nightsInPeriod
      }
    }

    cleaningRevenue = totalRevenue * 0.10 // Estimate: 10% cleaning
    const extrasRevenue = totalRevenue - accommodationRevenue - cleaningRevenue

    const availableNights = await this.getAvailableNights(from, to, propertyId)

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      accommodationRevenue: Math.round(accommodationRevenue * 100) / 100,
      cleaningRevenue: Math.round(cleaningRevenue * 100) / 100,
      extrasRevenue: Math.round(extrasRevenue * 100) / 100,
      averageDailyRate: totalNights > 0 ? Math.round((totalRevenue / totalNights) * 100) / 100 : 0,
      revenuePerAvailableNight: availableNights > 0 ? Math.round((totalRevenue / availableNights) * 100) / 100 : 0,
      currency: 'ILS',
    }
  }

  /**
   * Get revenue breakdown by channel
   */
  async getRevenueByChannel(from: string, to: string): Promise<ChannelMetrics[]> {
    const reservations = await this.getReservationsForPeriod(from, to)

    const channelMap = new Map<string, { revenue: number; count: number }>()
    let totalRevenue = 0

    for (const res of reservations) {
      const channel = res.source || 'direct'
      const current = channelMap.get(channel) || { revenue: 0, count: 0 }

      const totalPrice = res.total_price || 0
      const nightsInPeriod = this.calculateNightsInPeriod(res.check_in, res.check_out, from, to)
      const nights = this.daysBetween(res.check_in, res.check_out) || 1
      const pricePerNight = totalPrice / nights
      const revenueInPeriod = pricePerNight * nightsInPeriod

      current.revenue += revenueInPeriod
      current.count += 1
      totalRevenue += revenueInPeriod

      channelMap.set(channel, current)
    }

    const result: ChannelMetrics[] = []
    for (const [channel, data] of channelMap) {
      result.push({
        channel: this.formatChannelName(channel),
        reservations: data.count,
        revenue: Math.round(data.revenue * 100) / 100,
        averageBookingValue: data.count > 0 ? Math.round((data.revenue / data.count) * 100) / 100 : 0,
        percentage: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0,
      })
    }

    return result.sort((a, b) => b.revenue - a.revenue)
  }

  // --------------------------------------------------------------------------
  // Occupancy Analytics
  // --------------------------------------------------------------------------

  /**
   * Calculate occupancy metrics for a given period
   */
  async getOccupancyMetrics(
    from: string,
    to: string,
    propertyId?: string
  ): Promise<OccupancyMetrics> {
    const reservations = await this.getReservationsForPeriod(from, to, propertyId)

    let bookedNights = 0
    let totalStayNights = 0
    let reservationCount = 0

    for (const res of reservations) {
      const nightsInPeriod = this.calculateNightsInPeriod(res.check_in, res.check_out, from, to)
      if (nightsInPeriod > 0) {
        bookedNights += nightsInPeriod
        totalStayNights += this.daysBetween(res.check_in, res.check_out)
        reservationCount++
      }
    }

    const totalNights = await this.getTotalPropertyNights(from, to, propertyId)
    const blockedNights = await this.getBlockedNights(from, to, propertyId)
    const availableNights = totalNights - blockedNights

    return {
      occupancyRate: availableNights > 0 ? Math.round((bookedNights / availableNights) * 100) : 0,
      bookedNights,
      availableNights,
      blockedNights,
      averageLengthOfStay: reservationCount > 0 ? Math.round((totalStayNights / reservationCount) * 10) / 10 : 0,
    }
  }

  /**
   * Get occupancy trend over time
   */
  async getOccupancyTrend(
    from: string,
    to: string,
    granularity: 'day' | 'week' | 'month' = 'day'
  ): Promise<Array<{ date: string; rate: number }>> {
    const reservations = await this.getReservationsForPeriod(from, to)
    const properties = await this.getActiveProperties()
    const propertyCount = properties.length

    const trend: Array<{ date: string; rate: number }> = []
    const current = new Date(from)
    const endDate = new Date(to)

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]

      let occupiedProperties = 0
      for (const res of reservations) {
        if (res.check_in <= dateStr && res.check_out > dateStr) {
          occupiedProperties++
        }
      }

      trend.push({
        date: dateStr,
        rate: propertyCount > 0 ? Math.round((occupiedProperties / propertyCount) * 100) : 0,
      })

      // Advance based on granularity
      if (granularity === 'week') {
        current.setDate(current.getDate() + 7)
      } else if (granularity === 'month') {
        current.setMonth(current.getMonth() + 1)
      } else {
        current.setDate(current.getDate() + 1)
      }
    }

    return trend
  }

  // --------------------------------------------------------------------------
  // Property Performance
  // --------------------------------------------------------------------------

  /**
   * Get performance metrics for all properties
   */
  async getPropertyPerformance(from: string, to: string): Promise<PropertyPerformance[]> {
    const properties = await this.getActiveProperties()
    const performances: PropertyPerformance[] = []

    for (const property of properties) {
      const boomId = (property.metadata as { boomId?: number } | null)?.boomId
      const [revenue, occupancy, reviews] = await Promise.all([
        this.getRevenueMetrics(from, to, property.id),
        this.getOccupancyMetrics(from, to, property.id),
        this.getPropertyReviews(boomId),
      ])

      const channelMetrics = await this.getRevenueByChannel(from, to)
      const topChannel = channelMetrics[0]?.channel || 'N/A'

      performances.push({
        propertyId: property.id,
        propertyName: property.name,
        revenue,
        occupancy,
        topChannel,
        rating: reviews.averageRating,
        reviewCount: reviews.count,
      })
    }

    return performances.sort((a, b) => b.revenue.totalRevenue - a.revenue.totalRevenue)
  }

  // --------------------------------------------------------------------------
  // Complete Dashboard
  // --------------------------------------------------------------------------

  /**
   * Get complete analytics dashboard
   */
  async getDashboard(from: string, to: string): Promise<AnalyticsDashboard> {
    const [
      revenueMetrics,
      occupancyMetrics,
      channelMetrics,
      propertyPerformance,
      occupancyTrend,
    ] = await Promise.all([
      this.getRevenueMetrics(from, to),
      this.getOccupancyMetrics(from, to),
      this.getRevenueByChannel(from, to),
      this.getPropertyPerformance(from, to),
      this.getOccupancyTrend(from, to),
    ])

    const reservations = await this.getReservationsForPeriod(from, to)
    const uniqueGuests = new Set(reservations.map(r => r.guest?.email).filter(Boolean)).size

    // Generate revenue trend
    const revenueTrend = await this.getRevenueTrend(from, to)

    // Get top 5 performers
    const topPerformers = propertyPerformance.slice(0, 5)

    // Generate alerts
    const alerts = await this.generateAlerts(propertyPerformance, occupancyMetrics)

    return {
      period: { from, to },
      summary: {
        totalRevenue: revenueMetrics.totalRevenue,
        totalReservations: reservations.length,
        averageOccupancy: occupancyMetrics.occupancyRate,
        averageDailyRate: revenueMetrics.averageDailyRate,
        totalGuests: uniqueGuests,
      },
      revenueByChannel: channelMetrics,
      revenueByProperty: propertyPerformance,
      occupancyTrend,
      revenueTrend,
      topPerformers,
      alerts,
    }
  }

  // --------------------------------------------------------------------------
  // Forecasting
  // --------------------------------------------------------------------------

  /**
   * Simple revenue and occupancy forecast based on historical data
   */
  async getForecast(months: number = 3): Promise<ForecastResult[]> {
    // Get last 12 months of data for trend analysis
    const now = new Date()
    const yearAgo = new Date(now)
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)

    const historicalData = await this.getMonthlyMetrics(
      yearAgo.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    )

    const forecasts: ForecastResult[] = []

    // Simple moving average + seasonal adjustment
    for (let i = 1; i <= months; i++) {
      const forecastMonth = new Date(now)
      forecastMonth.setMonth(forecastMonth.getMonth() + i)

      // Find same month last year for seasonality
      const sameMonthLastYear = historicalData.find(
        d => new Date(d.month).getMonth() === forecastMonth.getMonth()
      )

      // Calculate average of last 3 months
      const recentMonths = historicalData.slice(-3)
      const avgRevenue = recentMonths.length > 0
        ? recentMonths.reduce((sum, m) => sum + m.revenue, 0) / recentMonths.length
        : 0
      const avgOccupancy = recentMonths.length > 0
        ? recentMonths.reduce((sum, m) => sum + m.occupancy, 0) / recentMonths.length
        : 0

      // Apply seasonal adjustment if we have data
      let seasonalFactor = 1
      if (sameMonthLastYear && recentMonths.length > 0) {
        const yearAvg = historicalData.reduce((sum, m) => sum + m.revenue, 0) / historicalData.length
        seasonalFactor = yearAvg > 0 ? sameMonthLastYear.revenue / yearAvg : 1
      }

      forecasts.push({
        period: forecastMonth.toISOString().split('T')[0].substring(0, 7),
        predictedRevenue: Math.round(avgRevenue * seasonalFactor),
        predictedOccupancy: Math.min(100, Math.round(avgOccupancy * seasonalFactor)),
        confidence: historicalData.length >= 6 ? 0.75 : 0.5, // More data = higher confidence
      })
    }

    return forecasts
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private async getReservationsForPeriod(
    from: string,
    to: string,
    propertyId?: string
  ): Promise<BoomReservation[]> {
    try {
      const boomListingId = propertyId ? await this.getBoomListingId(propertyId) : undefined
      const reservations = await this.boomClient.fetchAllReservations(from, to, {
        listingId: boomListingId,
      })
      return reservations.filter(r => r.status === 'confirmed' || r.status === 'checked_in')
    } catch (error) {
      console.error('[AnalyticsService] Failed to fetch reservations:', error)
      return []
    }
  }

  private async getActiveProperties(): Promise<PropertyWithMetadata[]> {
    const properties = await prisma.property.findMany({
      where: {
        organizationId: this.organizationId,
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        metadata: true,
      },
    })

    return properties.map(p => ({
      id: p.id,
      name: p.name,
      metadata: p.metadata as { boomId?: number } | null,
    }))
  }

  private async getBoomListingId(propertyId: string): Promise<number | undefined> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { metadata: true },
    })
    const metadata = property?.metadata as { boomId?: number } | null
    return metadata?.boomId
  }

  private async getPropertyReviews(boomListingId: number | undefined): Promise<{ averageRating: number; count: number }> {
    if (!boomListingId) {
      return { averageRating: 0, count: 0 }
    }

    try {
      const response = await this.boomClient.getReviews(boomListingId.toString())
      const reviews = response.reviews || []

      if (reviews.length === 0) {
        return { averageRating: 0, count: 0 }
      }

      // Use API average if available, otherwise calculate
      if (response.average_rating !== undefined) {
        return {
          averageRating: Math.round(response.average_rating * 10) / 10,
          count: response.total_count || reviews.length,
        }
      }

      const totalRating = reviews.reduce((sum: number, r) => sum + (r.rating || 0), 0)
      return {
        averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
        count: reviews.length,
      }
    } catch {
      return { averageRating: 0, count: 0 }
    }
  }

  private async getAvailableNights(from: string, to: string, propertyId?: string): Promise<number> {
    const properties = propertyId
      ? [{ id: propertyId }]
      : await this.getActiveProperties()

    const totalDays = this.daysBetween(from, to)
    return totalDays * properties.length
  }

  private async getTotalPropertyNights(from: string, to: string, propertyId?: string): Promise<number> {
    return this.getAvailableNights(from, to, propertyId)
  }

  private async getBlockedNights(from: string, to: string, propertyId?: string): Promise<number> {
    // Query CalendarDay for blocked dates
    const where: {
      organizationId: string
      date: { gte: Date; lte: Date }
      status: string
      propertyId?: string
    } = {
      organizationId: this.organizationId,
      date: { gte: new Date(from), lte: new Date(to) },
      status: 'blocked',
    }

    if (propertyId) {
      where.propertyId = propertyId
    }

    const blockedCount = await prisma.calendarDay.count({ where })
    return blockedCount
  }

  private async getRevenueTrend(from: string, to: string): Promise<Array<{ date: string; amount: number }>> {
    const reservations = await this.getReservationsForPeriod(from, to)
    const trend: Map<string, number> = new Map()

    for (const res of reservations) {
      const totalPrice = res.total_price || 0
      const nights = this.daysBetween(res.check_in, res.check_out) || 1
      const pricePerNight = totalPrice / nights

      const start = new Date(Math.max(new Date(res.check_in).getTime(), new Date(from).getTime()))
      const end = new Date(Math.min(new Date(res.check_out).getTime(), new Date(to).getTime()))

      const current = new Date(start)
      while (current < end) {
        const dateStr = current.toISOString().split('T')[0]
        trend.set(dateStr, (trend.get(dateStr) || 0) + pricePerNight)
        current.setDate(current.getDate() + 1)
      }
    }

    return Array.from(trend.entries())
      .map(([date, amount]) => ({ date, amount: Math.round(amount) }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private async getMonthlyMetrics(from: string, to: string): Promise<Array<{ month: string; revenue: number; occupancy: number }>> {
    const results: Array<{ month: string; revenue: number; occupancy: number }> = []

    const current = new Date(from)
    const end = new Date(to)

    while (current <= end) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)

      const [revenue, occupancy] = await Promise.all([
        this.getRevenueMetrics(monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]),
        this.getOccupancyMetrics(monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]),
      ])

      results.push({
        month: monthStart.toISOString().split('T')[0].substring(0, 7),
        revenue: revenue.totalRevenue,
        occupancy: occupancy.occupancyRate,
      })

      current.setMonth(current.getMonth() + 1)
    }

    return results
  }

  private async generateAlerts(
    performances: PropertyPerformance[],
    occupancy: OccupancyMetrics
  ): Promise<AnalyticsAlert[]> {
    const alerts: AnalyticsAlert[] = []

    // Low occupancy alert
    if (occupancy.occupancyRate < 50) {
      alerts.push({
        type: 'warning',
        title: 'Low Occupancy',
        message: `Overall occupancy is ${occupancy.occupancyRate}%. Consider adjusting pricing or running promotions.`,
      })
    }

    // High occupancy success
    if (occupancy.occupancyRate > 85) {
      alerts.push({
        type: 'success',
        title: 'Excellent Occupancy',
        message: `Outstanding ${occupancy.occupancyRate}% occupancy! Consider raising rates for premium dates.`,
      })
    }

    // Underperforming properties
    const avgRevenue = performances.length > 0
      ? performances.reduce((sum, p) => sum + p.revenue.totalRevenue, 0) / performances.length
      : 0

    for (const property of performances) {
      if (avgRevenue > 0 && property.revenue.totalRevenue < avgRevenue * 0.5) {
        alerts.push({
          type: 'warning',
          title: 'Underperforming Property',
          message: `${property.propertyName} is generating 50% less revenue than average.`,
          propertyId: property.propertyId,
        })
      }

      // Low rating alert
      if (property.rating > 0 && property.rating < 4.0) {
        alerts.push({
          type: 'warning',
          title: 'Review Score Alert',
          message: `${property.propertyName} has a ${property.rating} rating. Consider addressing guest feedback.`,
          propertyId: property.propertyId,
        })
      }
    }

    return alerts
  }

  private calculateNightsInPeriod(checkIn: string, checkOut: string, from: string, to: string): number {
    const periodStart = new Date(from)
    const periodEnd = new Date(to)
    const resStart = new Date(checkIn)
    const resEnd = new Date(checkOut)

    const overlapStart = new Date(Math.max(periodStart.getTime(), resStart.getTime()))
    const overlapEnd = new Date(Math.min(periodEnd.getTime(), resEnd.getTime()))

    if (overlapStart >= overlapEnd) return 0

    return Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24))
  }

  private daysBetween(from: string, to: string): number {
    const start = new Date(from)
    const end = new Date(to)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  private formatChannelName(source: string): string {
    const channelNames: Record<string, string> = {
      airbnb: 'Airbnb',
      'booking.com': 'Booking.com',
      vrbo: 'VRBO',
      expedia: 'Expedia',
      direct: 'Direct Booking',
      website: 'Website',
      manual: 'Manual Entry',
    }
    return channelNames[source.toLowerCase()] || source
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export async function createAnalyticsService(organizationId: string): Promise<AnalyticsService> {
  // Get Boom credentials from organization settings
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  })

  const settings = organization?.settings as { boom?: { apiKey?: string; hotelId?: string } } | null

  if (!settings?.boom?.apiKey || !settings?.boom?.hotelId) {
    // Fall back to environment variables if no org-specific config
    const boomClient = new BoomClient()
    return new AnalyticsService(organizationId, boomClient)
  }

  // Use environment-based singleton client (credentials from env vars)
  const boomClient = new BoomClient()
  return new AnalyticsService(organizationId, boomClient)
}
