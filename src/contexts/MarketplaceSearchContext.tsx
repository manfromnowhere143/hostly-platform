// =============================================================================
// MARKETPLACE SEARCH CONTEXT - Airbnb-Level Property Search
// =============================================================================
// State management for marketplace search with real-time availability
// Aggregates across all hosts for scalable multi-org search
// =============================================================================

'use client'

import { createContext, useContext, useReducer, useCallback, useMemo, ReactNode, useRef } from 'react'

// --- Types -------------------------------------------------------------------

export interface SearchProperty {
  id: string
  slug: string
  name: string
  boomId: number | null  // Required for booking flow integration
  organizationSlug: string
  organizationName?: string
  location?: string
  type?: string
  bedrooms?: number
  beds?: number
  bathrooms?: number
  maxGuests?: number
  photos: Array<{
    id: string
    url: string
    thumbnailUrl?: string
    caption?: string
    isPrimary?: boolean
  }>
  pricing: {
    nights: number
    accommodation: number
    cleaningFee: number
    serviceFee: number
    taxes: number
    total: number
    currency: string
    averageNightlyRate: number
    source: 'boom' | 'hostly'
  } | null
}

export interface SearchState {
  // Search parameters
  location: string | null
  checkIn: Date | null
  checkOut: Date | null
  adults: number
  children: number

  // Search state
  isSearching: boolean
  hasSearched: boolean
  results: SearchProperty[] | null
  error: string | null

  // UI state
  isDatePickerOpen: boolean
  isGuestsPickerOpen: boolean
}

type SearchAction =
  | { type: 'SET_LOCATION'; payload: string | null }
  | { type: 'SET_DATES'; payload: { checkIn: Date | null; checkOut: Date | null } }
  | { type: 'SET_GUESTS'; payload: { adults: number; children: number } }
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; payload: SearchProperty[] }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'TOGGLE_DATE_PICKER'; payload: boolean }
  | { type: 'TOGGLE_GUESTS_PICKER'; payload: boolean }
  | { type: 'CLOSE_ALL_PICKERS' }

// --- Initial State -----------------------------------------------------------

const initialState: SearchState = {
  location: null,
  checkIn: null,
  checkOut: null,
  adults: 2,
  children: 0,
  isSearching: false,
  hasSearched: false,
  results: null,
  error: null,
  isDatePickerOpen: false,
  isGuestsPickerOpen: false,
}

// --- Reducer -----------------------------------------------------------------

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, location: action.payload }

    case 'SET_DATES':
      return {
        ...state,
        checkIn: action.payload.checkIn,
        checkOut: action.payload.checkOut,
      }

    case 'SET_GUESTS':
      return {
        ...state,
        adults: action.payload.adults,
        children: action.payload.children,
      }

    case 'SEARCH_START':
      return {
        ...state,
        isSearching: true,
        error: null,
      }

    case 'SEARCH_SUCCESS':
      return {
        ...state,
        isSearching: false,
        hasSearched: true,
        results: action.payload,
        error: null,
      }

    case 'SEARCH_ERROR':
      return {
        ...state,
        isSearching: false,
        hasSearched: true,
        error: action.payload,
      }

    case 'CLEAR_SEARCH':
      return {
        ...initialState,
        adults: state.adults,
        children: state.children,
      }

    case 'TOGGLE_DATE_PICKER':
      return {
        ...state,
        isDatePickerOpen: action.payload,
        isGuestsPickerOpen: false, // Close other picker
      }

    case 'TOGGLE_GUESTS_PICKER':
      return {
        ...state,
        isGuestsPickerOpen: action.payload,
        isDatePickerOpen: false, // Close other picker
      }

    case 'CLOSE_ALL_PICKERS':
      return {
        ...state,
        isDatePickerOpen: false,
        isGuestsPickerOpen: false,
      }

    default:
      return state
  }
}

// --- Context -----------------------------------------------------------------

interface SearchContextValue {
  state: SearchState
  setLocation: (location: string | null) => void
  setDates: (checkIn: Date | null, checkOut: Date | null) => void
  setGuests: (adults: number, children: number) => void
  search: () => Promise<void>
  clearSearch: () => void
  toggleDatePicker: (open: boolean) => void
  toggleGuestsPicker: (open: boolean) => void
  closeAllPickers: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

// --- Provider ----------------------------------------------------------------

export function MarketplaceSearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Format date for API: YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const setLocation = useCallback((location: string | null) => {
    dispatch({ type: 'SET_LOCATION', payload: location })
  }, [])

  const setDates = useCallback((checkIn: Date | null, checkOut: Date | null) => {
    dispatch({ type: 'SET_DATES', payload: { checkIn, checkOut } })
  }, [])

  const setGuests = useCallback((adults: number, children: number) => {
    dispatch({ type: 'SET_GUESTS', payload: { adults, children } })
  }, [])

  const search = useCallback(async () => {
    const { checkIn, checkOut, adults, children } = state

    // Validate dates
    if (!checkIn || !checkOut) {
      dispatch({ type: 'SEARCH_ERROR', payload: 'Please select check-in and check-out dates' })
      return
    }

    // Cancel any previous search
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    dispatch({ type: 'SEARCH_START' })

    try {
      // Build search URL - aggregate across all organizations
      const params = new URLSearchParams({
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut),
        adults: adults.toString(),
        children: children.toString(),
      })

      const response = await fetch(`/api/public/search?${params}`, {
        signal: controller.signal,
      })

      if (controller.signal.aborted) return

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Search failed')
      }

      const data = await response.json()

      if (data.success) {
        dispatch({ type: 'SEARCH_SUCCESS', payload: data.data.results || [] })
      } else {
        throw new Error(data.error?.message || 'Search failed')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return

      dispatch({
        type: 'SEARCH_ERROR',
        payload: error instanceof Error ? error.message : 'Search failed',
      })
    }
  }, [state])

  const clearSearch = useCallback(() => {
    abortControllerRef.current?.abort()
    dispatch({ type: 'CLEAR_SEARCH' })
  }, [])

  const toggleDatePicker = useCallback((open: boolean) => {
    dispatch({ type: 'TOGGLE_DATE_PICKER', payload: open })
  }, [])

  const toggleGuestsPicker = useCallback((open: boolean) => {
    dispatch({ type: 'TOGGLE_GUESTS_PICKER', payload: open })
  }, [])

  const closeAllPickers = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_PICKERS' })
  }, [])

  const value = useMemo<SearchContextValue>(() => ({
    state,
    setLocation,
    setDates,
    setGuests,
    search,
    clearSearch,
    toggleDatePicker,
    toggleGuestsPicker,
    closeAllPickers,
  }), [state, setLocation, setDates, setGuests, search, clearSearch, toggleDatePicker, toggleGuestsPicker, closeAllPickers])

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

// --- Hook --------------------------------------------------------------------

export function useMarketplaceSearch(): SearchContextValue {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useMarketplaceSearch must be used within a MarketplaceSearchProvider')
  }
  return context
}
