// ═══════════════════════════════════════════════════════════════════════════════
// GUEST SELECTOR - Elegant Guest Count Selection
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback } from 'react';
import { useBooking } from '../../context/BookingContext';

// ─── Counter Component ─────────────────────────────────────────────────────────
function Counter({ value, min = 0, max = 10, onChange, disabled }) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className="guest-counter">
      <button
        type="button"
        className="counter-btn decrease"
        onClick={decrease}
        disabled={disabled || value <= min}
        aria-label="Decrease"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
        </svg>
      </button>
      <span className="counter-value">{value}</span>
      <button
        type="button"
        className="counter-btn increase"
        onClick={increase}
        disabled={disabled || value >= max}
        aria-label="Increase"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GuestSelector() {
  const {
    adults,
    children,
    infants,
    setGuests,
    property,
    totalGuests,
    lang = 'en',
  } = useBooking();

  const maxGuests = property?.maxGuests || 6;
  const remainingCapacity = maxGuests - totalGuests;

  const handleAdultsChange = useCallback((value) => {
    setGuests({ adults: value, children, infants });
  }, [children, infants, setGuests]);

  const handleChildrenChange = useCallback((value) => {
    setGuests({ adults, children: value, infants });
  }, [adults, infants, setGuests]);

  const handleInfantsChange = useCallback((value) => {
    setGuests({ adults, children, infants: value });
  }, [adults, children, setGuests]);

  const texts = {
    en: {
      title: 'Who\'s coming?',
      adults: 'Adults',
      adultsDesc: 'Ages 13+',
      children: 'Children',
      childrenDesc: 'Ages 2-12',
      infants: 'Infants',
      infantsDesc: 'Under 2',
      maxGuests: `This property accommodates up to ${maxGuests} guests`,
    },
    he: {
      title: 'מי מגיע?',
      adults: 'מבוגרים',
      adultsDesc: 'גילאי 13+',
      children: 'ילדים',
      childrenDesc: 'גילאי 2-12',
      infants: 'תינוקות',
      infantsDesc: 'מתחת ל-2',
      maxGuests: `הנכס מכיל עד ${maxGuests} אורחים`,
    },
  };

  const t = texts[lang] || texts.en;

  return (
    <div className="guest-selector">
      <h3 className="guest-selector-title">{t.title}</h3>

      {/* Adults */}
      <div className="guest-row">
        <div className="guest-info">
          <span className="guest-type">{t.adults}</span>
          <span className="guest-desc">{t.adultsDesc}</span>
        </div>
        <Counter
          value={adults}
          min={1}
          max={Math.min(maxGuests, adults + remainingCapacity)}
          onChange={handleAdultsChange}
        />
      </div>

      {/* Children */}
      <div className="guest-row">
        <div className="guest-info">
          <span className="guest-type">{t.children}</span>
          <span className="guest-desc">{t.childrenDesc}</span>
        </div>
        <Counter
          value={children}
          min={0}
          max={Math.min(maxGuests - 1, children + remainingCapacity)}
          onChange={handleChildrenChange}
        />
      </div>

      {/* Infants (don't count toward max) */}
      <div className="guest-row">
        <div className="guest-info">
          <span className="guest-type">{t.infants}</span>
          <span className="guest-desc">{t.infantsDesc}</span>
        </div>
        <Counter
          value={infants}
          min={0}
          max={5}
          onChange={handleInfantsChange}
        />
      </div>

      {/* Capacity Notice */}
      <div className="guest-notice">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <span>{t.maxGuests}</span>
      </div>

      {/* Visual Summary */}
      <div className="guest-summary">
        <div className="guest-icons">
          {[...Array(adults)].map((_, i) => (
            <span key={`adult-${i}`} className="guest-icon adult" title="Adult">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </span>
          ))}
          {[...Array(children)].map((_, i) => (
            <span key={`child-${i}`} className="guest-icon child" title="Child">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </span>
          ))}
          {[...Array(infants)].map((_, i) => (
            <span key={`infant-${i}`} className="guest-icon infant" title="Infant">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <circle cx="12" cy="8" r="4" fill="currentColor"/>
                <path fill="currentColor" d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </span>
          ))}
        </div>
        <span className="guest-total">
          {totalGuests} {lang === 'he' ? 'אורחים' : (totalGuests === 1 ? 'guest' : 'guests')}
          {infants > 0 && ` + ${infants} ${lang === 'he' ? 'תינוקות' : (infants === 1 ? 'infant' : 'infants')}`}
        </span>
      </div>
    </div>
  );
}
