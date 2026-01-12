/**
 * Channel Breakdown Component
 *
 * SVG donut chart showing revenue by booking channel
 * Animated segment spin-in effect
 * Supports Hebrew/English translations
 */

import React, { useState, useMemo } from 'react'

const TRANSLATIONS = {
  en: {
    title: 'Revenue by Channel',
    noData: 'No channel data available',
    total: 'Total',
  },
  he: {
    title: 'הכנסות לפי ערוץ',
    noData: 'אין נתוני ערוצים',
    total: 'סה"כ',
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
 * Calculate arc path for donut segment
 */
function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ')
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  }
}

export default function ChannelBreakdown({ data = [], totalRevenue = 0, lang = 'en' }) {
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const t = TRANSLATIONS[lang]

  // Chart dimensions
  const size = 240
  const cx = size / 2
  const cy = size / 2
  const outerRadius = 90
  const innerRadius = 55
  const strokeWidth = outerRadius - innerRadius

  // Calculate segment angles
  const segments = useMemo(() => {
    if (!data.length) return []

    let currentAngle = 0
    return data.map((item, index) => {
      const angle = (item.percentage / 100) * 360
      const segment = {
        ...item,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        index,
      }
      currentAngle += angle
      return segment
    })
  }, [data])

  // Get center display data
  const centerData = hoveredSegment !== null
    ? segments[hoveredSegment]
    : { percentage: 100, channel: t.total, value: totalRevenue }

  return (
    <div className="channel-breakdown">
      <div className="chart-header">
        <h3 className="chart-title">{t.title}</h3>
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">
          <p>{t.noData}</p>
        </div>
      ) : (
        <div className="donut-container">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="donut-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background circle */}
            <circle
              cx={cx}
              cy={cy}
              r={(outerRadius + innerRadius) / 2}
              fill="none"
              stroke="var(--border)"
              strokeWidth={strokeWidth}
              className="donut-bg"
            />

            {/* Segments */}
            {segments.map((segment, i) => (
              <path
                key={i}
                d={describeArc(cx, cy, (outerRadius + innerRadius) / 2, segment.startAngle, segment.endAngle - 0.5)}
                fill="none"
                stroke={segment.color}
                strokeWidth={hoveredSegment === i ? strokeWidth + 6 : strokeWidth}
                strokeLinecap="butt"
                className={`donut-segment ${hoveredSegment === i ? 'active' : ''}`}
                style={{
                  animationDelay: `${600 + i * 100}ms`,
                  transition: 'stroke-width 0.2s ease',
                }}
                onMouseEnter={() => setHoveredSegment(i)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}

            {/* Center text */}
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              className="donut-center-value"
            >
              {centerData.percentage.toFixed(1)}%
            </text>
            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              className="donut-center-label"
            >
              {centerData.channel}
            </text>
          </svg>

          {/* Legend */}
          <div className="channel-legend">
            {segments.map((segment, i) => (
              <div
                key={i}
                className={`legend-item ${hoveredSegment === i ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSegment(i)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <span
                  className="legend-dot"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="legend-channel">{segment.channel}</span>
                <span className="legend-percent">{segment.percentage.toFixed(0)}%</span>
                <span className="legend-value">{formatCurrency(segment.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
