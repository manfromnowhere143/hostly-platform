/**
 * Summary Cards Component
 *
 * Four metric cards with staggered reveal animations
 * Displays: Revenue, Occupancy, ADR, Bookings
 * Supports Hebrew/English translations
 */

import React from 'react'

const TRANSLATIONS = {
  en: {
    totalRevenue: 'Total Revenue',
    occupancyRate: 'Occupancy Rate',
    averageDailyRate: 'Average Daily Rate',
    totalBookings: 'Total Bookings',
    vsPrevPeriod: 'vs prev period',
  },
  he: {
    totalRevenue: 'הכנסות כולל',
    occupancyRate: 'תפוסה',
    averageDailyRate: 'מחיר ממוצע ללילה',
    totalBookings: 'הזמנות',
    vsPrevPeriod: 'לעומת תקופה קודמת',
  },
}

/**
 * Format currency (ILS)
 */
function formatCurrency(value) {
  if (value >= 1000000) {
    return `₪${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `₪${(value / 1000).toFixed(0)}K`
  }
  return `₪${value.toFixed(0)}`
}

/**
 * Format percentage
 */
function formatPercent(value) {
  return `${value.toFixed(1)}%`
}

/**
 * Trend badge component
 */
function TrendBadge({ value, inverted = false }) {
  if (value === 0 || value === undefined || value === null) {
    return <span className="trend-badge trend-neutral">—</span>
  }

  const isPositive = inverted ? value < 0 : value > 0
  const direction = isPositive ? 'up' : 'down'
  const className = isPositive ? 'trend-positive' : 'trend-negative'

  return (
    <span className={`trend-badge ${className}`}>
      <svg
        className="trend-arrow"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        {direction === 'up' ? (
          <path d="M6 2L10 7H2L6 2Z" />
        ) : (
          <path d="M6 10L2 5H10L6 10Z" />
        )}
      </svg>
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

/**
 * Individual metric card
 */
function MetricCard({ label, value, trend, delay, icon, periodLabel }) {
  return (
    <div
      className="summary-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="card-header">
        <span className="card-label">{label}</span>
        {icon && <span className="card-icon">{icon}</span>}
      </div>
      <div className="card-value">{value}</div>
      <div className="card-footer">
        <TrendBadge value={trend} />
        <span className="card-period">{periodLabel}</span>
      </div>
    </div>
  )
}

export default function SummaryCards({
  totalRevenue,
  occupancyRate,
  averageDailyRate,
  totalBookings,
  trends = {},
  lang = 'en',
}) {
  const t = TRANSLATIONS[lang]

  const cards = [
    {
      label: t.totalRevenue,
      value: formatCurrency(totalRevenue),
      trend: trends.revenue,
      icon: '₪',
    },
    {
      label: t.occupancyRate,
      value: formatPercent(occupancyRate),
      trend: trends.occupancy,
      icon: '%',
    },
    {
      label: t.averageDailyRate,
      value: formatCurrency(averageDailyRate),
      trend: trends.adr,
      icon: '⌀',
    },
    {
      label: t.totalBookings,
      value: totalBookings.toString(),
      trend: trends.bookings,
      icon: '#',
    },
  ]

  return (
    <div className="summary-cards">
      {cards.map((card, index) => (
        <MetricCard
          key={card.label}
          label={card.label}
          value={card.value}
          trend={card.trend}
          delay={200 + index * 80}
          icon={card.icon}
          periodLabel={t.vsPrevPeriod}
        />
      ))}
    </div>
  )
}
