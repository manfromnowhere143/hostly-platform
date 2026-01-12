// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT FORM - State-of-the-Art Stripe Integration
// ═══════════════════════════════════════════════════════════════════════════════
// Apple Pay, Google Pay, Cards - OpenAI-level UX
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useBooking } from '../../context/BookingContext';
import { formatPrice, formatFullDate } from '../../services/booking';

// Support both Vite and Next.js environments
const getStripeKey = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY) {
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  }
  return 'pk_test_placeholder';
};

// Load Stripe (singleton)
const stripePromise = loadStripe(getStripeKey());

// ─── Express Checkout (Apple Pay / Google Pay) ───────────────────────────────
function ExpressCheckout({ onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const { lang = 'en' } = useBooking();
  const [expressAvailable, setExpressAvailable] = useState(false);

  const onConfirm = useCallback(async (event) => {
    if (!stripe || !elements) return;

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError?.(error.message);
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      onError?.(err.message);
    }
  }, [stripe, elements, onSuccess, onError]);

  const onReady = useCallback(({ availablePaymentMethods }) => {
    // Check if any express methods are available
    if (availablePaymentMethods) {
      const hasExpress = Object.values(availablePaymentMethods).some(Boolean);
      setExpressAvailable(hasExpress);
    }
  }, []);

  if (!expressAvailable) {
    return null;
  }

  return (
    <div className="express-checkout">
      <div className="express-checkout-header">
        <span className="express-label">
          {lang === 'he' ? 'תשלום מהיר' : 'Express checkout'}
        </span>
      </div>
      <ExpressCheckoutElement
        onConfirm={onConfirm}
        onReady={onReady}
        options={{
          buttonType: {
            applePay: 'book',
            googlePay: 'book',
          },
          buttonTheme: {
            applePay: 'black',
            googlePay: 'black',
          },
          layout: {
            maxColumns: 2,
            maxRows: 1,
          },
        }}
      />
      <div className="express-divider">
        <span>{lang === 'he' ? 'או שלם עם כרטיס' : 'or pay with card'}</span>
      </div>
    </div>
  );
}

