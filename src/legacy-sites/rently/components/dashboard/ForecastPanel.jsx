/**
 * Forecast Panel Component
 *
 * 3-month revenue and occupancy predictions
 * Shows confidence levels for each prediction
 * Supports Hebrew/English translations
 */

import React from 'react'

const TRANSLATIONS = {
  en: {
    title: 'Forecast',
    noData: 'No forecast data available',
    confidence: 'confidence',
    peak: 'Peak',
    revenue: 'Revenue',
    occupancy: 'Occupancy',
  },
  he: {
    title: 'תחזית',
    noData: 'אין נתוני תחזית',
    confidence: 'מהימנות',
    peak: 'שיא',
    revenue: 'הכנסות',
    occupancy: 'תפוסה',
  },
}

/**
 * Format currency
 */
function formatCurrency(value) {
  if (value >= 1000000) return `₪${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `₪${(value / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}K`
  return `₪${value.toFixed(0)}`
}

/**
 * Confidence indicator
 */
function ConfidenceBadge({ value, label }) {
  const level = value >= 75 ? 'high' : value >= 50 ? 'medium' : 'low'
  return (
    <span className={`confidence-badge confidence-${level}`}>
      {value}% {label}
    </span>
  )
}

export default function ForecastPanel({ forecast = [], lang = 'en' }) {
  const t = TRANSLATIONS[lang]

  // Find peak month
  const peakMonth = forecast.reduce((peak, month) =>
    (month.occupancyPrediction || 0) > (peak?.occupancyPrediction || 0) ? month : peak
  , null)

  return (
    <div className="forecast-panel panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          {t.title}
        </h3>
      </div>

      {forecast.length === 0 ? (
        <div className="panel-empty">
          <p>{t.noData}</p>
        </div>
      ) : (
        <div className="forecast-list">
          {forecast.map((month, index) => {
            const isPeak = peakMonth && month.month === peakMonth.month
            return (
              <div
                key={month.month || index}
                className={`forecast-item ${isPeak ? 'peak' : ''}`}
                style={{ animationDelay: `${900 + index * 80}ms` }}
              >
                <div className="forecast-month">
                  <span className="month-name">
                    {month.month}
                    {isPeak && <span className="peak-badge">{t.peak}</span>}
                  </span>
                  <ConfidenceBadge value={month.confidence || 70} label={t.confidence} />
                </div>

                <div className="forecast-metrics">
                  <div className="forecast-metric">
                    <span className="metric-label">{t.revenue}</span>
                    <span className="metric-value">
                      {formatCurrency(month.revenuePrediction || 0)}
                    </span>
                  </div>
                  <div className="forecast-metric">
                    <span className="metric-label">{t.occupancy}</span>
                    <span className="metric-value">
                      {(month.occupancyPrediction || 0).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="forecast-bar">
                  <div
                    className="forecast-bar-fill"
                    style={{ width: `${month.occupancyPrediction || 0}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
