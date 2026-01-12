/**
 * Property Rankings Component
 *
 * Sortable table showing top performing properties
 * Staggered row reveal animation
 * Supports Hebrew/English translations
 */

import React, { useState, useMemo } from 'react'

const TRANSLATIONS = {
  en: {
    title: 'Property Performance',
    noData: 'No property data available',
    revenue: 'Revenue',
    occupancy: 'Occupancy',
    rating: 'Rating',
  },
  he: {
    title: 'ביצועי נכסים',
    noData: 'אין נתוני נכסים',
    revenue: 'הכנסות',
    occupancy: 'תפוסה',
    rating: 'דירוג',
  },
}

/**
 * Format currency
 */
function formatCurrency(value) {
  if (value >= 1000000) return `₪${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `₪${(value / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}K`
  return `₪${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * Star rating display
 */
function StarRating({ rating }) {
  return (
    <span className="star-rating">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  )
}

/**
 * Progress bar showing relative performance
 */
function ProgressBar({ value, max }) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default function PropertyRankings({ properties = [], period, lang = 'en' }) {
  const [sortBy, setSortBy] = useState('revenue')
  const t = TRANSLATIONS[lang]

  const SORT_OPTIONS = [
    { value: 'revenue', label: t.revenue },
    { value: 'occupancy', label: t.occupancy },
    { value: 'rating', label: t.rating },
  ]

  // Sort properties
  const sortedProperties = useMemo(() => {
    const sorted = [...properties]

    switch (sortBy) {
      case 'occupancy':
        sorted.sort((a, b) => (b.occupancy?.occupancyRate || 0) - (a.occupancy?.occupancyRate || 0))
        break
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'revenue':
      default:
        sorted.sort((a, b) => (b.revenue?.totalRevenue || 0) - (a.revenue?.totalRevenue || 0))
    }

    return sorted.slice(0, 10)
  }, [properties, sortBy])

  // Get max values for progress bars
  const maxRevenue = Math.max(...sortedProperties.map(p => p.revenue?.totalRevenue || 0), 1)
  const maxOccupancy = 100
  const maxRating = 5

  // Get current max for progress bar based on sort
  const getProgressValue = (property) => {
    switch (sortBy) {
      case 'occupancy':
        return { value: property.occupancy?.occupancyRate || 0, max: maxOccupancy }
      case 'rating':
        return { value: property.rating || 0, max: maxRating }
      default:
        return { value: property.revenue?.totalRevenue || 0, max: maxRevenue }
    }
  }

  return (
    <div className="property-rankings">
      <div className="rankings-header">
        <h3 className="chart-title">{t.title}</h3>
        <div className="sort-controls">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`sort-btn ${sortBy === opt.value ? 'active' : ''}`}
              onClick={() => setSortBy(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {sortedProperties.length === 0 ? (
        <div className="chart-empty">
          <p>{t.noData}</p>
        </div>
      ) : (
        <div className="rankings-table">
          {sortedProperties.map((property, index) => {
            const progress = getProgressValue(property)
            return (
              <div
                key={property.id || index}
                className="ranking-row"
                style={{ animationDelay: `${700 + index * 60}ms` }}
              >
                <span className="rank-number">{index + 1}</span>

                <div className="property-info">
                  <span className="property-name">{property.name}</span>
                  <ProgressBar value={progress.value} max={progress.max} />
                </div>

                <div className="property-stats">
                  <span className="stat revenue">
                    {formatCurrency(property.revenue?.totalRevenue || 0)}
                  </span>
                  <span className="stat occupancy">
                    {(property.occupancy?.occupancyRate || 0).toFixed(0)}%
                  </span>
                  <span className="stat rating">
                    <StarRating rating={property.rating || 0} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
