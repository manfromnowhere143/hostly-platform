// ═══════════════════════════════════════════════════════════════════════════════
// GUEST FORM - Elegant Guest Information Form
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, memo } from 'react';
import { useBooking } from '../../context/BookingContext';

// ─── Input Field Component (defined outside to prevent re-creation) ────────────
const FormInput = memo(function FormInput({
  name,
  label,
  type = 'text',
  value,
  error,
  onChange,
  onBlur,
  autoComplete,
  dir,
}) {
  return (
    <div className={`form-field ${error ? 'error' : ''}`}>
      <label className="form-label" htmlFor={`guest-${name}`}>
        {label}
        <span className="required-mark">*</span>
      </label>
      <input
        id={`guest-${name}`}
        name={name}
        type={type}
        className="form-input"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        dir={dir}
      />
      {error && (
        <span className="form-error">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  );
});

export default function GuestForm() {
  const {
    guest,
    setGuestInfo,
    specialRequests,
    setSpecialRequests,
    lang = 'en',
  } = useBooking();

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const texts = {
    en: {
      title: 'Guest Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      specialRequests: 'Special Requests',
      specialRequestsPlaceholder: 'Early check-in, late check-out, special occasion...',
      required: 'Required',
      invalidEmail: 'Invalid email',
      invalidPhone: 'Invalid phone number',
      optional: '(optional)',
      confirmationNote: 'Confirmation will be sent to ',
    },
    he: {
      title: 'פרטי האורח',
      firstName: 'שם פרטי',
      lastName: 'שם משפחה',
      email: 'אימייל',
      phone: 'טלפון',
      specialRequests: 'בקשות מיוחדות',
      specialRequestsPlaceholder: 'צ\'ק-אין מוקדם, צ\'ק-אאוט מאוחר, אירוע מיוחד...',
      required: 'שדה חובה',
      invalidEmail: 'אימייל לא תקין',
      invalidPhone: 'מספר טלפון לא תקין',
      optional: '(אופציונלי)',
      confirmationNote: 'אישור יישלח ל-',
    },
  };

  const t = texts[lang];

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim().length < 2 ? t.required : null;
      case 'email':
        if (!value.trim()) return t.required;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? t.invalidEmail : null;
      case 'phone':
        if (!value.trim()) return t.required;
        const phoneRegex = /^[\d\s\-+()]{8,}$/;
        return !phoneRegex.test(value.replace(/\s/g, '')) ? t.invalidPhone : null;
      default:
        return null;
    }
  }, [t]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setGuestInfo({ [name]: value });

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [setGuestInfo, touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, guest[name] || '');
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [guest, validateField]);

  return (
    <div className="guest-form">
      <h3 className="guest-form-title">{t.title}</h3>

      <div className="form-grid">
        <FormInput
          name="firstName"
          label={t.firstName}
          value={guest.firstName || ''}
          error={errors.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="given-name"
          dir={lang === 'he' ? 'rtl' : 'ltr'}
        />
        <FormInput
          name="lastName"
          label={t.lastName}
          value={guest.lastName || ''}
          error={errors.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="family-name"
          dir={lang === 'he' ? 'rtl' : 'ltr'}
        />
        <FormInput
          name="email"
          label={t.email}
          type="email"
          value={guest.email || ''}
          error={errors.email}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="email"
          dir="ltr"
        />
        <FormInput
          name="phone"
          label={t.phone}
          type="tel"
          value={guest.phone || ''}
          error={errors.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="tel"
          dir="ltr"
        />
      </div>

      <div className="form-field special-requests">
        <label className="form-label" htmlFor="guest-specialRequests">
          {t.specialRequests}
          <span className="optional">{t.optional}</span>
        </label>
        <textarea
          id="guest-specialRequests"
          className="form-textarea"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder={t.specialRequestsPlaceholder}
          rows={3}
          dir={lang === 'he' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Contact Summary */}
      {guest.email && (
        <div className="contact-summary">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <span>{t.confirmationNote}</span>
          <strong>{guest.email}</strong>
        </div>
      )}
    </div>
  );
}
