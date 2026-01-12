// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING MODAL - Main Booking Flow
// ═══════════════════════════════════════════════════════════════════════════════
// State-of-the-art booking experience with seamless transitions
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useCallback, useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import DatePicker from './DatePicker';
import PropertySelector from './PropertySelector';
import GuestSelector from './GuestSelector';
import PricingBreakdown from './PricingBreakdown';
import GuestForm from './GuestForm';
import PaymentForm from './PaymentForm';
import BookingConfirmation from './BookingConfirmation';
import { formatDisplayDate } from '../../services/booking';
import { SmartInsights, FlexibleDates } from '../pricing';
import { usePriceIntelligence } from '../../hooks/usePriceIntelligence';

// ─── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step, lang, showPropertyStep }) {
  const steps = [
    { id: 'dates', label: lang === 'he' ? 'תאריכים' : 'Dates', icon: 'calendar' },
    ...(showPropertyStep ? [{ id: 'properties', label: lang === 'he' ? 'דירה' : 'Apartment', icon: 'home' }] : []),
    { id: 'guests', label: lang === 'he' ? 'אורחים' : 'Guests', icon: 'people' },
    { id: 'details', label: lang === 'he' ? 'פרטים' : 'Details', icon: 'form' },
    { id: 'payment', label: lang === 'he' ? 'תשלום' : 'Payment', icon: 'card' },
  ];

  const currentIndex = steps.findIndex(s => s.id === step);

  if (step === 'confirmation') {
    return null;
  }

  return (
    <div className="booking-steps">
      {steps.map((s, i) => (
        <div
          key={s.id}
          className={[
            'step-item',
            i < currentIndex && 'completed',
            i === currentIndex && 'active',
          ].filter(Boolean).join(' ')}
        >
          <div className="step-circle">
            {i < currentIndex ? (
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span className="step-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BookingModal() {
  const {
    isOpen,
    closeBooking,
    step,
    setStep,
    property,
    propertySlug,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    quote,
    canProceedToGuests,
    canProceedToDetails,
    canProceedToPayment,
    loadCalendar,
    checkAvailability,
    fetchQuote,
    createBooking,
    selectProperty,
    error,
    setError,
    setDates,
    availabilityLoading,
    quoteLoading,
    bookingLoading,
    lang = 'en', // Read lang from context
  } = useBooking();

  const [isClosing, setIsClosing] = useState(false);

  // Check if we need property selection (no property pre-selected)
  const needsPropertySelection = !property || !property.id;

  // Price Intelligence - State of the Art
  const checkInStr = checkIn ? checkIn.toISOString().split('T')[0] : null;
  const checkOutStr = checkOut ? checkOut.toISOString().split('T')[0] : null;

  const {
    insights,
    scarcity,
    alternatives,
    requestedDates,
    loading: priceIntelLoading,
    isRefreshing: priceIntelRefreshing,
    hasData: hasPriceData,
  } = usePriceIntelligence({
    propertyId: property?.id,
    checkIn: checkInStr,
    checkOut: checkOutStr,
    guests: adults + children,
    enabled: !!property?.id && isOpen,
  });

  // Handle selecting alternative dates
  const handleSelectAlternative = useCallback((alt) => {
    setDates(new Date(alt.checkIn), new Date(alt.checkOut));
  }, [setDates]);

  // Load calendar when modal opens
  useEffect(() => {
    if (isOpen && propertySlug) {
      loadCalendar(propertySlug);
    }
  }, [isOpen, propertySlug, loadCalendar]);

  // Auto-check availability when dates are selected
  useEffect(() => {
    if (checkIn && checkOut && nights > 0) {
      checkAvailability();
    }
  }, [checkIn, checkOut, nights, checkAvailability]);

  // Fetch quote when moving to guests step
  useEffect(() => {
    if (step === 'guests' && !quote && !quoteLoading && property?.id) {
      fetchQuote();
    }
  }, [step, quote, quoteLoading, property?.id, fetchQuote]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      closeBooking();
      setIsClosing(false);
    }, 300);
  }, [closeBooking]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  // Check if can proceed from dates (with or without property selection)
  const canProceedFromDates = checkIn && checkOut && nights > 0;

  // Check if can proceed from properties
  const canProceedFromProperties = property && property.id;

  // Navigation handlers
  const handleNext = useCallback(async () => {
    setError(null);

    try {
      switch (step) {
        case 'dates':
          if (canProceedFromDates) {
            // If no property pre-selected, go to property selection
            if (needsPropertySelection) {
              setStep('properties');
            } else {
              setStep('guests');
            }
          }
          break;

        case 'properties':
          if (canProceedFromProperties) {
            setStep('guests');
          }
          break;

        case 'guests':
          if (canProceedToDetails) {
            setStep('details');
          }
          break;

        case 'details':
          if (canProceedToPayment) {
            const bookingResult = await createBooking();
            // If in demo mode (Stripe not configured), skip payment and go to confirmation
            if (bookingResult?.demoMode || bookingResult?.status === 'confirmed') {
              setStep('confirmation');
            } else {
              setStep('payment');
            }
          }
          break;

        default:
          break;
      }
    } catch (err) {
      // Error is already set in the context
    }
  }, [step, canProceedFromDates, canProceedFromProperties, needsPropertySelection, canProceedToGuests, canProceedToDetails, canProceedToPayment, setStep, createBooking, setError]);

  const handleBack = useCallback(() => {
    setError(null);

    switch (step) {
      case 'properties':
        setStep('dates');
        break;
      case 'guests':
        if (needsPropertySelection) {
          setStep('properties');
        } else {
          setStep('dates');
        }
        break;
      case 'details':
        setStep('guests');
        break;
      case 'payment':
        setStep('details');
        break;
      default:
        break;
    }
  }, [step, needsPropertySelection, setStep, setError]);

  const handlePaymentSuccess = useCallback(() => {
    setStep('confirmation');
  }, [setStep]);

  // Get button state
  const getButtonState = () => {
    switch (step) {
      case 'dates':
        return {
          disabled: !canProceedFromDates,
          loading: false,
          text: needsPropertySelection
            ? (lang === 'he' ? 'בחר דירה' : 'Choose Apartment')
            : (lang === 'he' ? 'בחר אורחים' : 'Select Guests'),
        };
      case 'properties':
        return {
          disabled: !canProceedFromProperties,
          loading: false,
          text: lang === 'he' ? 'בחר אורחים' : 'Select Guests',
        };
      case 'guests':
        return {
          disabled: !canProceedToDetails || quoteLoading,
          loading: quoteLoading,
          text: lang === 'he' ? 'המשך לפרטים' : 'Continue to Details',
        };
      case 'details':
        return {
          disabled: !canProceedToPayment || bookingLoading,
          loading: bookingLoading,
          text: lang === 'he' ? 'המשך לתשלום' : 'Continue to Payment',
        };
      default:
        return { disabled: true, loading: false, text: '' };
    }
  };

  const buttonState = getButtonState();

  if (!isOpen) return null;

  const texts = {
    en: {
      selectDates: 'Select your dates',
      back: 'Back',
      nights: 'nights',
      guests: 'guests',
    },
    he: {
      selectDates: 'בחר תאריכים',
      back: 'חזור',
      nights: 'לילות',
      guests: 'אורחים',
    },
  };

  const t = texts[lang];

  return (
    <div className={`booking-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div
        className={`booking-modal ${isClosing ? 'closing' : ''} ${lang === 'he' ? 'rtl' : ''}`}
        onClick={e => e.stopPropagation()}
        style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* Close Button */}
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Header */}
        {step !== 'confirmation' && (
          <div className="modal-header">
            <div className="property-preview">
              {property?.images?.[0] ? (
                <img src={property.images[0]} alt={property?.name} className="property-thumb" />
              ) : (
                <div className="property-thumb placeholder">
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </div>
              )}
              <div className="property-details">
                <h2 id="booking-modal-title" className="property-name">
                  {property?.name || (lang === 'he' ? 'הזמן דירה' : 'Book an Apartment')}
                </h2>
                {checkIn && checkOut && (
                  <div className="selected-dates">
                    <span className="date-range">
                      {formatDisplayDate(checkIn, lang)} → {formatDisplayDate(checkOut, lang)}
                    </span>
                    {nights > 0 && (
                      <span className="info-badge nights-badge">
                        <svg viewBox="0 0 24 24" width="12" height="12">
                          <path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
                        </svg>
                        {nights} {t.nights}
                      </span>
                    )}
                    {adults > 0 && (
                      <span className="info-badge guests-badge">
                        <svg viewBox="0 0 24 24" width="12" height="12">
                          <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                        {adults + children} {t.guests}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <StepIndicator step={step} lang={lang} showPropertyStep={needsPropertySelection} />
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {/* Error Display */}
          {error && (
            <div className="booking-error">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Step Content */}
          <div className={`step-content step-${step}`}>
            {step === 'dates' && (
              <div className="dates-step">
                <h3 className="step-title">{t.selectDates}</h3>
                <div className="dates-layout">
                  <div className="dates-main">
                    <DatePicker />
                  </div>
                  <div className="dates-sidebar">
                    {/* Smart Insights - State of the Art */}
                    {property?.id ? (
                      <>
                        <SmartInsights
                          insights={insights}
                          scarcity={scarcity}
                          loading={priceIntelLoading && !hasPriceData}
                          isRefreshing={priceIntelRefreshing}
                          language={lang}
                        />
                        {/* Flexible Dates - Show alternatives with savings */}
                        {checkIn && checkOut && (hasPriceData || priceIntelLoading) && (
                          <FlexibleDates
                            alternatives={alternatives}
                            requestedDates={requestedDates}
                            onSelectAlternative={handleSelectAlternative}
                            loading={priceIntelLoading && !hasPriceData}
                            isRefreshing={priceIntelRefreshing}
                            language={lang}
                          />
                        )}
                      </>
                    ) : (
                      <div className="insights-placeholder">
                        <div className="placeholder-icon">✨</div>
                        <p>{lang === 'he' ? 'בחר תאריכים כדי לראות דירות זמינות ותובנות מחירים' : 'Select dates to see available apartments and price insights'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 'properties' && (
              <div className="properties-step">
                <PropertySelector />
              </div>
            )}

            {step === 'guests' && (
              <div className="guests-step">
                <div className="step-main">
                  <GuestSelector />
                </div>
                <div className="step-sidebar">
                  <PricingBreakdown />
                  {/* Smart Insights on guests step */}
                  {insights.length > 0 && (
                    <div className="sidebar-insights">
                      <SmartInsights
                        insights={insights.slice(0, 2)}
                        scarcity={scarcity}
                        loading={priceIntelLoading}
                        language={lang}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="details-step">
                <div className="step-main">
                  <GuestForm />
                </div>
                <div className="step-sidebar">
                  <PricingBreakdown />
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="payment-step">
                <PaymentForm onSuccess={handlePaymentSuccess} />
              </div>
            )}

            {step === 'confirmation' && (
              <div className="confirmation-step">
                <BookingConfirmation />
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        {step !== 'confirmation' && step !== 'payment' && (
          <div className="modal-footer">
            {step !== 'dates' && (
              <button className="footer-back" onClick={handleBack}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
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
                  <span className="button-spinner"></span>
                  <span>{lang === 'he' ? 'טוען...' : 'Loading...'}</span>
                </>
              ) : (
                <>
                  <span>{buttonState.text}</span>
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
