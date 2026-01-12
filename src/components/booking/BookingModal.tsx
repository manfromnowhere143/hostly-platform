// =============================================================================
// BOOKING MODAL - State-of-the-Art Booking Flow
// =============================================================================
// Seamless multi-step booking with RTL support and premium design
// =============================================================================

'use client'

import { useEffect, useCallback, useState } from 'react'
import { useBooking } from '@/contexts/BookingContext'
import { useLanguage } from '@/contexts/LanguageContext'
import './BookingModal.css'

// --- Icons -------------------------------------------------------------------
const Icons = {
  close: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  form: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11H3M21 11h-6M9 17H3M21 17h-6M9 5H3M21 5h-6" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  ),
  arrowLeft: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  ),
  minus: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="#22c55e" />
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" />
    </svg>
  ),
}

// --- Translations ------------------------------------------------------------
const translations = {
  en: {
    selectDates: 'Select your dates',
    selectGuests: 'How many guests?',
    yourDetails: 'Your details',
    confirmation: 'Booking Confirmed!',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    nights: 'nights',
    night: 'night',
    guests: 'guests',
    guest: 'guest',
    adults: 'Adults',
    adultsDesc: 'Age 13+',
    children: 'Children',
    childrenDesc: 'Age 2-12',
    infants: 'Infants',
    infantsDesc: 'Under 2',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    specialRequests: 'Special Requests',
    optional: 'optional',
    back: 'Back',
    continue: 'Continue',
    confirmBooking: 'Confirm Booking',
    processing: 'Processing...',
    priceBreakdown: 'Price Breakdown',
    subtotal: 'Subtotal',
    cleaningFee: 'Cleaning fee',
    serviceFee: 'Service fee',
    taxes: 'Taxes',
    total: 'Total',
    perNight: '/night',
    confirmationCode: 'Confirmation Code',
    confirmationSent: 'Confirmation email sent to',
    done: 'Done',
    bookNow: 'Book Now',
    demoMode: 'Demo Mode - No payment required',
  },
  he: {
    selectDates: 'בחרו תאריכים',
    selectGuests: 'כמה אורחים?',
    yourDetails: 'הפרטים שלכם',
    confirmation: 'ההזמנה אושרה!',
    checkIn: 'כניסה',
    checkOut: 'יציאה',
    nights: 'לילות',
    night: 'לילה',
    guests: 'אורחים',
    guest: 'אורח',
    adults: 'מבוגרים',
    adultsDesc: 'גיל 13+',
    children: 'ילדים',
    childrenDesc: 'גיל 2-12',
    infants: 'תינוקות',
    infantsDesc: 'מתחת ל-2',
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    email: 'אימייל',
    phone: 'טלפון',
    specialRequests: 'בקשות מיוחדות',
    optional: 'אופציונלי',
    back: 'חזור',
    continue: 'המשך',
    confirmBooking: 'אשר הזמנה',
    processing: 'מעבד...',
    priceBreakdown: 'פירוט מחיר',
    subtotal: 'סכום ביניים',
    cleaningFee: 'דמי ניקיון',
    serviceFee: 'דמי שירות',
    taxes: 'מיסים',
    total: 'סה"כ',
    perNight: '/לילה',
    confirmationCode: 'קוד אישור',
    confirmationSent: 'אימייל אישור נשלח ל',
    done: 'סיום',
    bookNow: 'הזמן עכשיו',
    demoMode: 'מצב הדגמה - ללא תשלום נדרש',
  },
}

