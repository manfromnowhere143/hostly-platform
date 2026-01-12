/**
 * Dashboard Skeleton Loading State
 *
 * Premium shimmer effect matching Rently design system
 * Supports Hebrew/English
 */

import React from 'react'

function SkeletonCard({ delay = 0 }) {
  return (
    <div
      className="skeleton-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="skeleton-label shimmer" />
      <div className="skeleton-value shimmer" />
      <div className="skeleton-trend shimmer" />
    </div>
  )
}

function SkeletonChart({ delay = 0, height = 300 }) {
  return (
    <div
      className="skeleton-chart"
      style={{ animationDelay: `${delay}ms`, height }}
    >
      <div className="skeleton-chart-header">
        <div className="skeleton-title shimmer" />
      </div>
      <div className="skeleton-chart-body shimmer" />
    </div>
  )
}

function SkeletonTable({ delay = 0, rows = 5 }) {
  return (
    <div
      className="skeleton-table"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="skeleton-table-header shimmer" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-cell shimmer" style={{ width: '30%' }} />
          <div className="skeleton-cell shimmer" style={{ width: '20%' }} />
          <div className="skeleton-cell shimmer" style={{ width: '15%' }} />
          <div className="skeleton-cell shimmer" style={{ width: '15%' }} />
        </div>
      ))}
    </div>
  )
}

function SkeletonPanel({ delay = 0 }) {
  return (
    <div
      className="skeleton-panel"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="skeleton-title shimmer" />
      <div className="skeleton-content shimmer" />
      <div className="skeleton-content shimmer" style={{ width: '60%' }} />
    </div>
  )
}

export default function DashboardSkeleton({ lang = 'en' }) {
  return (
    <div className="dashboard dashboard-skeleton">
      {/* Header skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-logo shimmer" />
        <div className="skeleton-date-picker shimmer" />
      </div>

      {/* Summary cards row */}
      <div className="skeleton-cards">
        <SkeletonCard delay={0} />
        <SkeletonCard delay={80} />
        <SkeletonCard delay={160} />
        <SkeletonCard delay={240} />
      </div>

      {/* Charts row */}
      <div className="skeleton-charts">
        <div className="skeleton-chart">
          <SkeletonChart delay={300} height={280} />
        </div>
        <div className="skeleton-chart">
          <SkeletonChart delay={380} height={280} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="skeleton-bottom">
        <SkeletonTable delay={460} rows={5} />
        <div className="skeleton-panels">
          <SkeletonPanel delay={540} />
          <SkeletonPanel delay={620} />
        </div>
      </div>
    </div>
  )
}
