/**
 * FLEXIBLE DATES COMPONENT - STATE OF THE ART
 *
 * Elegant alternative date options with luxury design.
 * Full RTL/Hebrew support with premium animations.
 */

import React, { useState } from 'react'
import { formatPrice, formatDate, getSavingsMessage } from '../../services/priceIntelligence'
import './FlexibleDates.css'

// Elegant SVG Icons (no generic emojis)
const Icons = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <path d="M12 14l-2 2 2 2m0-4l2 2-2 2"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  thumbsUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6L8 10L12 6"/>
    </svg>
  ),
  select: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 10L9.5 12L12.5 8"/>
      <circle cx="10" cy="10" r="7.5"/>
    </svg>
  ),
}

// Hebrew translations
const translations = {
  en: {
    flexibleDates: 'Flexible with dates?',
    foundOptions: (count) => `We found ${count} cheaper option${count !== 1 ? 's' : ''}`,
    saveUpTo: 'Save up to',
    yourSelection: 'Your selection',
    greatDates: 'Great dates!',
    bestRate: "You've selected the best available rate",
    nights: 'nights',
    night: '/night',
    showMore: (count) => `Show ${count} more options`,
    showLess: 'Show less',
    bestValue: 'Best Value',
    cheapest: 'Lowest Price',
    recommended: 'Recommended',
  },
  he: {
    flexibleDates: 'גמישים בתאריכים?',
    foundOptions: (count) => `מצאנו ${count} אפשרויות זולות יותר`,
    saveUpTo: 'חסכו עד',
    yourSelection: 'הבחירה שלך',
    greatDates: 'תאריכים מעולים!',
    bestRate: 'בחרת את המחיר הטוב ביותר',
    nights: 'לילות',
    night: '/לילה',
    showMore: (count) => `הצג עוד ${count} אפשרויות`,
    showLess: 'הצג פחות',
    bestValue: 'הכי משתלם',
    cheapest: 'המחיר הנמוך',
    recommended: 'מומלץ',
  },
}

/**
 * Flexible Dates Component
 *
 * @param {Object} props
 * @param {Array} props.alternatives - Alternative date options
 * @param {Object} props.requestedDates - Originally requested dates
 * @param {Function} props.onSelectAlternative - Callback when alternative is selected
 * @param {boolean} props.loading - Initial loading state
 * @param {boolean} props.isRefreshing - Background refresh state
 * @param {string} props.language - 'en' or 'he' for localization
 */
export function FlexibleDates({
  alternatives = [],
  requestedDates,
  onSelectAlternative,
  loading,
  isRefreshing,
  language = 'en',
}) {
  const [expanded, setExpanded] = useState(false)
  const isRTL = language === 'he'
  const t = translations[language] || translations.en

  if (loading) {
    return (
      <div className={`flexible-dates loading ${isRTL ? 'rtl' : ''}`}>
        <div className="flex-skeleton header" />
        <div className="flex-skeleton item" />
        <div className="flex-skeleton item" />
      </div>
    )
  }

  // Filter to only show alternatives with savings
  const withSavings = alternatives.filter(a => a.savings > 0)

  if (!withSavings.length) {
    // Show a "no alternatives" message if we have requestedDates but no savings
    if (requestedDates) {
      return (
        <div className={`flexible-dates no-alternatives ${isRTL ? 'rtl' : ''}`}>
          <div className="flex-header compact">
            <div className="flex-icon success">
              {Icons.check}
            </div>
            <div className="flex-title">
              <h3>{t.greatDates}</h3>
              <p>{t.bestRate}</p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const bestAlternative = withSavings[0]
  const showMore = withSavings.length > 3

  return (
    <div className={`flexible-dates ${isRefreshing ? 'refreshing' : ''} ${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="flex-header">
        <div className="flex-icon">
          {Icons.calendar}
        </div>
        <div className="flex-title">
          <h3>{t.flexibleDates}</h3>
          <p>{t.foundOptions(withSavings.length)}</p>
        </div>
        {bestAlternative && (
          <div className="flex-best-savings">
            {t.saveUpTo} {formatPrice(bestAlternative.savings)}
          </div>
        )}
      </div>

      {/* Current selection (for comparison) */}
      {requestedDates && (
        <div className="current-selection">
          <div className="selection-label">{t.yourSelection}</div>
          <div className="selection-dates">
            {formatDate(requestedDates.checkIn, 'short', language)} — {formatDate(requestedDates.checkOut, 'short', language)}
          </div>
          <div className="selection-price">
            {formatPrice(requestedDates.totalPrice)}
          </div>
        </div>
      )}

      {/* Alternatives list */}
      <div className="alternatives-list">
        {(expanded ? withSavings : withSavings.slice(0, 3)).map((alt, index) => (
          <AlternativeCard
            key={`${alt.checkIn}-${alt.checkOut}`}
            alternative={alt}
            index={index}
            onSelect={() => onSelectAlternative?.(alt)}
            language={language}
          />
        ))}
      </div>

      {/* Show more button */}
      {showMore && (
        <button
          className="show-more-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t.showLess : t.showMore(withSavings.length - 3)}
          <span className={`chevron-icon ${expanded ? 'expanded' : ''}`}>
            {Icons.chevron}
          </span>
        </button>
      )}
    </div>
  )
}

/**
 * Get badge icon and label
 */
function getBadgeContent(badge, t) {
  switch (badge) {
    case 'best_value':
      return { icon: Icons.star, label: t.bestValue }
    case 'cheapest':
      return { icon: Icons.tag, label: t.cheapest }
    case 'recommended':
      return { icon: Icons.thumbsUp, label: t.recommended }
    default:
      return null
  }
}

/**
 * Alternative Date Card
 */
function AlternativeCard({ alternative, index, onSelect, language }) {
  const t = translations[language] || translations.en
  const isRTL = language === 'he'
  const savingsMsg = getSavingsMessage(alternative.savings, alternative.savingsPercent)
  const badgeContent = getBadgeContent(alternative.badge, t)

  return (
    <div
      className={`alternative-card ${alternative.badge ? `badge-${alternative.badge}` : ''}`}
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={onSelect}
    >
      {/* Badge */}
      {badgeContent && (
        <div className="alt-badge">
          <span className="badge-icon">{badgeContent.icon}</span>
          <span>{badgeContent.label}</span>
        </div>
      )}

      {/* Date range */}
      <div className="alt-dates">
        <span className="alt-date-range">
          {formatDate(alternative.checkIn, 'short', language)} — {formatDate(alternative.checkOut, 'short', language)}
        </span>
        <span className="alt-nights">{alternative.nights} {t.nights}</span>
      </div>

      {/* Pricing */}
      <div className="alt-pricing">
        <div className="alt-total">{formatPrice(alternative.totalPrice)}</div>
        <div className="alt-per-night">
          {formatPrice(alternative.averageNightly)}{t.night}
        </div>
      </div>

      {/* Savings */}
      {savingsMsg && (
        <div className="alt-savings">
          <span className="savings-amount">{savingsMsg}</span>
        </div>
      )}

      {/* Select indicator */}
      <div className="alt-select">
        {Icons.select}
      </div>
    </div>
  )
}

export default FlexibleDates