// --- Step Indicator ----------------------------------------------------------
function StepIndicator({ step, lang }: { step: string; lang: 'en' | 'he' }) {
  const steps = [
    { id: 'dates', label: lang === 'he' ? 'תאריכים' : 'Dates', icon: Icons.calendar },
    { id: 'guests', label: lang === 'he' ? 'אורחים' : 'Guests', icon: Icons.users },
    { id: 'details', label: lang === 'he' ? 'פרטים' : 'Details', icon: Icons.form },
  ]

  const currentIndex = steps.findIndex((s) => s.id === step)
  if (step === 'confirmation') return null

  return (
    <div className="booking-steps">
      {steps.map((s, i) => (
        <div
          key={s.id}
          className={`step-item ${i < currentIndex ? 'completed' : ''} ${i === currentIndex ? 'active' : ''}`}
        >
          <div className="step-circle">
            {i < currentIndex ? Icons.check : <span>{i + 1}</span>}
          </div>
          <span className="step-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

// --- Date Picker -------------------------------------------------------------
function DatePicker() {
  const { checkIn, checkOut, setDates, isDateBlocked, availabilityCalendar, availabilityLoading } = useBooking()
  const { lang, isRTL } = useLanguage()
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [selectionPhase, setSelectionPhase] = useState<'checkIn' | 'checkOut'>('checkIn')

  const t = translations[lang as keyof typeof translations]

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekdays = lang === 'he'
    ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Get price for a specific date from Boom calendar
  const getPriceForDate = (day: number): number | null => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = date.toISOString().split('T')[0]
    const dayData = availabilityCalendar.find(d => d.date === dateStr)
    return dayData ? dayData.price / 100 : null // Convert from agorot to shekels
  }

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    clickedDate.setHours(0, 0, 0, 0)

    // Don't allow selection of blocked dates
    if (isDateBlocked(clickedDate)) return

    if (selectionPhase === 'checkIn' || (checkIn && clickedDate <= checkIn)) {
      setDates(clickedDate, null)
      setSelectionPhase('checkOut')
    } else if (checkIn && clickedDate > checkIn) {
      setDates(checkIn, clickedDate)
      setSelectionPhase('checkIn')
    }
  }

  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date < today
  }

  // Check if date is blocked in Boom
  const isBlocked = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return isDateBlocked(date)
  }

  const isSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    date.setHours(0, 0, 0, 0)
    return (
      (checkIn && date.getTime() === checkIn.getTime()) ||
      (checkOut && date.getTime() === checkOut.getTime())
    )
  }

  const isInRange = (day: number) => {
    if (!checkIn) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const end = checkOut || hoverDate
    if (!end) return false
    return date > checkIn && date < end
  }

  const monthName = currentMonth.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })

  const canGoPrev = currentMonth > today

  return (
    <div className="datepicker">
      <div className="datepicker-hint">
        <span className={selectionPhase === 'checkIn' ? 'active' : ''}>
          {t.checkIn}: {checkIn ? checkIn.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' }) : '—'}
        </span>
        <span className="arrow">→</span>
        <span className={selectionPhase === 'checkOut' ? 'active' : ''}>
          {t.checkOut}: {checkOut ? checkOut.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' }) : '—'}
        </span>
      </div>

      <div className="datepicker-header">
        <button
          className="month-nav"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          disabled={!canGoPrev}
        >
          {isRTL ? '›' : '‹'}
        </button>
        <span className="month-title">{monthName}</span>
        <button
          className="month-nav"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          {isRTL ? '‹' : '›'}
        </button>
      </div>

      <div className="datepicker-weekdays">
        {weekdays.map((day) => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      {/* Loading indicator */}
      {availabilityLoading && (
        <div className="datepicker-loading">
          <div className="loading-spinner" />
          <span>{lang === 'he' ? 'טוען זמינות...' : 'Loading availability...'}</span>
        </div>
      )}

      <div className="datepicker-grid">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`pad-${i}`} className="day-cell padding" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const past = isPast(day)
          const blocked = isBlocked(day)
          const selected = isSelected(day)
          const inRange = isInRange(day)
          const isWeekend = (firstDayOfMonth + i) % 7 === 0 || (firstDayOfMonth + i) % 7 === 6
          const price = getPriceForDate(day)
          const isDisabled = past || blocked

          return (
            <button
              key={day}
              className={`day-cell ${past ? 'past' : ''} ${blocked ? 'blocked' : ''} ${!isDisabled ? 'available' : ''} ${selected ? 'selected' : ''} ${inRange ? 'in-range' : ''} ${isWeekend ? 'weekend' : ''}`}
              onClick={() => !isDisabled && handleDayClick(day)}
              onMouseEnter={() => !isDisabled && checkIn && !checkOut && setHoverDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
              onMouseLeave={() => setHoverDate(null)}
              disabled={isDisabled}
              title={blocked ? (lang === 'he' ? 'תפוס' : 'Booked') : price ? `₪${price}` : ''}
            >
              <span className="day-number">{day}</span>
              {/* Show price for available dates */}
              {!past && !blocked && price && (
                <span className="day-price">₪{price}</span>
              )}
              {/* Show blocked indicator */}
              {blocked && !past && (
                <span className="day-blocked-indicator">✕</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="datepicker-legend">
        <span className="legend-item"><span className="legend-dot available" /> {lang === 'he' ? 'פנוי' : 'Available'}</span>
        <span className="legend-item"><span className="legend-dot blocked" /> {lang === 'he' ? 'תפוס' : 'Booked'}</span>
      </div>
    </div>
  )
}

// --- Guest Selector ----------------------------------------------------------
function GuestSelector() {
  const { adults, children, infants, setGuests, property } = useBooking()
  const { lang } = useLanguage()
  const t = translations[lang as keyof typeof translations]

  const maxGuests = property?.maxGuests || 10

  const rows = [
    { key: 'adults', label: t.adults, desc: t.adultsDesc, value: adults, min: 1, max: maxGuests },
    { key: 'children', label: t.children, desc: t.childrenDesc, value: children, min: 0, max: maxGuests - adults },
    { key: 'infants', label: t.infants, desc: t.infantsDesc, value: infants, min: 0, max: 5 },
  ]

  return (
    <div className="guest-selector">
      <h3 className="guest-selector-title">{t.selectGuests}</h3>
      {rows.map((row) => (
        <div key={row.key} className="guest-row">
          <div className="guest-info">
            <span className="guest-type">{row.label}</span>
            <span className="guest-desc">{row.desc}</span>
          </div>
          <div className="guest-counter">
            <button
              className="counter-btn"
              onClick={() => setGuests({ [row.key]: Math.max(row.min, row.value - 1) })}
              disabled={row.value <= row.min}
            >
              {Icons.minus}
            </button>
            <span className="counter-value">{row.value}</span>
            <button
              className="counter-btn"
              onClick={() => setGuests({ [row.key]: Math.min(row.max, row.value + 1) })}
              disabled={row.value >= row.max}
            >
              {Icons.plus}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Guest Form --------------------------------------------------------------
function GuestForm() {
  const { guest, setGuestInfo, specialRequests, setSpecialRequests } = useBooking()
  const { lang, isRTL } = useLanguage()
  const t = translations[lang as keyof typeof translations]

  return (
    <div className="guest-form">
      <h3 className="guest-form-title">{t.yourDetails}</h3>
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">
            {t.firstName} <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={guest.firstName}
            onChange={(e) => setGuestInfo({ firstName: e.target.value })}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
        <div className="form-field">
          <label className="form-label">
            {t.lastName} <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={guest.lastName}
            onChange={(e) => setGuestInfo({ lastName: e.target.value })}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
        <div className="form-field">
          <label className="form-label">
            {t.email} <span className="required">*</span>
          </label>
          <input
            type="email"
            className="form-input"
            value={guest.email}
            onChange={(e) => setGuestInfo({ email: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="form-field">
          <label className="form-label">
            {t.phone} <span className="required">*</span>
          </label>
          <input
            type="tel"
            className="form-input"
            value={guest.phone}
            onChange={(e) => setGuestInfo({ phone: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="form-field full-width">
          <label className="form-label">
            {t.specialRequests} <span className="optional">({t.optional})</span>
          </label>
          <textarea
            className="form-textarea"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      </div>
    </div>
  )
}

// --- Price Breakdown ---------------------------------------------------------
function PriceBreakdown() {
  const { quote, nights, quoteLoading } = useBooking()
  const { lang } = useLanguage()
  const t = translations[lang as keyof typeof translations]

  if (quoteLoading) {
    return (
      <div className="price-breakdown loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!quote) return null

  const { pricing } = quote
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat(lang === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: pricing.currency,
    }).format(amount)

  return (
    <div className="price-breakdown">
      <h4 className="breakdown-title">{t.priceBreakdown}</h4>
      <div className="breakdown-rows">
        <div className="breakdown-row">
          <span>
            {formatPrice(pricing.averageNightly)} × {nights} {nights === 1 ? t.night : t.nights}
          </span>
          <span>{formatPrice(pricing.subtotal)}</span>
        </div>
        {pricing.cleaningFee > 0 && (
          <div className="breakdown-row">
            <span>{t.cleaningFee}</span>
            <span>{formatPrice(pricing.cleaningFee)}</span>
          </div>
        )}
        {pricing.serviceFee > 0 && (
          <div className="breakdown-row">
            <span>{t.serviceFee}</span>
            <span>{formatPrice(pricing.serviceFee)}</span>
          </div>
        )}
        {pricing.taxes > 0 && (
          <div className="breakdown-row">
            <span>{t.taxes}</span>
            <span>{formatPrice(pricing.taxes)}</span>
          </div>
        )}
        <div className="breakdown-row total">
          <span>{t.total}</span>
          <span>{formatPrice(pricing.total)}</span>
        </div>
      </div>
    </div>
  )
}

// --- Confirmation ------------------------------------------------------------
function BookingConfirmation() {
  const { booking, guest, closeBooking, property, checkIn, checkOut, nights } = useBooking()
  const { lang } = useLanguage()
  const t = translations[lang as keyof typeof translations]

  const propertyName = typeof property?.name === 'object'
    ? property.name[lang as 'en' | 'he']
    : property?.name || ''

  return (
    <div className="confirmation">
      <div className="confirmation-header">
        {Icons.success}
        <h2 className="confirmation-title">{t.confirmation}</h2>
      </div>

      <div className="confirmation-code">
        <span className="code-label">{t.confirmationCode}</span>
        <span className="code-value">{booking?.confirmationCode}</span>
      </div>

      <div className="confirmation-details">
        <div className="detail-row">
          <span className="detail-label">{lang === 'he' ? 'נכס' : 'Property'}</span>
          <span className="detail-value">{propertyName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t.checkIn}</span>
          <span className="detail-value">
            {checkIn?.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t.checkOut}</span>
          <span className="detail-value">
            {checkOut?.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{lang === 'he' ? 'משך השהות' : 'Duration'}</span>
          <span className="detail-value">{nights} {nights === 1 ? t.night : t.nights}</span>
        </div>
      </div>

      <div className="confirmation-email">
        {t.confirmationSent} <strong>{guest.email}</strong>
      </div>

      <button className="confirmation-close" onClick={closeBooking}>
        {t.done}
      </button>
    </div>
  )
}

// --- Main Modal --------------------------------------------------------------
export function BookingModal() {
  const {
    isOpen,
    closeBooking,
    step,
    setStep,
    property,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    canProceedToGuests,
    canProceedToDetails,
    canProceedToPayment,
    fetchQuote,
    createBooking,
    quoteLoading,
    bookingLoading,
    error,
    setError,
  } = useBooking()

  const { lang, isRTL } = useLanguage()
  const [isClosing, setIsClosing] = useState(false)

  const t = translations[lang as keyof typeof translations]

  // Fetch quote when entering guests step
  useEffect(() => {
    if (step === 'guests' && canProceedToGuests) {
      fetchQuote()
    }
  }, [step, canProceedToGuests, fetchQuote])

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      closeBooking()
      setIsClosing(false)
    }, 300)
  }, [closeBooking])

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleClose])

  // Navigation handlers
  const handleNext = useCallback(async () => {
    setError(null)

    switch (step) {
      case 'dates':
        if (canProceedToGuests) setStep('guests')
        break
      case 'guests':
        if (canProceedToDetails) setStep('details')
        break
      case 'details':
        if (canProceedToPayment) {
          const result = await createBooking()
          if (result) setStep('confirmation')
        }
        break
    }
  }, [step, canProceedToGuests, canProceedToDetails, canProceedToPayment, setStep, createBooking, setError])

  const handleBack = useCallback(() => {
    setError(null)
    switch (step) {
      case 'guests':
        setStep('dates')
        break
      case 'details':
        setStep('guests')
        break
    }
  }, [step, setStep, setError])

  // Button state
  const getButtonState = () => {
    switch (step) {
      case 'dates':
        return { disabled: !canProceedToGuests, loading: false, text: t.continue }
      case 'guests':
        return { disabled: !canProceedToDetails || quoteLoading, loading: quoteLoading, text: t.continue }
      case 'details':
        return { disabled: !canProceedToPayment || bookingLoading, loading: bookingLoading, text: t.confirmBooking }
      default:
        return { disabled: true, loading: false, text: '' }
    }
  }

  const buttonState = getButtonState()

  if (!isOpen) return null

  const propertyName = typeof property?.name === 'object'
    ? property.name[lang as 'en' | 'he']
    : property?.name || ''

  return (
    <div className={`booking-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div
        className={`booking-modal ${isClosing ? 'closing' : ''} ${isRTL ? 'rtl' : ''}`}
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button className="modal-close" onClick={handleClose}>
          {Icons.close}
        </button>

        {/* Header */}
        {step !== 'confirmation' && (
          <div className="modal-header">
            <div className="property-preview">
              {property?.images?.[0] ? (
                <img src={property.images[0]} alt={propertyName} className="property-thumb" />
              ) : (
                <div className="property-thumb placeholder" />
              )}
              <div className="property-info">
                <h2 className="property-name">{propertyName}</h2>
                {checkIn && checkOut && (
                  <div className="selected-info">
                    <span className="date-range">
                      {checkIn.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' })}
                      {' → '}
                      {checkOut.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="info-badge">
                      {Icons.moon} {nights} {nights === 1 ? t.night : t.nights}
                    </span>
                    <span className="info-badge">
                      {Icons.users} {adults + children} {adults + children === 1 ? t.guest : t.guests}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <StepIndicator step={step} lang={lang as 'en' | 'he'} />
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {/* Demo Mode Banner */}
          {step === 'details' && (
            <div className="demo-banner">
              {t.demoMode}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Step Content */}
          <div className={`step-content step-${step}`}>
            {step === 'dates' && (
              <div className="dates-step">
                <h3 className="step-title">{t.selectDates}</h3>
                <DatePicker />
              </div>
            )}

            {step === 'guests' && (
              <div className="guests-step">
                <div className="step-main">
                  <GuestSelector />
                </div>
                <div className="step-sidebar">
                  <PriceBreakdown />
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="details-step">
                <div className="step-main">
                  <GuestForm />
                </div>
                <div className="step-sidebar">
                  <PriceBreakdown />
                </div>
              </div>
            )}

            {step === 'confirmation' && <BookingConfirmation />}
          </div>
        </div>

        {/* Footer */}
        {step !== 'confirmation' && (
          <div className="modal-footer">
            {step !== 'dates' && (
              <button className="footer-back" onClick={handleBack}>
                {isRTL ? Icons.arrowRight : Icons.arrowLeft}
                {t.back}
              </button>
            )}
            <button
              className="footer-next"
              onClick={handleNext}
              disabled={buttonState.disabled}
            >
              {buttonState.loading ? (
                <>
                  <span className="button-spinner" />
                  <span>{t.processing}</span>
                </>
              ) : (
                <>
                  <span>{buttonState.text}</span>
                  {isRTL ? Icons.arrowLeft : Icons.arrowRight}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingModal
