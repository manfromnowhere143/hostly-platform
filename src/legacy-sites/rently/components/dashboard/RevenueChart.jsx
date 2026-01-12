/**
 * Revenue Chart Component
 *
 * Pure SVG area chart with gradient fill
 * Animated line draw-in effect
 * Supports Hebrew/English translations
 */

import React, { useState, useMemo } from 'react'

const TRANSLATIONS = {
  en: {
    title: 'Revenue Over Time',
    noData: 'No revenue data available for this period',
  },
  he: {
    title: 'הכנסות לאורך זמן',
    noData: 'אין נתוני הכנסות לתקופה זו',
  },
}

/**
 * Format currency for axis labels
 */
function formatAxisValue(value) {
  if (value >= 1000000) return `₪${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `₪${(value / 1000).toFixed(0)}K`
  return `₪${value}`
}

/**
 * Calculate nice axis ticks
 */
function getAxisTicks(min, max, count = 5) {
  const range = max - min
  const step = range / (count - 1)
  return Array.from({ length: count }, (_, i) => min + step * i)
}

export default function RevenueChart({ data = [], period, lang = 'en' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const t = TRANSLATIONS[lang]

  // Chart dimensions
  const width = 600
  const height = 280
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate scales
  const { xScale, yScale, maxValue, minValue } = useMemo(() => {
    if (!data.length) {
      return { xScale: () => 0, yScale: () => 0, maxValue: 0, minValue: 0 }
    }

    const values = data.map(d => d.value)
    const max = Math.max(...values) * 1.1 || 100
    const min = 0

    return {
      xScale: (index) => (index / (data.length - 1)) * chartWidth,
      yScale: (value) => chartHeight - ((value - min) / (max - min)) * chartHeight,
      maxValue: max,
      minValue: min,
    }
  }, [data, chartWidth, chartHeight])

  // Generate path data
  const { linePath, areaPath } = useMemo(() => {
    if (!data.length) return { linePath: '', areaPath: '' }

    const points = data.map((d, i) => ({
      x: xScale(i),
      y: yScale(d.value),
    }))

    // Smooth curve using Catmull-Rom spline
    const smoothLine = (pts) => {
      if (pts.length < 2) return ''

      let path = `M ${pts[0].x} ${pts[0].y}`

      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = pts[i + 2] || p2

        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
      }

      return path
    }

    const line = smoothLine(points)
    const area = line + ` L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`

    return { linePath: line, areaPath: area }
  }, [data, xScale, yScale, chartHeight])

  // Y-axis ticks
  const yTicks = getAxisTicks(minValue, maxValue, 5)

  // X-axis labels (show ~6 labels)
  const xLabels = useMemo(() => {
    if (!data.length) return []
    const step = Math.max(1, Math.floor(data.length / 6))
    return data.filter((_, i) => i % step === 0 || i === data.length - 1)
  }, [data])

  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <h3 className="chart-title">{t.title}</h3>
        {period && (
          <span className="chart-period">
            {period.from} — {period.to}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">
          <p>{t.noData}</p>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="chart-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient for area fill */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--velvet)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--velvet)" stopOpacity="0.02" />
            </linearGradient>

            {/* Glow filter for line */}
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Grid lines */}
            {yTicks.map((tick, i) => (
              <line
                key={i}
                x1={0}
                y1={yScale(tick)}
                x2={chartWidth}
                y2={yScale(tick)}
                className="grid-line"
              />
            ))}

            {/* Area fill */}
            <path
              d={areaPath}
              className="chart-area"
              fill="url(#areaGradient)"
            />

            {/* Line */}
            <path
              d={linePath}
              className="chart-line"
              fill="none"
              filter="url(#lineGlow)"
            />

            {/* Data points */}
            {data.map((d, i) => (
              <circle
                key={i}
                cx={xScale(i)}
                cy={yScale(d.value)}
                r={hoveredPoint === i ? 6 : 4}
                className={`chart-point ${hoveredPoint === i ? 'active' : ''}`}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            {/* Tooltip */}
            {hoveredPoint !== null && data[hoveredPoint] && (
              <g
                className="chart-tooltip"
                transform={`translate(${xScale(hoveredPoint)}, ${yScale(data[hoveredPoint].value) - 15})`}
              >
                <rect
                  x={-40}
                  y={-25}
                  width={80}
                  height={24}
                  rx={6}
                  className="tooltip-bg"
                />
                <text className="tooltip-text" textAnchor="middle" y={-8}>
                  {formatAxisValue(data[hoveredPoint].value)}
                </text>
              </g>
            )}

            {/* Y-axis labels */}
            {yTicks.map((tick, i) => (
              <text
                key={i}
                x={-10}
                y={yScale(tick)}
                className="axis-label"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatAxisValue(tick)}
              </text>
            ))}

            {/* X-axis labels */}
            {xLabels.map((d, i) => {
              const index = data.indexOf(d)
              return (
                <text
                  key={i}
                  x={xScale(index)}
                  y={chartHeight + 25}
                  className="axis-label"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              )
            })}
          </g>
        </svg>
      )}
    </div>
  )
}
