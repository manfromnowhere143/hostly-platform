// =============================================================================
// GUESTS PICKER - Elegant Guest Count Selector
// =============================================================================
// Airbnb-inspired guest selection with smooth animations
// Uses fixed positioning with portal to ensure visibility
// =============================================================================

'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// --- Types -------------------------------------------------------------------

interface GuestsPickerProps {
  adults: number
  children: number
  onSelect: (adults: number, children: number) => void
  isOpen: boolean
  onClose: () => void
  lang?: 'en' | 'he'
  anchorRef?: React.RefObject<HTMLElement>
}

// --- Translations ------------------------------------------------------------

const translations = {
  en: {
    adults: 'Adults',
    adultsDesc: 'Ages 13 or above',
    children: 'Children',
    childrenDesc: 'Ages 2-12',
    done: 'Done',
  },
  he: {
    adults: 'מבוגרים',
    adultsDesc: 'גיל 13 ומעלה',
    children: 'ילדים',
    childrenDesc: 'גיל 2-12',
    done: 'סיום',
  },
}

// --- Component ---------------------------------------------------------------

export function GuestsPicker({
  adults,
  children,
  onSelect,
  isOpen,
  onClose,
  lang = 'en',
  anchorRef,
}: GuestsPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const t = translations[lang]
  const isRTL = lang === 'he'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position based on anchor element
  useEffect(() => {
    if (!isOpen || !anchorRef?.current) return

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect()
      const pickerWidth = 320

      // Position to the right side for the Who section
      let left = rect.right - pickerWidth

      // Ensure it doesn't go off screen
      if (left < 16) left = 16

      setPosition({
        top: rect.bottom + 8,
        left,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, anchorRef])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close on escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const incrementAdults = () => {
    if (adults < 16) onSelect(adults + 1, children)
  }

  const decrementAdults = () => {
    if (adults > 1) onSelect(adults - 1, children)
  }

  const incrementChildren = () => {
    if (children < 8) onSelect(adults, children + 1)
  }

  const decrementChildren = () => {
    if (children > 0) onSelect(adults, children - 1)
  }

  if (!isOpen || !mounted) return null

  const pickerContent = (
    <div
      ref={containerRef}
      className="fixed bg-white rounded-2xl shadow-2xl border border-[var(--neutral-200)] p-6"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 99999,
        minWidth: 320,
        animation: 'fadeInScale 0.15s ease-out',
      }}
    >
      {/* Adults Row */}
      <div className={`flex items-center justify-between py-4 border-b border-[var(--neutral-100)] ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <div className={`text-[15px] font-medium text-[var(--foreground)] ${isRTL ? 'font-heebo' : ''}`}>
            {t.adults}
          </div>
          <div className={`text-[13px] text-[var(--neutral-500)] ${isRTL ? 'font-heebo' : ''}`}>
            {t.adultsDesc}
          </div>
        </div>
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            type="button"
            onClick={decrementAdults}
            disabled={adults <= 1}
            className={`
              w-8 h-8 flex items-center justify-center
              border border-[var(--neutral-300)] rounded-full
              text-[var(--neutral-600)] hover:border-[var(--foreground)]
              transition-colors
              ${adults <= 1 ? 'opacity-30 cursor-not-allowed' : ''}
            `}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
          </button>
          <span className="w-8 text-center text-[16px] font-medium text-[var(--foreground)]">
            {adults}
          </span>
          <button
            type="button"
            onClick={incrementAdults}
            disabled={adults >= 16}
            className={`
              w-8 h-8 flex items-center justify-center
              border border-[var(--neutral-300)] rounded-full
              text-[var(--neutral-600)] hover:border-[var(--foreground)]
              transition-colors
              ${adults >= 16 ? 'opacity-30 cursor-not-allowed' : ''}
            `}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Children Row */}
      <div className={`flex items-center justify-between py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <div className={`text-[15px] font-medium text-[var(--foreground)] ${isRTL ? 'font-heebo' : ''}`}>
            {t.children}
          </div>
          <div className={`text-[13px] text-[var(--neutral-500)] ${isRTL ? 'font-heebo' : ''}`}>
            {t.childrenDesc}
          </div>
        </div>
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            type="button"
            onClick={decrementChildren}
            disabled={children <= 0}
            className={`
              w-8 h-8 flex items-center justify-center
              border border-[var(--neutral-300)] rounded-full
              text-[var(--neutral-600)] hover:border-[var(--foreground)]
              transition-colors
              ${children <= 0 ? 'opacity-30 cursor-not-allowed' : ''}
            `}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
          </button>
          <span className="w-8 text-center text-[16px] font-medium text-[var(--foreground)]">
            {children}
          </span>
          <button
            type="button"
            onClick={incrementChildren}
            disabled={children >= 8}
            className={`
              w-8 h-8 flex items-center justify-center
              border border-[var(--neutral-300)] rounded-full
              text-[var(--neutral-600)] hover:border-[var(--foreground)]
              transition-colors
              ${children >= 8 ? 'opacity-30 cursor-not-allowed' : ''}
            `}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Done Button */}
      <div className="mt-4 pt-4 border-t border-[var(--neutral-100)]">
        <button
          type="button"
          onClick={onClose}
          className={`
            w-full py-3 bg-[var(--foreground)] text-white text-sm font-medium
            rounded-lg hover:opacity-90 transition-opacity
            ${isRTL ? 'font-heebo' : ''}
          `}
        >
          {t.done}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )

  // Use portal to render at document body level
  return createPortal(pickerContent, document.body)
}

export default GuestsPicker
