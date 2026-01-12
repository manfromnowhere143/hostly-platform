// ═══════════════════════════════════════════════════════════════════════════════
// PRICING BREAKDOWN - Elegant Price Display
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { formatPrice } from '../../services/booking';

export default function PricingBreakdown() {
  const {
    quote,
    quoteLoading,
    nights,
    promoCode,
    setPromoCode,
    promoApplied,
    fetchQuote,
    lang = 'en',
  } = useBooking();

  const [promoInput, setPromoInput] = useState(promoCode);
  const [showDetails, setShowDetails] = useState(false);

  const texts = {
    en: {
      loading: 'Calculating price...',
      nights: 'nights',
      accommodation: 'Accommodation',
      cleaningFee: 'Cleaning fee',
      serviceFee: 'Service fee',
      taxes: 'Taxes & fees',
      discount: 'Discount',
      total: 'Total',
      promoPlaceholder: 'Promo code',
      apply: 'Apply',
      applied: 'Applied',
      viewDetails: 'View price breakdown',
      hideDetails: 'Hide breakdown',
      perNight: 'avg/night',
    },
    he: {
      loading: 'מחשב מחיר...',
      nights: 'לילות',
      accommodation: 'לינה',
      cleaningFee: 'דמי ניקיון',
      serviceFee: 'עמלת שירות',
      taxes: 'מיסים ועמלות',
      discount: 'הנחה',
      total: 'סה״כ',
      promoPlaceholder: 'קוד קופון',
      apply: 'החל',
      applied: 'הוחל',
      viewDetails: 'הצג פירוט מחירים',
      hideDetails: 'הסתר פירוט',
      perNight: 'ממוצע/לילה',
    },
  };

  const t = texts[lang];

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoCode(promoInput.trim());
    // Quote will be fetched automatically when promo changes
  };

  useEffect(() => {
    // Fetch quote when promo code changes
    if (promoCode) {
      fetchQuote();
    }
  }, [promoCode, fetchQuote]);

  if (quoteLoading) {
    return (
      <div className="pricing-breakdown loading">
        <div className="pricing-loader">
          <div className="loader-spinner"></div>
          <span>{t.loading}</span>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const {
    pricing: {
      accommodationTotal,
      cleaningFee,
      serviceFee,
      taxes,
      discounts,
      discountTotal,
      grandTotal,
      nightlyRates,
    },
  } = quote;

  const avgPerNight = Math.round(accommodationTotal / nights);

  return (
    <div className="pricing-breakdown">
      {/* Summary Header */}
      <div className="pricing-header">
        <div className="pricing-total-display">
          <span className="total-amount">{formatPrice(grandTotal, 'ILS')}</span>
          <span className="total-label">{t.total}</span>
        </div>
        <div className="pricing-meta">
          <span className="nights-count">{nights} {t.nights}</span>
          <span className="per-night">
            {formatPrice(avgPerNight, 'ILS')} {t.perNight}
          </span>
        </div>
      </div>

      {/* Promo Code */}
      <div className="promo-code-section">
        <div className="promo-input-wrapper">
          <input
            type="text"
            className="promo-input"
            placeholder={t.promoPlaceholder}
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            disabled={promoApplied}
          />
          <button
            className={`promo-button ${promoApplied ? 'applied' : ''}`}
            onClick={handleApplyPromo}
            disabled={!promoInput.trim() || promoApplied}
          >
            {promoApplied ? (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                {t.applied}
              </>
            ) : t.apply}
          </button>
        </div>
      </div>

      {/* Toggle Details */}
      <button
        className="toggle-details"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? t.hideDetails : t.viewDetails}
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
        </svg>
      </button>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="pricing-details">
          {/* Nightly Rates */}
          <div className="pricing-row nightly-rates">
            <div className="row-label">
              <span>{t.accommodation}</span>
              <span className="row-sublabel">{nights} {t.nights}</span>
            </div>
            <span className="row-amount">{formatPrice(accommodationTotal, 'ILS')}</span>
          </div>

          {/* Individual nights (collapsed by default) */}
          <div className="nightly-breakdown">
            {nightlyRates?.slice(0, 3).map((rate, i) => (
              <div key={i} className="night-rate">
                <span className="night-date">{rate.date}</span>
                <span className="night-price">{formatPrice(rate.price, 'ILS')}</span>
                {rate.reason && <span className="night-reason">{rate.reason}</span>}
              </div>
            ))}
            {nightlyRates?.length > 3 && (
              <div className="night-rate more">
                +{nightlyRates.length - 3} more nights
              </div>
            )}
          </div>

          {/* Cleaning Fee */}
          {cleaningFee > 0 && (
            <div className="pricing-row">
              <span className="row-label">{t.cleaningFee}</span>
              <span className="row-amount">{formatPrice(cleaningFee, 'ILS')}</span>
            </div>
          )}

          {/* Service Fee */}
          {serviceFee > 0 && (
            <div className="pricing-row">
              <span className="row-label">{t.serviceFee}</span>
              <span className="row-amount">{formatPrice(serviceFee, 'ILS')}</span>
            </div>
          )}

          {/* Taxes */}
          {taxes > 0 && (
            <div className="pricing-row">
              <span className="row-label">{t.taxes}</span>
              <span className="row-amount">{formatPrice(taxes, 'ILS')}</span>
            </div>
          )}

          {/* Discounts */}
          {discounts?.map((discount, i) => (
            <div key={i} className="pricing-row discount">
              <span className="row-label">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path fill="currentColor" d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                </svg>
                {discount.description}
              </span>
              <span className="row-amount">-{formatPrice(discount.amount, 'ILS')}</span>
            </div>
          ))}

          {/* Divider */}
          <div className="pricing-divider"></div>

          {/* Total */}
          <div className="pricing-row total">
            <span className="row-label">{t.total}</span>
            <span className="row-amount">{formatPrice(grandTotal, 'ILS')}</span>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="pricing-trust">
        <div className="trust-item">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          <span>{lang === 'he' ? 'תשלום מאובטח' : 'Secure payment'}</span>
        </div>
        <div className="trust-item">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>{lang === 'he' ? 'אישור מיידי' : 'Instant confirmation'}</span>
        </div>
      </div>
    </div>
  );
}
