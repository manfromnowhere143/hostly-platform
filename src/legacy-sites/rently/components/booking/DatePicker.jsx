// ═══════════════════════════════════════════════════════════════════════════════
// DATE PICKER - Beautiful Calendar with Availability
// ═══════════════════════════════════════════════════════════════════════════════
// State-of-the-art date selection with real-time availability
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react';
import { useBooking } from '../../context/BookingContext';
import { formatPrice, addDays } from '../../services/booking';

// ─── Month Names ───────────────────────────────────────────────────────────────
const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'],
  he: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
       'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
};

const WEEKDAYS = {
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  he: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
};

// ─── Component ─────────────────────────────────────────────────────────────────
export default function DatePicker() {
  const {
    calendar,
    checkIn,
    checkOut,
    setDates,
    property,
    lang = 'en',
  } = useBooking();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [selecting, setSelecting] = useState('checkIn'); // 'checkIn' | 'checkOut'
  const [hoverDate, setHoverDate] = useState(null);

  // ─── Calendar Grid ─────────────────────────────────────────────────────────
  const calendarGrid = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push({ type: 'padding', key: `pad-${i}` });
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const calendarDay = calendar.find(d => d.date === dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isPast = date < today;
      const isAvailable = !isPast && calendarDay?.available !== false;
      const price = calendarDay?.price;

      days.push({
        type: 'day',
        key: dateStr,
        date,
        dateStr,
        day,
        isPast,
        isAvailable,
        price,
        isToday: date.getTime() === today.getTime(),
        isWeekend: date.getDay() === 5 || date.getDay() === 6,
      });
    }

    return days;
  }, [currentMonth, calendar]);

  // ─── Check Selection State ─────────────────────────────────────────────────
  const isSelected = useCallback((dateStr) => {
    if (!checkIn && !checkOut) return false;
    const checkInStr = checkIn?.toISOString().split('T')[0];
    const checkOutStr = checkOut?.toISOString().split('T')[0];
    return dateStr === checkInStr || dateStr === checkOutStr;
  }, [checkIn, checkOut]);

  const isInRange = useCallback((date) => {
    if (!checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  }, [checkIn, checkOut]);

  const isHoverRange = useCallback((date) => {
    if (!checkIn || checkOut || !hoverDate || selecting !== 'checkOut') return false;
    return date > checkIn && date <= hoverDate;
  }, [checkIn, checkOut, hoverDate, selecting]);

  // ─── Handle Day Click ──────────────────────────────────────────────────────
  const handleDayClick = useCallback((day) => {
    if (!day.isAvailable) return;

    if (selecting === 'checkIn') {
      setDates(day.date, null);
      setSelecting('checkOut');
    } else {
      if (day.date <= checkIn) {
        // If selected date is before check-in, make it the new check-in
        setDates(day.date, null);
        setSelecting('checkOut');
      } else {
        setDates(checkIn, day.date);
        setSelecting('checkIn');
      }
    }
  }, [selecting, checkIn, setDates]);

  // ─── Navigate Months ───────────────────────────────────────────────────────
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  }, []);

  // ─── Check if can go to previous month ─────────────────────────────────────
  const canGoPrev = useMemo(() => {
    const now = new Date();
    return currentMonth.year > now.getFullYear() ||
           (currentMonth.year === now.getFullYear() && currentMonth.month > now.getMonth());
  }, [currentMonth]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="booking-datepicker">
      {/* Selection Indicator */}
      <div className="datepicker-selection-hint">
        <span className={selecting === 'checkIn' ? 'active' : ''}>
          {lang === 'he' ? 'צ\'ק-אין' : 'Check-in'}
        </span>
        <span className="arrow">→</span>
        <span className={selecting === 'checkOut' ? 'active' : ''}>
          {lang === 'he' ? 'צ\'ק-אאוט' : 'Check-out'}
        </span>
      </div>

      {/* Month Navigation */}
      <div className="datepicker-header">
        <button
          className="month-nav prev"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        <div className="month-title">
          {MONTHS[lang][currentMonth.month]} {currentMonth.year}
        </div>

        <button
          className="month-nav next"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="datepicker-weekdays">
        {WEEKDAYS[lang].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="datepicker-grid">
        {calendarGrid.map(day => {
          if (day.type === 'padding') {
            return <div key={day.key} className="day-cell padding" />;
          }

          const selected = isSelected(day.dateStr);
          const inRange = isInRange(day.date);
          const inHoverRange = isHoverRange(day.date);
          const isCheckIn = checkIn && day.dateStr === checkIn.toISOString().split('T')[0];
          const isCheckOut = checkOut && day.dateStr === checkOut.toISOString().split('T')[0];

          return (
            <button
              key={day.key}
              className={[
                'day-cell',
                day.isPast && 'past',
                !day.isAvailable && 'unavailable',
                day.isAvailable && 'available',
                day.isToday && 'today',
                day.isWeekend && 'weekend',
                selected && 'selected',
                isCheckIn && 'check-in',
                isCheckOut && 'check-out',
                inRange && 'in-range',
                inHoverRange && 'hover-range',
              ].filter(Boolean).join(' ')}
              disabled={!day.isAvailable}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => setHoverDate(day.date)}
              onMouseLeave={() => setHoverDate(null)}
            >
              <span className="day-number">{day.day}</span>
              {day.isAvailable && day.price && (
                <span className="day-price">
                  {formatPrice(day.price, 'ILS').replace('₪', '')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="datepicker-legend">
        <div className="legend-item">
          <span className="legend-dot available"></span>
          <span>{lang === 'he' ? 'פנוי' : 'Available'}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot unavailable"></span>
          <span>{lang === 'he' ? 'תפוס' : 'Unavailable'}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot selected"></span>
          <span>{lang === 'he' ? 'נבחר' : 'Selected'}</span>
        </div>
      </div>

      {/* Min Nights Notice */}
      {property?.minNights > 1 && (
        <div className="datepicker-notice">
          {lang === 'he'
            ? `מינימום ${property.minNights} לילות`
            : `Minimum ${property.minNights} nights`}
        </div>
      )}
    </div>
  );
}
