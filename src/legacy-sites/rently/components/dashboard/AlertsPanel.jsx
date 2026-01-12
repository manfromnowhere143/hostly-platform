/**
 * Alerts Panel Component
 *
 * Smart notifications and actionable insights
 * Color-coded by alert type
 * Supports Hebrew/English translations
 */

import React from 'react'

const TRANSLATIONS = {
  en: {
    title: 'Alerts',
    welcomeTitle: 'Welcome to Your Dashboard',
    welcomeMessage: 'Track your property performance with real-time analytics.',
  },
  he: {
    title: 'התראות',
    welcomeTitle: 'ברוכים הבאים ללוח הבקרה',
    welcomeMessage: 'עקבו אחר ביצועי הנכסים שלכם עם אנליטיקה בזמן אמת.',
  },
}

/**
 * Alert type icons and colors
 */
const ALERT_TYPES = {
  warning: {
    color: '#f59e0b',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  success: {
    color: '#10b981',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  info: {
    color: '#3b82f6',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  error: {
    color: '#ef4444',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
}

export default function AlertsPanel({ alerts = [], lang = 'en' }) {
  const t = TRANSLATIONS[lang]

  // Default alerts if none provided
  const displayAlerts = alerts.length > 0 ? alerts : [
    {
      id: 'welcome',
      type: 'info',
      title: t.welcomeTitle,
      message: t.welcomeMessage,
    }
  ]

  return (
    <div className="alerts-panel panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {t.title}
        </h3>
        {alerts.length > 0 && (
          <span className="alert-count">{alerts.length}</span>
        )}
      </div>

      <div className="alerts-list">
        {displayAlerts.map((alert, index) => {
          const alertConfig = ALERT_TYPES[alert.type] || ALERT_TYPES.info
          return (
            <div
              key={alert.id || index}
              className={`alert-item alert-${alert.type}`}
              style={{
                animationDelay: `${1000 + index * 80}ms`,
                borderLeftColor: alertConfig.color,
              }}
            >
              <div className="alert-icon" style={{ color: alertConfig.color }}>
                {alertConfig.icon}
              </div>

              <div className="alert-content">
                <span className="alert-title">{alert.title}</span>
                <span className="alert-message">{alert.message}</span>
              </div>

              {alert.action && (
                <button className="alert-action">
                  {alert.action}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