// ─── Payment Form Inner ──────────────────────────────────────────────────────
function PaymentFormInner({ onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const { quote, property, checkIn, checkOut, nights, guest, booking, lang = 'en', isStandaloneMode } = useBooking();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentReady, setPaymentReady] = useState(false);

  const texts = {
    en: {
      title: 'Complete Your Booking',
      subtitle: 'Secure payment powered by Stripe',
      bookingSummary: 'Booking Summary',
      property: 'Property',
      dates: 'Dates',
      nights: 'nights',
      guests: 'Guests',
      total: 'Total',
      payNow: 'Pay & Confirm Booking',
      processing: 'Processing payment...',
      securePayment: 'Your payment is protected by bank-level encryption',
      cardError: 'There was an error processing your payment',
      demoMode: 'Demo Mode - No real payment will be processed',
      demoSuccess: 'Complete Demo Booking',
    },
    he: {
      title: 'השלמת ההזמנה',
      subtitle: 'תשלום מאובטח באמצעות Stripe',
      bookingSummary: 'סיכום הזמנה',
      property: 'נכס',
      dates: 'תאריכים',
      nights: 'לילות',
      guests: 'אורחים',
      total: 'סה״כ',
      payNow: 'שלם ואשר הזמנה',
      processing: 'מעבד תשלום...',
      securePayment: 'התשלום שלך מוגן בהצפנה ברמה בנקאית',
      cardError: 'אירעה שגיאה בעיבוד התשלום',
      demoMode: 'מצב הדגמה - לא יתבצע תשלום אמיתי',
      demoSuccess: 'השלם הזמנת הדגמה',
    },
  };

  const t = texts[lang];
  const isDemoMode = isStandaloneMode || booking?.clientSecret === 'demo_mode';

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Demo mode - skip actual payment
    if (isDemoMode) {
      setIsProcessing(true);
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess?.({ id: 'demo_payment', status: 'succeeded' });
      return;
    }

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Validate form first
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation`,
          receipt_email: guest.email,
          payment_method_data: {
            billing_details: {
              name: `${guest.firstName} ${guest.lastName}`,
              email: guest.email,
              phone: guest.phone,
            },
          },
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setError(err.message || t.cardError);
      setIsProcessing(false);
    }
  }, [stripe, elements, guest, onSuccess, t.cardError, isDemoMode]);

  const handleExpressError = useCallback((message) => {
    setError(message);
  }, []);

  return (
    <div className="payment-form">
      {/* Header */}
      <div className="payment-header">
        <div className="payment-icon">
          <svg viewBox="0 0 24 24" width="32" height="32">
            <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
        </div>
        <div className="payment-header-text">
          <h3 className="payment-title">{t.title}</h3>
          <p className="payment-subtitle">{t.subtitle}</p>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="demo-mode-banner">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span>{t.demoMode}</span>
        </div>
      )}

      {/* Booking Summary Card */}
      <div className="payment-summary-card">
        <div className="summary-property">
          {property?.images?.[0] && (
            <img src={property.images[0]} alt={property.name} className="summary-image" />
          )}
          <div className="summary-property-info">
            <span className="summary-property-name">{property?.name}</span>
            <span className="summary-dates">
              {formatFullDate(checkIn, lang)} → {formatFullDate(checkOut, lang)}
            </span>
            <span className="summary-nights">{nights} {t.nights}</span>
          </div>
        </div>

        <div className="summary-total">
          <span className="summary-total-label">{t.total}</span>
          <span className="summary-total-value">
            {formatPrice(quote?.pricing?.grandTotal || 0, 'ILS')}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="payment-form-inner">
        {/* Express Checkout (Apple Pay / Google Pay) */}
        {!isDemoMode && (
          <ExpressCheckout
            onSuccess={onSuccess}
            onError={handleExpressError}
          />
        )}

        {/* Card Payment */}
        {!isDemoMode && (
          <div className="payment-element-container">
            <PaymentElement
              onReady={() => setPaymentReady(true)}
              options={{
                layout: {
                  type: 'accordion',
                  defaultCollapsed: false,
                  radios: false,
                  spacedAccordionItems: true,
                },
                defaultValues: {
                  billingDetails: {
                    name: `${guest.firstName} ${guest.lastName}`,
                    email: guest.email,
                    phone: guest.phone,
                  },
                },
                business: {
                  name: 'Rently Luxury',
                },
                fields: {
                  billingDetails: 'never', // We already have this info
                },
              }}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="payment-error" role="alert">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="payment-submit-button"
          disabled={(!stripe && !isDemoMode) || isProcessing || (!paymentReady && !isDemoMode)}
        >
          {isProcessing ? (
            <span className="payment-button-processing">
              <span className="payment-spinner"></span>
              <span>{t.processing}</span>
            </span>
          ) : (
            <span className="payment-button-ready">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <span>{isDemoMode ? t.demoSuccess : t.payNow}</span>
              <span className="payment-amount">
                {formatPrice(quote?.pricing?.grandTotal || 0, 'ILS')}
              </span>
            </span>
          )}
        </button>
      </form>

      {/* Security Footer */}
      <div className="payment-security-footer">
        <div className="security-badge">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <span>{t.securePayment}</span>
        </div>

        {/* Payment Method Logos */}
        <div className="payment-method-logos">
          <div className="payment-logo apple-pay" title="Apple Pay">
            <svg viewBox="0 0 50 20" width="40" height="16">
              <path fill="currentColor" d="M9.6 5.3c-.5.6-1.3 1.1-2.1 1-.1-.8.3-1.6.7-2.2.5-.6 1.4-1 2.1-1 .1.8-.2 1.6-.7 2.2zm.7 1.1c-1.2-.1-2.2.7-2.7.7s-1.4-.6-2.4-.6C3.5 6.5 2 7.6 2 10.2c0 1.6.6 3.3 1.4 4.4.7 1 1.5 1.9 2.5 1.9 1 0 1.4-.7 2.6-.7 1.2 0 1.5.7 2.6.7 1.1 0 1.8-.9 2.5-1.9.5-.7.9-1.6 1.1-2.5-2.3-.9-2.7-4.4-.4-5.7-.6-.8-1.5-1.3-2.6-1.3-.9-.1-1.8.4-2.4.4z"/>
            </svg>
          </div>
          <div className="payment-logo google-pay" title="Google Pay">
            <svg viewBox="0 0 50 20" width="40" height="16">
              <path fill="#4285F4" d="M23.8 10.2v3.4h-1.1V6.8h2.9c.7 0 1.3.2 1.8.7.5.5.7 1 .7 1.7 0 .7-.2 1.2-.7 1.7-.5.5-1.1.7-1.8.7h-1.8v-1.4zm0-2.3v2.2h1.9c.4 0 .7-.1 1-.4.3-.3.4-.6.4-1s-.1-.7-.4-1c-.3-.3-.6-.4-1-.4h-1.9z"/>
              <path fill="#34A853" d="M32.4 8.4c.8 0 1.4.2 1.9.7.5.5.7 1.1.7 1.9v3.6h-1v-.8h-.1c-.4.7-1 1-1.8 1-.7 0-1.2-.2-1.7-.6-.4-.4-.7-.9-.7-1.5 0-.7.2-1.2.7-1.6.5-.4 1.1-.6 1.9-.6.7 0 1.2.1 1.6.4v-.3c0-.4-.2-.7-.5-1-.3-.3-.6-.4-1-.4-.6 0-1 .2-1.3.7l-1-.6c.5-.8 1.2-1.2 2.3-1.2v.3zm-1.5 4.3c0 .3.1.5.4.7.2.2.5.3.8.3.4 0 .8-.2 1.2-.5.4-.3.5-.7.5-1.1-.3-.3-.8-.4-1.4-.4-.5 0-.9.1-1.1.3-.3.2-.4.4-.4.7z"/>
              <path fill="#FBBC04" d="M41 8.6l-3.6 8.2h-1.2l1.3-2.9-2.4-5.3h1.2l1.7 4 1.7-4H41z"/>
              <path fill="#EA4335" d="M17 10c0-.3 0-.6-.1-.9h-4.5v1.7h2.6c-.1.5-.4 1-.9 1.4v1.1h1.4c.9-.8 1.5-2 1.5-3.3z"/>
              <path fill="#34A853" d="M12.4 14.3c1.2 0 2.2-.4 2.9-1.1l-1.4-1.1c-.4.3-.9.4-1.5.4-1.2 0-2.2-.8-2.5-1.8H8.4v1.2c.8 1.4 2.3 2.4 4 2.4z"/>
              <path fill="#FBBC04" d="M9.9 10.7c-.1-.3-.2-.6-.2-.9 0-.3.1-.6.2-.9V7.7H8.4c-.3.7-.5 1.4-.5 2.1s.2 1.4.5 2.1l1.5-1.2z"/>
              <path fill="#EA4335" d="M12.4 7.1c.7 0 1.3.2 1.7.7l1.3-1.3c-.8-.7-1.8-1.2-3-1.2-1.7 0-3.2 1-4 2.4l1.5 1.2c.3-1.1 1.3-1.8 2.5-1.8z"/>
            </svg>
          </div>
          <div className="payment-logo visa" title="Visa">
            <svg viewBox="0 0 50 16" width="36" height="12">
              <path fill="#1A1F71" d="M19 1l-3 14h-3l3-14h3zm13 9l1.5-4.2.9 4.2H32zm3.5 5h2.8l-2.5-14h-2.5c-.6 0-1 .3-1.2.8l-4.3 13.2h3l.6-1.7h3.6l.5 1.7zm-8.1-4.6c0-3.6-5-3.8-5-5.4 0-.5.5-1 1.5-1.1.5-.1 1.9-.1 3.4.6l.6-2.9c-.8-.3-1.9-.6-3.2-.6-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6 1.4.7 1.8 1.1 1.8 1.7 0 .9-1.1 1.3-2.1 1.3-1.8 0-2.8-.5-3.6-.9l-.6 3c.8.4 2.3.7 3.9.7 3.6 0 6-1.8 6-4.5M10 1L5 15H2L0 3c0-.5-.2-.8-.6-1-.7-.4-1.9-.7-3-.9l.1-.4h4.8c.6 0 1.2.4 1.3 1.1l1.2 6.3 3-7.4h3.2z"/>
            </svg>
          </div>
          <div className="payment-logo mastercard" title="Mastercard">
            <svg viewBox="0 0 50 30" width="32" height="20">
              <circle fill="#EB001B" cx="15" cy="15" r="15"/>
              <circle fill="#F79E1B" cx="35" cy="15" r="15"/>
              <path fill="#FF5F00" d="M20 5.3c2.8 2.2 4.5 5.6 4.5 9.4s-1.7 7.2-4.5 9.4c2.8 2.2 6.4 3.6 10.3 3.6 9 0 16.3-7.3 16.3-16.3S39.3 0 30.3 0c-3.9 0-7.5 1.4-10.3 3.6z"/>
            </svg>
          </div>
          <div className="payment-logo amex" title="American Express">
            <svg viewBox="0 0 50 30" width="32" height="20">
              <rect fill="#016FD0" width="50" height="30" rx="4"/>
              <path fill="#FFF" d="M8 19h2.6l.6-1.4h1.4l.6 1.4H16v-5l2.2 5h1.5l2.2-5v5h1.3v-6h-2l-2 4.5-2-4.5h-2v5.2l-2.3-5.2H11L8.7 19H8zm6.3-4.8l-.9 2h1.8l-.9-2zM25 19h1.3v-2.4h2.4v-1h-2.4v-1.4h2.7v-1.1H25v6zm5 0h4.2v-1.1h-2.9v-1.4h2.8v-1h-2.8v-1.3h2.9v-1.1H30v6zm5.3 0H37l1.5-2 1.5 2h1.7l-2.3-3 2.2-3h-1.6l-1.4 2-1.4-2h-1.7l2.2 3-2.4 3z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Form Wrapper with Elements ──────────────────────────────────────
export default function PaymentForm({ onSuccess }) {
  const { clientSecret, lang = 'en', isStandaloneMode, booking } = useBooking();
  const isDemoMode = isStandaloneMode || booking?.clientSecret === 'demo_mode';

  // In demo mode, we still need to render the form but won't use Stripe
  if (!clientSecret && !isDemoMode) {
    return (
      <div className="payment-form payment-loading">
        <div className="payment-loader">
          <div className="payment-loader-spinner"></div>
          <span>{lang === 'he' ? 'מכין תשלום מאובטח...' : 'Preparing secure payment...'}</span>
        </div>
      </div>
    );
  }

  const options = {
    ...(clientSecret && clientSecret !== 'demo_mode' && { clientSecret }),
    appearance: {
      theme: 'flat',
      variables: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        fontSizeBase: '15px',
        fontWeightNormal: '500',
        colorPrimary: '#b5846d',
        colorBackground: '#ffffff',
        colorText: '#1a1a1a',
        colorDanger: '#dc3545',
        colorSuccess: '#22c55e',
        borderRadius: '12px',
        spacingUnit: '4px',
        spacingGridRow: '16px',
        spacingGridColumn: '16px',
      },
      rules: {
        '.Input': {
          border: '2px solid #e8e2da',
          boxShadow: 'none',
          padding: '14px 16px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        },
        '.Input:hover': {
          borderColor: '#d4cec6',
        },
        '.Input:focus': {
          border: '2px solid #b5846d',
          boxShadow: '0 0 0 4px rgba(181, 132, 109, 0.12)',
          outline: 'none',
        },
        '.Input--invalid': {
          border: '2px solid #dc3545',
          boxShadow: '0 0 0 4px rgba(220, 53, 69, 0.1)',
        },
        '.Label': {
          fontWeight: '600',
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          color: '#666',
        },
        '.Tab': {
          border: '2px solid #e8e2da',
          borderRadius: '12px',
          padding: '14px 16px',
          transition: 'all 0.2s',
        },
        '.Tab:hover': {
          borderColor: '#d4cec6',
        },
        '.Tab--selected': {
          borderColor: '#b5846d',
          backgroundColor: 'rgba(181, 132, 109, 0.04)',
          boxShadow: '0 0 0 4px rgba(181, 132, 109, 0.08)',
        },
        '.TabIcon': {
          fill: '#666',
        },
        '.TabIcon--selected': {
          fill: '#b5846d',
        },
        '.Error': {
          fontSize: '13px',
          marginTop: '8px',
        },
        '.CheckboxInput': {
          borderColor: '#e8e2da',
        },
        '.CheckboxInput--checked': {
          backgroundColor: '#b5846d',
          borderColor: '#b5846d',
        },
      },
    },
    loader: 'always',
  };

  // For demo mode, create a minimal Elements wrapper
  if (isDemoMode) {
    return (
      <Elements stripe={stripePromise} options={{ ...options, mode: 'payment', amount: 100000, currency: 'ils' }}>
        <PaymentFormInner onSuccess={onSuccess} />
      </Elements>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormInner onSuccess={onSuccess} />
    </Elements>
  );
}
