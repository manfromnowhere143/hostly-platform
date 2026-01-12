// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING CONFIRMATION - Success Screen
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { formatPrice, formatFullDate } from '../../services/booking';

// ─── Confetti Animation ────────────────────────────────────────────────────────
function Confetti() {
  const colors = ['#b5846d', '#d4af37', '#2d5a4a', '#8b4513', '#daa520'];

  return (
    <div className="confetti-container">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function BookingConfirmation() {
  const {
    booking,
    property,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    guest,
    quote,
    closeBooking,
    lang = 'en',
  } = useBooking();

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const texts = {
    en: {
      title: 'Booking Confirmed!',
      subtitle: 'Your reservation is complete',
      confirmationCode: 'Confirmation Code',
      property: 'Property',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      guests: 'Guests',
      adults: 'adults',
      children: 'children',
      total: 'Total Paid',
      emailSent: 'A confirmation email has been sent to',
      whatNext: 'What\'s Next?',
      step1: 'Check your email for confirmation details',
      step2: 'Save your confirmation code',
      step3: 'Pack your bags and get ready!',
      contact: 'Need help? Contact us',
      whatsapp: 'WhatsApp',
      close: 'Done',
      checkInTime: 'Check-in: 3:00 PM',
      checkOutTime: 'Check-out: 11:00 AM',
    },
    he: {
      title: 'ההזמנה אושרה!',
      subtitle: 'ההזמנה שלך הושלמה',
      confirmationCode: 'קוד אישור',
      property: 'נכס',
      checkIn: 'צ\'ק-אין',
      checkOut: 'צ\'ק-אאוט',
      guests: 'אורחים',
      adults: 'מבוגרים',
      children: 'ילדים',
      total: 'סה״כ שולם',
      emailSent: 'אימייל אישור נשלח ל-',
      whatNext: 'מה הלאה?',
      step1: 'בדוק את האימייל לפרטי האישור',
      step2: 'שמור את קוד האישור',
      step3: 'ארוז את התיקים והתכונן!',
      contact: 'צריך עזרה? צור קשר',
      whatsapp: 'וואטסאפ',
      close: 'סיום',
      checkInTime: 'צ\'ק-אין: 15:00',
      checkOutTime: 'צ\'ק-אאוט: 11:00',
    },
  };

  const t = texts[lang];

  return (
    <div className="booking-confirmation">
      {showConfetti && <Confetti />}

      {/* Success Animation */}
      <div className="confirmation-header">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path
              fill="#22c55e"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </div>
        <h2 className="confirmation-title">{t.title}</h2>
        <p className="confirmation-subtitle">{t.subtitle}</p>
      </div>

      {/* Confirmation Code */}
      <div className="confirmation-code">
        <span className="code-label">{t.confirmationCode}</span>
        <span className="code-value">{booking?.confirmationCode || 'RNTLY-XXXX'}</span>
      </div>

      {/* Booking Details Card */}
      <div className="confirmation-details">
        <div className="detail-row property-row">
          <div className="property-image">
            {property?.images?.[0] && (
              <img src={property.images[0]} alt={property.name} />
            )}
          </div>
          <div className="property-info">
            <span className="detail-label">{t.property}</span>
            <span className="detail-value">{property?.name}</span>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-row">
            <span className="detail-label">{t.checkIn}</span>
            <span className="detail-value">{formatFullDate(checkIn, lang)}</span>
            <span className="detail-meta">{t.checkInTime}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t.checkOut}</span>
            <span className="detail-value">{formatFullDate(checkOut, lang)}</span>
            <span className="detail-meta">{t.checkOutTime}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t.guests}</span>
            <span className="detail-value">
              {adults} {t.adults}
              {children > 0 && `, ${children} ${t.children}`}
            </span>
          </div>

          <div className="detail-row total">
            <span className="detail-label">{t.total}</span>
            <span className="detail-value">
              {formatPrice(quote?.pricing?.grandTotal || 0, 'ILS')}
            </span>
          </div>
        </div>
      </div>

      {/* Email Confirmation */}
      <div className="email-confirmation">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        <span>{t.emailSent}</span>
        <strong>{guest.email}</strong>
      </div>

      {/* What's Next */}
      <div className="whats-next">
        <h3 className="whats-next-title">{t.whatNext}</h3>
        <div className="next-steps">
          <div className="step">
            <div className="step-number">1</div>
            <span>{t.step1}</span>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <span>{t.step2}</span>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <span>{t.step3}</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="confirmation-contact">
        <span>{t.contact}</span>
        <a
          href="https://wa.me/972506111747"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-button"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {t.whatsapp}
        </a>
      </div>

      {/* Close Button */}
      <button className="confirmation-close" onClick={closeBooking}>
        {t.close}
      </button>
    </div>
  );
}
