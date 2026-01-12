// =============================================================================
// DATE RANGE PICKER - Elegant Calendar for Marketplace Search
// =============================================================================
// Airbnb-inspired date selection with smooth animations
// Uses fixed positioning to ensure visibility above all content
// =============================================================================

'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// --- Types -------------------------------------------------------------------

interface DateRangePickerProps {
  checkIn: Date | null
  checkOut: Date | null
  onSelect: (checkIn: Date | null, checkOut: Date | null) => void
  isOpen: boolean
  onClose: () => void
  lang?: 'en' | 'he'
  anchorRef?: React.RefObject<HTMLElement>
}

// --- Month/Weekday Names -----------------------------------------------------

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'],
  he: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
       'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
}

const WEEKDAYS = {
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
}

// --- Component ---------------------------------------------------------------

export function DateRangePicker({
  checkIn,
  checkOut,
  onSelect,
  isOpen,
  onClose,
  lang = 'en',
  anchorRef,
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selecting, setSelecting] = useState<'checkIn' | 'checkOut'>('checkIn')
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const isRTL = lang === 'he'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position based on anchor element
  useEffect(() => {
    if (!isOpen || !anchorRef?.current) return

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect()
      const pickerWidth = 680 // approximate width

      // Center the picker under the search bar
      let left = rect.left + (rect.width / 2) - (pickerWidth / 2)

      // Ensure it doesn't go off screen
      if (left < 16) left = 16
      if (left + pickerWidth > window.innerWidth - 16) {
        left = window.innerWidth - pickerWidth - 16
      }

      setPosition({
        top: rect.bottom + 8,
        left,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, anchorRef])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close on escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Generate calendar grid for a month
  const generateCalendarGrid = useCallback((year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: Array<{
      type: 'padding' | 'day'
      key: string
      date?: Date
      day?: number
      isPast?: boolean
      isToday?: boolean
    }> = []

    // Padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push({ type: 'padding', key: `pad-${i}` })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)

      days.push({
        type: 'day',
        key: date.toISOString().split('T')[0],
        date,
        day,
        isPast: date < today,
        isToday: date.getTime() === today.getTime(),
      })
    }

    return days
  }, [])

  // Memoize calendar grids for current and next month
  const { currentMonthGrid, nextMonthGrid } = useMemo(() => {
    const current = generateCalendarGrid(currentMonth.year, currentMonth.month)
    const nextMonth = currentMonth.month === 11 ? 0 : currentMonth.month + 1
    const nextYear = currentMonth.month === 11 ? currentMonth.year + 1 : currentMonth.year
    const next = generateCalendarGrid(nextYear, nextMonth)
    return { currentMonthGrid: current, nextMonthGrid: next }
  }, [currentMonth, generateCalendarGrid])

  // Check if date is in selection range
  const isInRange = useCallback((date: Date) => {
    if (!checkIn || !checkOut) return false
    return date > checkIn && date < checkOut
  }, [checkIn, checkOut])

  // Check if date is in hover preview range
  const isInPreviewRange = useCallback((date: Date) => {
    if (!checkIn || checkOut || !hoverDate || selecting !== 'checkOut') return false
    return date > checkIn && date < hoverDate
  }, [checkIn, checkOut, hoverDate, selecting])

  // Handle day click
  const handleDayClick = useCallback((date: Date) => {
    if (selecting === 'checkIn') {
      onSelect(date, null)
      setSelecting('checkOut')
    } else {
      if (checkIn && date > checkIn) {
        onSelect(checkIn, date)
        setSelecting('checkIn')
        onClose()
      } else {
        // Selected date before check-in, restart selection
        onSelect(date, null)
        setSelecting('checkOut')
      }
    }
  }, [selecting, checkIn, onSelect, onClose])

  // Navigate months
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 }
      }
      return { year: prev.year, month: prev.month - 1 }
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 }
      }
      return { year: prev.year, month: prev.month + 1 }
    })
  }, [])

  // Check if prev month is in the past
  const canGoPrev = useMemo(() => {
    const now = new Date()
    const prevMonth = currentMonth.month === 0 ? 11 : currentMonth.month - 1
    const prevYear = currentMonth.month === 0 ? currentMonth.year - 1 : currentMonth.year
    return new Date(prevYear, prevMonth + 1, 0) >= now
  }, [currentMonth])

  // Render a single calendar month
  const renderMonth = (grid: typeof currentMonthGrid, year: number, month: number) => {
    const monthName = MONTHS[lang][month]
    const weekdays = WEEKDAYS[lang]

    return (
      <div className="flex flex-col">
        {/* Month Header */}
        <div className={`text-center font-medium text-[var(--foreground)] mb-4 ${isRTL ? 'font-heebo' : ''}`}>
          {monthName} {year}
        </div>

        {/* Weekday Headers */}
        <div className={`grid grid-cols-7 gap-0 mb-2 ${isRTL ? 'direction-rtl' : ''}`}>
          {weekdays.map((day, i) => (
            <div
              key={i}
              className={`text-center text-[11px] font-medium text-[var(--neutral-500)] ${isRTL ? 'font-heebo' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-0">
          {grid.map((item) => {
            if (item.type === 'padding') {
              return <div key={item.key} className="w-10 h-10" />
            }

            const date = item.date!
            const isSelected = (checkIn && date.getTime() === checkIn.getTime()) ||
                               (checkOut && date.getTime() === checkOut.getTime())
            const isCheckIn = checkIn && date.getTime() === checkIn.getTime()
            const isCheckOut = checkOut && date.getTime() === checkOut.getTime()
            const inRange = isInRange(date)
            const inPreview = isInPreviewRange(date)

            return (
              <button
                key={item.key}
                type="button"
                disabled={item.isPast}
                onClick={() => handleDayClick(date)}
                onMouseEnter={() => setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
                className={`
                  relative w-10 h-10 flex items-center justify-center
                  text-[13px] rounded-full transition-all duration-150
                  ${item.isPast
                    ? 'text-[var(--neutral-300)] cursor-not-allowed'
                    : 'text-[var(--foreground)] cursor-pointer hover:bg-[var(--neutral-100)]'
                  }
                  ${isSelected ? 'bg-[var(--foreground)] text-white hover:bg-[var(--foreground)]' : ''}
                  ${inRange ? 'bg-[var(--neutral-100)] rounded-none' : ''}
                  ${inPreview ? 'bg-[var(--neutral-100)] rounded-none' : ''}
                  ${isCheckIn && checkOut ? 'rounded-l-full rounded-r-none' : ''}
                  ${isCheckOut ? 'rounded-r-full rounded-l-none' : ''}
                  ${item.isToday && !isSelected ? 'font-bold' : ''}
                `}
              >
                {item.day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (!isOpen || !mounted) return null

  const nextMonthNum = currentMonth.month === 11 ? 0 : currentMonth.month + 1
  const nextYear = currentMonth.month === 11 ? currentMonth.year + 1 : currentMonth.year

  const pickerContent = (
    <div
      ref={containerRef}
      className="fixed bg-white rounded-2xl shadow-2xl border border-[var(--neutral-200)] p-6"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 99999,
        minWidth: 680,
        animation: 'fadeInScale 0.15s ease-out',
      }}
    >
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={`
            p-2 rounded-full hover:bg-[var(--neutral-100)] transition-colors
            ${!canGoPrev ? 'opacity-30 cursor-not-allowed' : ''}
          `}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={isRTL ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
          </svg>
        </button>

        <div className={`text-sm text-[var(--neutral-500)] ${isRTL ? 'font-heebo' : ''}`}>
          {selecting === 'checkIn'
            ? (lang === 'he' ? 'בחר תאריך הגעה' : 'Select check-in')
            : (lang === 'he' ? 'בחר תאריך עזיבה' : 'Select check-out')
          }
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-[var(--neutral-100)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={isRTL ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
          </svg>
        </button>
      </div>

      {/* Two-month Calendar */}
      <div className={`flex gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {renderMonth(currentMonthGrid, currentMonth.year, currentMonth.month)}
        {renderMonth(nextMonthGrid, nextYear, nextMonthNum)}
      </div>

      {/* Clear/Apply Footer */}
      <div className={`flex items-center justify-between mt-6 pt-4 border-t border-[var(--neutral-200)] ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={() => {
            onSelect(null, null)
            setSelecting('checkIn')
          }}
          className={`text-sm text-[var(--neutral-600)] hover:text-[var(--foreground)] underline ${isRTL ? 'font-heebo' : ''}`}
        >
          {lang === 'he' ? 'נקה תאריכים' : 'Clear dates'}
        </button>

        {checkIn && checkOut && (
          <button
            type="button"
            onClick={onClose}
            className={`
              px-4 py-2 bg-[var(--foreground)] text-white text-sm font-medium
              rounded-lg hover:opacity-90 transition-opacity
              ${isRTL ? 'font-heebo' : ''}
            `}
          >
            {lang === 'he' ? 'אישור' : 'Apply'}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )

  // Use portal to render at document body level
  return createPortal(pickerContent, document.body)
}

export default DateRangePicker
