// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING CONTEXT - State Management
// ═══════════════════════════════════════════════════════════════════════════════
// Production-ready booking state with Hostly/Boom API integration
// ═══════════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { bookingAPI, formatDate, diffDays } from '../services/booking';

// ─── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
  // Current step in booking flow
  step: 'dates', // 'dates' | 'properties' | 'guests' | 'details' | 'payment' | 'confirmation'

  // Language
  lang: 'en', // 'en' | 'he'

  // Selected property
  property: null,
  propertySlug: null,

  // Calendar data (90 days)
  calendar: [],
  calendarLoading: false,

  // Booking dates
  checkIn: null,
  checkOut: null,

  // Guests
  adults: 2,
  children: 0,
  infants: 0,

  // Availability
  availability: null,
  availabilityLoading: false,

  // Quote/Pricing
  quote: null,
  quoteLoading: false,
  promoCode: '',
  promoApplied: false,

  // Guest information
  guest: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  specialRequests: '',

  // Booking result
  booking: null,
  bookingLoading: false,

  // Payment
  clientSecret: null,
  paymentIntentId: null,

  // Modal state
  isOpen: false,

  // Errors
  error: null,

  // API Mode
  isStandaloneMode: true,
};

// ─── Action Types ──────────────────────────────────────────────────────────────
const ActionTypes = {
  OPEN_BOOKING: 'OPEN_BOOKING',
  CLOSE_BOOKING: 'CLOSE_BOOKING',
  SET_STEP: 'SET_STEP',
  SET_DATES: 'SET_DATES',
  SELECT_PROPERTY: 'SELECT_PROPERTY',
  SET_GUESTS: 'SET_GUESTS',
  SET_GUEST_INFO: 'SET_GUEST_INFO',
  SET_SPECIAL_REQUESTS: 'SET_SPECIAL_REQUESTS',
  SET_PROMO_CODE: 'SET_PROMO_CODE',
  SET_CALENDAR: 'SET_CALENDAR',
  SET_CALENDAR_LOADING: 'SET_CALENDAR_LOADING',
  SET_AVAILABILITY: 'SET_AVAILABILITY',
  SET_AVAILABILITY_LOADING: 'SET_AVAILABILITY_LOADING',
  SET_QUOTE: 'SET_QUOTE',
  SET_QUOTE_LOADING: 'SET_QUOTE_LOADING',
  SET_BOOKING: 'SET_BOOKING',
  SET_BOOKING_LOADING: 'SET_BOOKING_LOADING',
  SET_PAYMENT_INFO: 'SET_PAYMENT_INFO',
  SET_ERROR: 'SET_ERROR',
  RESET: 'RESET',
};

