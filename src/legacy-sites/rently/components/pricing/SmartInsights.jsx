/**
 * SMART INSIGHTS COMPONENT - STATE OF THE ART
 *
 * Elegant AI-generated pricing insights with luxury design.
 * Full RTL/Hebrew support with premium animations.
 */

import React from 'react'
import './SmartInsights.css'

// Elegant SVG Icons (no generic emojis)
const Icons = {
  fire: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c.5 2.5 2 4 3 6 1 2 1 4-1 6-2-1-3-3-3-5 0 3-2 5-4 6-2 1-3-1-3-3 0-3 2-5 4-6-1-1-1-3 0-4 1 1 3 1 4 0z"/>
    </svg>
  ),
  trend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  tip: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  recommendation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  gauge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10"/>
      <path d="M12 12l4-4"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
}

// Hebrew translations
const translations = {
  en: {
    highDemand: 'High Demand',
    available: 'available',
    lowDemand: 'Low demand',
    moderateDemand: 'Moderate demand',
    highDemandLabel: 'High demand',
    veryHighDemand: 'Very high demand',
    bookingPressure: 'Booking Pressure',
    availableDays: 'Available (30 days)',
    weekendsOpen: 'Weekends open',
  },
  he: {
    highDemand: 'ביקוש גבוה',
    available: 'פנוי',
    lowDemand: 'ביקוש נמוך',
    moderateDemand: 'ביקוש בינוני',
    highDemandLabel: 'ביקוש גבוה',
    veryHighDemand: 'ביקוש גבוה מאוד',
    bookingPressure: 'לחץ הזמנות',
    availableDays: 'פנוי (30 יום)',
    weekendsOpen: 'סופי שבוע פנויים',
  },
}

// Translate insight messages from API (English) to Hebrew
const insightTranslations = {
  // Titles
  'Better dates available': 'תאריכים טובים יותר זמינים',
  'Prices are lower than usual': 'המחירים נמוכים מהרגיל',
  'Prices are higher than usual': 'המחירים גבוהים מהרגיל',
  'High demand period': 'תקופת ביקוש גבוה',
  'Low demand period': 'תקופת ביקוש נמוך',
  'Weekend premium': 'תוספת סוף שבוע',
  'Holiday pricing': 'תמחור חג',
  // Description patterns
  'Current prices are': 'המחירים הנוכחיים',
  'below the 90-day average': 'מתחת לממוצע 90 יום',
  'above the 90-day average': 'מעל לממוצע 90 יום',
  'Shift to': 'עבור ל',
  'Save': 'חסוך',
}

function translateInsight(text, language) {
  if (language !== 'he' || !text) return text

  let translated = text
  // Replace known patterns
  Object.entries(insightTranslations).forEach(([en, he]) => {
    translated = translated.replace(new RegExp(en, 'gi'), he)
  })
  return translated
}

/**
 * Smart Insights Component
 *
 * @param {Object} props
 * @param {Array} props.insights - Array of insight objects
 * @param {Object} props.scarcity - Scarcity metrics
 * @param {boolean} props.loading - Initial loading state
 * @param {boolean} props.isRefreshing - Background refresh state
 * @param {string} props.language - 'en' or 'he' for localization
 */
export function SmartInsights({
  insights = [],
  scarcity,
  loading,
  isRefreshing,
  language = 'en'
}) {
  const isRTL = language === 'he'
  const t = translations[language] || translations.en

  if (loading) {
    return (
      <div className={`smart-insights loading ${isRTL ? 'rtl' : ''}`}>
        <div className="insight-skeleton" />
        <div className="insight-skeleton" />
      </div>
    )
  }

  if (!insights.length && !scarcity?.urgencyMessage) {
    return null
  }

  return (
    <div className={`smart-insights ${isRefreshing ? 'refreshing' : ''} ${isRTL ? 'rtl' : ''}`}>
      {/* Urgency banner (high priority) */}
      {scarcity?.bookingPressure === 'very_high' && (
        <div className="urgency-banner">
          <div className="urgency-icon">
            {Icons.fire}
          </div>
          <div className="urgency-content">
            <h4 className="urgency-title">{t.highDemand}</h4>
            <p className="urgency-text">{scarcity.urgencyMessage}</p>
          </div>
          <div className="urgency-badge">
            {scarcity.availabilityPercent}% {t.available}
          </div>
        </div>
      )}

      {/* Insights list */}
      {insights.length > 0 && (
        <div className="insights-list">
          {insights.slice(0, 4).map((insight, index) => (
            <InsightCard
              key={index}
              insight={insight}
              index={index}
              language={language}
            />
          ))}
        </div>
      )}

      {/* Scarcity indicator (if not high) */}
      {scarcity && scarcity.bookingPressure !== 'very_high' && (
        <div className="scarcity-indicator">
          <BookingPressureMeter
            pressure={scarcity.bookingPressure}
            language={language}
          />
          <div className="scarcity-stats">
            <div className="scarcity-stat">
              <span className="stat-value">{scarcity.availabilityPercent}%</span>
              <span className="stat-label">{t.availableDays}</span>
            </div>
            <div className="scarcity-stat">
              <span className="stat-value">
                {scarcity.totalWeekends - scarcity.bookedWeekends}/{scarcity.totalWeekends}
              </span>
              <span className="stat-label">{t.weekendsOpen}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Get SVG icon for insight type
 */
function getInsightIcon(type) {
  const iconMap = {
    trend: Icons.trend,
    tip: Icons.tip,
    alert: Icons.alert,
    recommendation: Icons.recommendation,
  }
  return iconMap[type] || Icons.tip
}

/**
 * Individual Insight Card
 */
function InsightCard({ insight, index, language }) {
  return (
    <div
      className="insight-card"
      data-type={insight.type}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="insight-icon">
        {getInsightIcon(insight.type)}
      </div>
      <div className="insight-content">
        <h4 className="insight-title">{translateInsight(insight.title, language)}</h4>
        <p className="insight-description">{translateInsight(insight.description, language)}</p>
      </div>
      {insight.impact && (
        <div className="insight-impact">{translateInsight(insight.impact, language)}</div>
      )}
    </div>
  )
}

/**
 * Booking Pressure Visual Meter
 */
function BookingPressureMeter({ pressure, language }) {
  const t = translations[language] || translations.en

  const levels = {
    low: { width: '25%', color: '#22c55e', label: t.lowDemand },
    medium: { width: '50%', color: '#f59e0b', label: t.moderateDemand },
    high: { width: '75%', color: '#f97316', label: t.highDemandLabel },
    very_high: { width: '100%', color: '#ef4444', label: t.veryHighDemand },
  }

  const level = levels[pressure] || levels.low

  return (
    <div className="pressure-meter">
      <div className="pressure-label">
        {Icons.gauge}
        <span>{t.bookingPressure}</span>
      </div>
      <div className="pressure-bar">
        <div
          className="pressure-fill"
          style={{
            width: level.width,
            background: `linear-gradient(90deg, ${level.color}88, ${level.color})`,
          }}
        />
      </div>
      <div className="pressure-level-label" style={{ color: level.color }}>
        {level.label}
      </div>
    </div>
  )
}

export default SmartInsights
