/**
 * Host Dashboard - State of the Art Analytics
 *
 * Integrated with Rently design system:
 * - Same fonts (Cormorant Garamond, Montserrat, Hebrew fonts)
 * - Same color tokens (velvet, gold, cream)
 * - Full RTL/Hebrew support
 * - Responsive mobile-first design
 * - Airbnb-level polish
 */

import React, { useState, useEffect } from 'react'
import { useDashboard } from '../hooks/useDashboard'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton'
import SummaryCards from '../components/dashboard/SummaryCards'
import RevenueChart from '../components/dashboard/RevenueChart'
import ChannelBreakdown from '../components/dashboard/ChannelBreakdown'
import PropertyRankings from '../components/dashboard/PropertyRankings'
import ForecastPanel from '../components/dashboard/ForecastPanel'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import '../styles/index.css'
import '../styles/dashboard.css'

const PERIOD_OPTIONS = {
  en: [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ],
  he: [
    { value: '7d', label: '7 ימים' },
    { value: '30d', label: '30 יום' },
    { value: '90d', label: '90 יום' },
    { value: '1y', label: 'שנה' },
  ],
}

const TRANSLATIONS = {
  en: {
    title: 'Host Dashboard',
    subtitle: 'Analytics Overview',
    backToSite: 'Back to Site',
    dataUpdated: 'Data updated',
    refresh: 'Refresh',
    errorTitle: 'Unable to Load Dashboard',
    tryAgain: 'Try Again',
  },
  he: {
    title: 'לוח בקרה למארח',
    subtitle: 'סקירת אנליטיקה',
    backToSite: 'חזרה לאתר',
    dataUpdated: 'עודכן',
    refresh: 'רענון',
    errorTitle: 'לא ניתן לטעון את לוח הבקרה',
    tryAgain: 'נסה שוב',
  },
}

export default function Dashboard() {
  const [period, setPeriod] = useState('30d')
  const [lang, setLang] = useState('en')
  const { data, loading, error, refetch } = useDashboard(period)

  const isRTL = lang === 'he'
  const t = TRANSLATIONS[lang]
  const periodOptions = PERIOD_OPTIONS[lang]

  // Persist language preference
  useEffect(() => {
    const saved = localStorage.getItem('rently-lang')
    if (saved === 'he' || saved === 'en') {
      setLang(saved)
    }
  }, [])

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'he' : 'en'
    setLang(newLang)
    localStorage.setItem('rently-lang', newLang)
  }

  // Show skeleton while loading
  if (loading) {
    return (
      <div className={`rently white ${isRTL ? 'rtl' : 'ltr'}`}>
        <DashboardSkeleton lang={lang} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`rently white ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="dashboard dashboard-error">
          <div className="error-container">
            <h2>{t.errorTitle}</h2>
            <p>{error}</p>
            <button onClick={refetch} className="btn-retry">
              {t.tryAgain}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rently white ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <h1 className="dashboard-title">{t.title}</h1>
            <span className="dashboard-subtitle">{t.subtitle}</span>
          </div>

          <div className="dashboard-controls">
            {/* Period Selector */}
            <div className="period-selector">
              {periodOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`period-btn ${period === opt.value ? 'active' : ''}`}
                  onClick={() => setPeriod(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Language Toggle */}
            <button onClick={toggleLang} className="lang-toggle" aria-label="Toggle language">
              <span className="lang-icon">{lang === 'en' ? '🇮🇱' : '🇺🇸'}</span>
              <span className="lang-label">{lang === 'en' ? 'עברית' : 'English'}</span>
            </button>

            {/* Back to site */}
            <a href="/" className="btn-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={isRTL ? "M5 12h14M12 5l7 7-7 7" : "M19 12H5M12 19l-7-7 7-7"} />
              </svg>
              {t.backToSite}
            </a>
          </div>
        </header>

        {/* Summary Cards */}
        <SummaryCards
          totalRevenue={data?.summary?.totalRevenue || 0}
          occupancyRate={data?.occupancy?.occupancyRate || 0}
          averageDailyRate={data?.summary?.averageDailyRate || 0}
          totalBookings={data?.summary?.totalBookings || 0}
          trends={{
            revenue: data?.revenue?.trend || 0,
            occupancy: data?.occupancy?.trend || 0,
            adr: data?.revenue?.adrTrend || 0,
            bookings: data?.summary?.bookingsTrend || 0,
          }}
          lang={lang}
        />

        {/* Charts Row */}
        <div className="charts-row">
          <div className="chart-container chart-main">
            <RevenueChart
              data={data?.revenueTimeline || []}
              period={data?.period}
              lang={lang}
            />
          </div>
          <div className="chart-container chart-side">
            <ChannelBreakdown
              data={data?.channelData || []}
              totalRevenue={data?.revenue?.total || 0}
              lang={lang}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="bottom-row">
          <div className="rankings-container">
            <PropertyRankings
              properties={data?.properties || []}
              period={data?.period}
              lang={lang}
            />
          </div>
          <div className="panels-container">
            <ForecastPanel forecast={data?.forecast || []} lang={lang} />
            <AlertsPanel alerts={data?.alerts || []} lang={lang} />
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>
            {t.dataUpdated} {new Date().toLocaleTimeString(isRTL ? 'he-IL' : 'en-US')} &bull;{' '}
            <button onClick={refetch} className="btn-refresh">
              {t.refresh}
            </button>
          </p>
        </footer>
      </div>
    </div>
  )
}