// ─── Reducer ───────────────────────────────────────────────────────────────────
function bookingReducer(state, action) {
  switch (action.type) {
    case ActionTypes.OPEN_BOOKING:
      return {
        ...initialState,
        isOpen: true,
        property: action.payload.property,
        propertySlug: action.payload.propertySlug,
        lang: action.payload.lang || 'en',
        isStandaloneMode: bookingAPI.isStandaloneMode(),
      };

    case ActionTypes.CLOSE_BOOKING:
      return { ...state, isOpen: false };

    case ActionTypes.SET_STEP:
      return { ...state, step: action.payload, error: null };

    case ActionTypes.SET_DATES:
      return {
        ...state,
        checkIn: action.payload.checkIn,
        checkOut: action.payload.checkOut,
        quote: null, // Reset quote when dates change
        availability: null,
      };

    case ActionTypes.SELECT_PROPERTY:
      return {
        ...state,
        property: action.payload.property,
        propertySlug: action.payload.slug,
        quote: null, // Reset quote when property changes
      };

    case ActionTypes.SET_GUESTS:
      return {
        ...state,
        adults: action.payload.adults ?? state.adults,
        children: action.payload.children ?? state.children,
        infants: action.payload.infants ?? state.infants,
        quote: null, // Reset quote when guests change
      };

    case ActionTypes.SET_GUEST_INFO:
      return {
        ...state,
        guest: { ...state.guest, ...action.payload },
      };

    case ActionTypes.SET_SPECIAL_REQUESTS:
      return { ...state, specialRequests: action.payload };

    case ActionTypes.SET_PROMO_CODE:
      return {
        ...state,
        promoCode: action.payload,
        promoApplied: false,
        quote: null, // Reset quote when promo changes
      };

    case ActionTypes.SET_CALENDAR:
      return { ...state, calendar: action.payload, calendarLoading: false };

    case ActionTypes.SET_CALENDAR_LOADING:
      return { ...state, calendarLoading: action.payload };

    case ActionTypes.SET_AVAILABILITY:
      return { ...state, availability: action.payload, availabilityLoading: false };

    case ActionTypes.SET_AVAILABILITY_LOADING:
      return { ...state, availabilityLoading: action.payload };

    case ActionTypes.SET_QUOTE:
      return {
        ...state,
        quote: action.payload,
        quoteLoading: false,
        promoApplied: !!state.promoCode && !!action.payload?.pricing?.promoDiscount,
      };

    case ActionTypes.SET_QUOTE_LOADING:
      return { ...state, quoteLoading: action.payload };

    case ActionTypes.SET_BOOKING:
      return { ...state, booking: action.payload, bookingLoading: false };

    case ActionTypes.SET_BOOKING_LOADING:
      return { ...state, bookingLoading: action.payload };

    case ActionTypes.SET_PAYMENT_INFO:
      return {
        ...state,
        clientSecret: action.payload.clientSecret,
        paymentIntentId: action.payload.paymentIntentId,
      };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case ActionTypes.RESET:
      return initialState;

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────
const BookingContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const openBooking = useCallback((property, propertySlug, lang = 'en') => {
    dispatch({
      type: ActionTypes.OPEN_BOOKING,
      payload: { property, propertySlug, lang },
    });
  }, []);

  const closeBooking = useCallback(() => {
    dispatch({ type: ActionTypes.CLOSE_BOOKING });
  }, []);

  const setStep = useCallback((step) => {
    dispatch({ type: ActionTypes.SET_STEP, payload: step });
  }, []);

  const setDates = useCallback((checkIn, checkOut) => {
    dispatch({
      type: ActionTypes.SET_DATES,
      payload: { checkIn, checkOut },
    });
  }, []);

  const selectProperty = useCallback((hostlyProperty) => {
    // Transform Hostly property to local format with images from config
    const property = {
      id: hostlyProperty.id,
      slug: hostlyProperty.slug,
      name: hostlyProperty.name,
      bedrooms: hostlyProperty.bedrooms,
      beds: hostlyProperty.beds,
      bathrooms: hostlyProperty.bathrooms,
      maxGuests: hostlyProperty.maxGuests,
      pricing: hostlyProperty.pricing,
      // Images will be added from local config in the modal
    };

    dispatch({
      type: ActionTypes.SELECT_PROPERTY,
      payload: { property, slug: hostlyProperty.slug },
    });
  }, []);

  const setGuests = useCallback((guests) => {
    dispatch({ type: ActionTypes.SET_GUESTS, payload: guests });
  }, []);

  const setGuestInfo = useCallback((info) => {
    dispatch({ type: ActionTypes.SET_GUEST_INFO, payload: info });
  }, []);

  const setSpecialRequests = useCallback((requests) => {
    dispatch({ type: ActionTypes.SET_SPECIAL_REQUESTS, payload: requests });
  }, []);

  const setPromoCode = useCallback((code) => {
    dispatch({ type: ActionTypes.SET_PROMO_CODE, payload: code });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  }, []);

  // ─── Async Actions ───────────────────────────────────────────────────────────

  const loadCalendar = useCallback(async (propertySlug) => {
    dispatch({ type: ActionTypes.SET_CALENDAR_LOADING, payload: true });
    try {
      // Pass property for standalone mode
      const data = await bookingAPI.getProperty(propertySlug, state.property);
      dispatch({ type: ActionTypes.SET_CALENDAR, payload: data.calendar || [] });
    } catch (error) {
      console.error('Calendar load error:', error);
      // In case of error, provide empty calendar
      dispatch({ type: ActionTypes.SET_CALENDAR, payload: [] });
    }
  }, [state.property]);

  const checkAvailability = useCallback(async () => {
    if (!state.checkIn || !state.checkOut) return null;

    // Skip API call if no property selected - availability will be checked via available-properties
    if (!state.property?.id) {
      console.log('[BookingContext] Skipping availability check - no property selected yet');
      return { available: true }; // Assume available until property selected
    }

    dispatch({ type: ActionTypes.SET_AVAILABILITY_LOADING, payload: true });
    try {
      const data = await bookingAPI.checkAvailability({
        property: state.property, // Pass full property for standalone mode
        propertyId: state.property?.id,
        checkIn: formatDate(state.checkIn),
        checkOut: formatDate(state.checkOut),
        adults: state.adults,
        children: state.children,
      });
      dispatch({ type: ActionTypes.SET_AVAILABILITY, payload: data });
      return data;
    } catch (error) {
      console.error('Availability check error:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_AVAILABILITY_LOADING, payload: false });
      return null;
    }
  }, [state.property, state.checkIn, state.checkOut, state.adults, state.children]);

  const fetchQuote = useCallback(async () => {
    if (!state.checkIn || !state.checkOut) return null;

    // Skip API call if no property selected
    if (!state.property?.id) return null;

    dispatch({ type: ActionTypes.SET_QUOTE_LOADING, payload: true });
    try {
      const data = await bookingAPI.getQuote({
        property: state.property,
        propertyId: state.property?.id,
        checkIn: formatDate(state.checkIn),
        checkOut: formatDate(state.checkOut),
        adults: state.adults,
        children: state.children,
        promoCode: state.promoCode || undefined,
      });
      dispatch({ type: ActionTypes.SET_QUOTE, payload: data });
      return data;
    } catch (error) {
      console.error('Quote fetch error:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_QUOTE_LOADING, payload: false });
      return null;
    }
  }, [
    state.property,
    state.checkIn,
    state.checkOut,
    state.adults,
    state.children,
    state.promoCode,
  ]);

  const createBooking = useCallback(async () => {
    if (!state.checkIn || !state.checkOut || !state.guest.email) {
      throw new Error('Missing required booking information');
    }

    // CRITICAL: Validate property ID before attempting to create booking
    if (!state.property?.id) {
      console.error('[BookingContext] No property selected:', state.property);
      throw new Error('Please select a property before booking');
    }

    dispatch({ type: ActionTypes.SET_BOOKING_LOADING, payload: true });
    try {
      const data = await bookingAPI.createBooking({
        property: state.property, // Pass full property for standalone mode
        propertyId: state.property?.id,
        checkIn: formatDate(state.checkIn),
        checkOut: formatDate(state.checkOut),
        adults: state.adults,
        children: state.children,
        guest: state.guest,
        promoCode: state.promoCode || undefined,
        specialRequests: state.specialRequests || undefined,
      });

      dispatch({ type: ActionTypes.SET_BOOKING, payload: data });
      dispatch({
        type: ActionTypes.SET_PAYMENT_INFO,
        payload: {
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId,
        },
      });

      return data;
    } catch (error) {
      console.error('Booking creation error:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_BOOKING_LOADING, payload: false });
      throw error;
    }
  }, [
    state.property,
    state.checkIn,
    state.checkOut,
    state.adults,
    state.children,
    state.guest,
    state.promoCode,
    state.specialRequests,
  ]);

  const reset = useCallback(() => {
    dispatch({ type: ActionTypes.RESET });
  }, []);

  // ─── Computed Values ─────────────────────────────────────────────────────────

  const nights = useMemo(() => {
    if (!state.checkIn || !state.checkOut) return 0;
    return diffDays(state.checkIn, state.checkOut);
  }, [state.checkIn, state.checkOut]);

  const totalGuests = useMemo(() => {
    return state.adults + state.children;
  }, [state.adults, state.children]);

  // Can proceed to guests step when dates are selected and available
  const canProceedToGuests = useMemo(() => {
    return state.checkIn && state.checkOut && nights > 0 &&
      (state.availability?.available !== false); // Allow if not explicitly unavailable
  }, [state.checkIn, state.checkOut, nights, state.availability]);

  // Can proceed to details step when guests are set and quote is loaded
  const canProceedToDetails = useMemo(() => {
    return canProceedToGuests && state.adults >= 1 && state.quote;
  }, [canProceedToGuests, state.adults, state.quote]);

  // Can proceed to payment when guest info is complete
  const canProceedToPayment = useMemo(() => {
    const { firstName, lastName, email, phone } = state.guest;
    return canProceedToDetails && firstName && lastName && email && phone;
  }, [canProceedToDetails, state.guest]);

  // ─── Context Value ───────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      // State
      ...state,
      nights,
      totalGuests,
      canProceedToGuests,
      canProceedToDetails,
      canProceedToPayment,

      // Actions
      openBooking,
      closeBooking,
      setStep,
      setDates,
      selectProperty,
      setGuests,
      setGuestInfo,
      setSpecialRequests,
      setPromoCode,
      setError,
      loadCalendar,
      checkAvailability,
      fetchQuote,
      createBooking,
      reset,
    }),
    [
      state,
      nights,
      totalGuests,
      canProceedToGuests,
      canProceedToDetails,
      canProceedToPayment,
      openBooking,
      closeBooking,
      setStep,
      setDates,
      selectProperty,
      setGuests,
      setGuestInfo,
      setSpecialRequests,
      setPromoCode,
      setError,
      loadCalendar,
      checkAvailability,
      fetchQuote,
      createBooking,
      reset,
    ]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export default BookingContext;
