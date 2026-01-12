/**
 * PRICE CALENDAR HEATMAP - STATE OF THE ART
 *
 * Beautiful visual calendar showing price variations.
 * Colors indicate price levels: green (low) to red (peak).
 * Airbnb-level design with smooth animations.
 */

import React, { useState, useMemo } from 'react'
import { formatPrice, getPriceLevelColor, formatDate } from '../../services/priceIntelligence'
import './PriceCalendarHeatmap.css'

/**
 * Price Calendar Heatmap Component
 *
 * @param {Object} props
 * @param {Array} props.calendar - Calendar data from price intelligence
 * @param {Object} props.priceStats - Price statistics
 * @param {Function} [props.onDateSelect] - Callback when date is selected
 * @param {string} [props.selectedCheckIn] - Currently selected check-in
 * @param {string} [props.selectedCheckOut] - Currently selected check-out
 */
export function PriceCalendarHeatmap({
  calendar = [],
  priceStats,
  onDateSelect,
  selectedCheckIn,
  selectedCheckOut,
}) {
  const [hoveredDate, setHoveredDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(0) // 0 = current, 1 = next, 2 = +2

  // Group calendar by weeks for display
  const calendarWeeks = useMemo(() => {
    if (!calendar.length) return []

    // Get start of current week (Sunday)
    const firstDate = new Date(calendar[0].date)
    const startOfWeek = new Date(firstDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    const weeks = []
    let currentWeek = []

    // Add padding for days before first date
    const daysBefore = firstDate.getDay()
    for (let i = 0; i < daysBefore; i++) {
      currentWeek.push(null)
    }

    // Add all calendar days
    for (const day of calendar) {
      currentWeek.push(day)

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }

    return weeks
  }, [calendar])

  // Get visible weeks based on current month
  const visibleWeeks = useMemo(() => {
    const weeksPerMonth = 5
    const start = currentMonth * weeksPerMonth
    return calendarWeeks.slice(start, start + weeksPerMonth)
  }, [calendarWeeks, currentMonth])

  // Get month label
  const monthLabel = useMemo(() => {
    if (!visibleWeeks.length) return ''

    const firstDay = visibleWeeks[0]?.find(d => d !== null)
    if (!firstDay) return ''

    const date = new Date(firstDay.date)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [visibleWeeks])

  // Check if date is in selected range
  const isInRange = (dateStr) => {
    if (!selectedCheckIn || !selectedCheckOut) return false
    return dateStr >= selectedCheckIn && dateStr < selectedCheckOut
  }

  const isCheckIn = (dateStr) => dateStr === selectedCheckIn
  const isCheckOut = (dateStr) => dateStr === selectedCheckOut

  // Handle date click
  const handleDateClick = (day) => {
    if (!day || !day.available || !onDateSelect) return
    onDateSelect(day.date)
  }

  // Hovered date info
  const hoveredDay = hoveredDate
    ? calendar.find(d => d.date === hoveredDate)
    : null

  return (
    <div className="price-calendar-heatmap">
      {/* Header */}
      <div className="heatmap-header">
        <button
          className="month-nav"
          onClick={() => setCurrentMonth(Math.max(0, currentMonth - 1))}
          disabled={currentMonth === 0}
          aria-label="Previous month"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h3 className="month-label">{monthLabel}</h3>

        <button
          className="month-nav"
          onClick={() => setCurrentMonth(Math.min(2, currentMonth + 1))}
          disabled={currentMonth >= 2}
          aria-label="Next month"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="weekday-labels">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday-label">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {visibleWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week">
            {week.map((day, dayIndex) => {
              if (!day) {
                return <div key={dayIndex} className="calendar-day empty" />
              }

              const dayNum = new Date(day.date).getDate()
              const inRange = isInRange(day.date)
              const isStart = isCheckIn(day.date)
              const isEnd = isCheckOut(day.date)

              return (
                <div
                  key={day.date}
                  className={`calendar-day ${day.available ? 'available' : 'unavailable'} ${
                    day.isWeekend ? 'weekend' : ''
                  } ${inRange ? 'in-range' : ''} ${isStart ? 'range-start' : ''} ${
                    isEnd ? 'range-end' : ''
                  } ${hoveredDate === day.date ? 'hovered' : ''}`}
                  style={{
                    '--price-color': day.available
                      ? getPriceLevelColor(day.priceLevel, 1)
                      : 'transparent',
                    '--price-bg': day.available
                      ? getPriceLevelColor(day.priceLevel, 0.15)
                      : 'rgba(0,0,0,0.05)',
                  }}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoveredDate(day.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  <span className="day-number">{dayNum}</span>
                  {day.available && (
                    <span className="day-price">
                      {formatPrice(day.price, { compact: true, showCurrency: false })}
                    </span>
                  )}
                  {!day.available && (
                    <span className="day-unavailable">—</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: getPriceLevelColor('low') }} />
          <span>Low</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: getPriceLevelColor('medium') }} />
          <span>Average</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: getPriceLevelColor('high') }} />
          <span>High</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: getPriceLevelColor('peak') }} />
          <span>Peak</span>
        </div>
      </div>

      {/* Price stats */}
      {priceStats && (
        <div className="price-stats">
          <div className="stat">
            <span className="stat-label">Lowest</span>
            <span className="stat-value low">{formatPrice(priceStats.min)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Average</span>
            <span className="stat-value">{formatPrice(priceStats.average)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Highest</span>
            <span className="stat-value high">{formatPrice(priceStats.max)}</span>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredDay && (
        <div className="hover-tooltip">
          <div className="tooltip-date">{formatDate(hoveredDay.date, 'full')}</div>
          {hoveredDay.available ? (
            <>
              <div className="tooltip-price">{formatPrice(hoveredDay.price)}/night</div>
              {hoveredDay.minNights > 1 && (
                <div className="tooltip-min">Min {hoveredDay.minNights} nights</div>
              )}
            </>
          ) : (
            <div className="tooltip-unavailable">Not available</div>
          )}
        </div>
      )}
    </div>
  )
}

export default PriceCalendarHeatmap
