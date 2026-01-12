/**
 * PRICE INTELLIGENCE PANEL - STATE OF THE ART
 *
 * The complete pricing intelligence experience in one component.
 * Combines calendar heatmap, smart insights, and flexible dates.
 *
 * Usage:
 * <PriceIntelligencePanel
 *   propertyId="prop_123"
 *   checkIn="2026-02-01"
 *   checkOut="2026-02-05"
 *   onDatesChange={(checkIn, checkOut) => {}}
 * />
 */

import React, { useState, useCallback } from 'react'
import { usePriceIntelligence } from '../../hooks/usePriceIntelligence'
import { PriceCalendarHeatmap } from './PriceCalendarHeatmap'
import { SmartInsights } from './SmartInsights'
import { FlexibleDates } from './FlexibleDates'
import { formatPrice } from '../../services/priceIntelligence'
import './PriceIntelligencePanel.css'

/**
 * Price Intelligence Panel Component
 *
 * @param {Object} props
 * @param {string} props.propertyId - Property ID
 * @param {string} [props.checkIn] - Selected check-in date
 * @param {string} [props.checkOut] - Selected check-out date
 * @param {number} [props.guests] - Number of guests
 * @param {Function} [props.onDatesChange] - Callback when dates change
 * @param {boolean} [props.showCalendar] - Show calendar (default true)
 * @param {boolean} [props.showInsights] - Show insights (default true)
 * @param {boolean} [props.showAlternatives] - Show alternatives (default true)
 * @param {string} [props.variant] - 'full' | 'compact' | 'inline'
 */
export function PriceIntelligencePanel({
  propertyId,
  checkIn,
  checkOut,
  guests = 2,
  onDatesChange,
  showCalendar = true,
  showInsights = true,
  showAlternatives = true,
  variant = 'full',
}) {
  const [activeTab, setActiveTab] = useState('insights')

  const {
    data,
    calendar,
    insights,
    scarcity,
    alternatives,
    priceStats,
    requestedDates,
    loading,
    error,
  } = usePriceIntelligence({
    propertyId,
    checkIn,
    checkOut,
    guests,
    flexDays: 5,
    enabled: !!propertyId,
  })

  // Handle date selection from calendar
  const handleDateSelect = useCallback((date) => {
    if (!onDatesChange) return

    // If no check-in or check-out selected, or if selecting earlier date
    if (!checkIn || (checkOut && date < checkIn)) {
      onDatesChange(date, null)
    } else if (!checkOut && date > checkIn) {
      onDatesChange(checkIn, date)
    } else {
      onDatesChange(date, null)
    }
  }, [checkIn, checkOut, onDatesChange])

  // Handle alternative selection
  const handleSelectAlternative = useCallback((alternative) => {
    if (onDatesChange) {
      onDatesChange(alternative.checkIn, alternative.checkOut)
    }
  }, [onDatesChange])

  if (error) {
    return (
      <div className={`price-intelligence-panel ${variant} error`}>
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  // Compact variant - just insights
  if (variant === 'compact') {
    return (
      <div className="price-intelligence-panel compact">
        <SmartInsights
          insights={insights}
          scarcity={scarcity}
          loading={loading}
        />
      </div>
    )
  }

  // Inline variant - horizontal summary
  if (variant === 'inline') {
    return (
      <div className="price-intelligence-panel inline">
        <InlineSummary
          priceStats={priceStats}
          scarcity={scarcity}
          insights={insights}
          loading={loading}
        />
      </div>
    )
  }

  // Full variant - tabbed interface
  return (
    <div className="price-intelligence-panel full">
      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="title-icon">✨</span>
          Smart Pricing
        </h2>
        {priceStats && (
          <div className="price-range">
            {formatPrice(priceStats.min)} — {formatPrice(priceStats.max)}/night
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="panel-tabs">
        {showInsights && (
          <button
            className={`panel-tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <span className="tab-icon">💡</span>
            Insights
          </button>
        )}
        {showCalendar && (
          <button
            className={`panel-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <span className="tab-icon">📅</span>
            Price Calendar
          </button>
        )}
        {showAlternatives && checkIn && checkOut && alternatives.length > 0 && (
          <button
            className={`panel-tab ${activeTab === 'flexible' ? 'active' : ''}`}
            onClick={() => setActiveTab('flexible')}
          >
            <span className="tab-icon">🔄</span>
            Flexible Dates
            {alternatives.filter(a => a.savings > 0).length > 0 && (
              <span className="tab-badge">
                {alternatives.filter(a => a.savings > 0).length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="panel-content">
        {activeTab === 'insights' && showInsights && (
          <SmartInsights
            insights={insights}
            scarcity={scarcity}
            loading={loading}
          />
        )}

        {activeTab === 'calendar' && showCalendar && (
          <PriceCalendarHeatmap
            calendar={calendar}
            priceStats={priceStats}
            onDateSelect={handleDateSelect}
            selectedCheckIn={checkIn}
            selectedCheckOut={checkOut}
          />
        )}

        {activeTab === 'flexible' && showAlternatives && (
          <FlexibleDates
            alternatives={alternatives}
            requestedDates={requestedDates}
            onSelectAlternative={handleSelectAlternative}
            loading={loading}
          />
        )}
      </div>

      {/* Quick insights footer */}
      {scarcity && scarcity.urgencyMessage && activeTab !== 'insights' && (
        <div className="panel-footer">
          <div className="footer-alert">
            <span className="alert-icon">🔥</span>
            <span>{scarcity.urgencyMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Inline Summary Component
 */
function InlineSummary({ priceStats, scarcity, insights, loading }) {
  if (loading) {
    return (
      <div className="inline-summary loading">
        <div className="inline-skeleton" />
      </div>
    )
  }

  const topInsight = insights?.[0]

  return (
    <div className="inline-summary">
      {/* Price range */}
      {priceStats && (
        <div className="inline-stat">
          <span className="inline-value">
            {formatPrice(priceStats.min)} — {formatPrice(priceStats.max)}
          </span>
          <span className="inline-label">per night</span>
        </div>
      )}

      {/* Availability */}
      {scarcity && (
        <div className="inline-stat">
          <span className="inline-value">{scarcity.availabilityPercent}%</span>
          <span className="inline-label">available</span>
        </div>
      )}

      {/* Top insight */}
      {topInsight && (
        <div className="inline-insight">
          <span className="insight-icon">{topInsight.icon}</span>
          <span className="insight-text">{topInsight.title}</span>
        </div>
      )}
    </div>
  )
}

export default PriceIntelligencePanel
