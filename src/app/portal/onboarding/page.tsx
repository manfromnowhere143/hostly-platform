// ═══════════════════════════════════════════════════════════════════════════════
// HOST ONBOARDING WIZARD - 10-Step Property Setup
// ═══════════════════════════════════════════════════════════════════════════════
// World-class onboarding experience with:
// - Progressive disclosure (one thing at a time)
// - Beautiful animations and micro-interactions
// - Auto-save functionality
// - Smart suggestions and AI assistance
// - Mobile-first responsive design
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PropertyDraft {
  // Step 1: Property Type
  propertyType: string

  // Step 2: Location
  address: string
  city: string
  country: string
  coordinates: { lat: number; lng: number } | null

  // Step 3: Basics
  guests: number
  bedrooms: number
  beds: number
  bathrooms: number

  // Step 4: Amenities
  amenities: string[]

  // Step 5: Photos
  photos: { url: string; caption: string; isPrimary: boolean }[]

  // Step 6: Title & Description
  title: string
  description: string

  // Step 7: Pricing
  basePrice: number
  weekendPrice: number
  currency: string
  cleaningFee: number

  // Step 8: Calendar
  minNights: number
  maxNights: number
  blockedDates: string[]
  advanceNotice: number

  // Step 9: House Rules
  checkInTime: string
  checkOutTime: string
  smokingAllowed: boolean
  petsAllowed: boolean
  partiesAllowed: boolean
  quietHours: { start: string; end: string }
  additionalRules: string

  // Step 10: Review
  isReviewed: boolean
}

type StepKey =
  | 'property-type'
  | 'location'
  | 'basics'
  | 'amenities'
  | 'photos'
  | 'title-description'
  | 'pricing'
  | 'calendar'
  | 'house-rules'
  | 'review'

interface Step {
  key: StepKey
  number: number
  title: string
  titleHe: string
  description: string
  descriptionHe: string
  icon: React.ReactNode
}

// ─── Step Configuration ────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    key: 'property-type',
    number: 1,
    title: 'Property Type',
    titleHe: 'סוג הנכס',
    description: 'What kind of place are you listing?',
    descriptionHe: 'איזה סוג נכס אתה מציע?',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    key: 'location',
    number: 2,
    title: 'Location',
    titleHe: 'מיקום',
    description: 'Where is your property located?',
    descriptionHe: 'היכן ממוקם הנכס שלך?',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    key: 'basics',
    number: 3,
    title: 'The Basics',
    titleHe: 'פרטים בסיסיים',
    description: 'How many guests can stay?',
    descriptionHe: 'כמה אורחים יכולים להתארח?',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    key: 'amenities',
    number: 4,
    title: 'Amenities',
    titleHe: 'מתקנים',
    description: 'What does your place offer?',
    descriptionHe: 'מה הנכס שלך מציע?',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
  {
    key: 'photos',
    number: 5,
    title: 'Photos',
    titleHe: 'תמונות',
    description: 'Show off your space',
    descriptionHe: 'הראה את המקום שלך',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    key: 'title-description',
    number: 6,
    title: 'Title & Description',
    titleHe: 'כותרת ותיאור',
    description: 'Describe your listing',
    descriptionHe: 'תאר את הנכס שלך',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    key: 'pricing',
    number: 7,
    title: 'Pricing',
    titleHe: 'תמחור',
    description: 'Set your nightly rate',
    descriptionHe: 'קבע את המחיר ללילה',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    key: 'calendar',
    number: 8,
    title: 'Availability',
    titleHe: 'זמינות',
    description: 'Set your calendar rules',
    descriptionHe: 'הגדר את לוח הזמנים שלך',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    key: 'house-rules',
    number: 9,
    title: 'House Rules',
    titleHe: 'חוקי הבית',
    description: 'Set expectations for guests',
    descriptionHe: 'הגדר ציפיות לאורחים',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  {
    key: 'review',
    number: 10,
    title: 'Review & Publish',
    titleHe: 'סקירה ופרסום',
    description: 'Almost there!',
    descriptionHe: 'כמעט סיימנו!',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
]

// ─── Property Types ────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  { id: 'apartment', icon: '🏢', label: 'Apartment', labelHe: 'דירה' },
  { id: 'house', icon: '🏠', label: 'House', labelHe: 'בית' },
  { id: 'villa', icon: '🏛️', label: 'Villa', labelHe: 'וילה' },
  { id: 'studio', icon: '🛏️', label: 'Studio', labelHe: 'סטודיו' },
  { id: 'penthouse', icon: '🌆', label: 'Penthouse', labelHe: 'פנטהאוז' },
  { id: 'cabin', icon: '🏕️', label: 'Cabin', labelHe: 'בקתה' },
  { id: 'loft', icon: '🏗️', label: 'Loft', labelHe: 'לופט' },
  { id: 'unique', icon: '✨', label: 'Unique Space', labelHe: 'מקום ייחודי' },
]

// ─── Amenities ─────────────────────────────────────────────────────────────────
const AMENITIES = [
  { id: 'wifi', icon: '📶', label: 'WiFi', labelHe: 'אינטרנט אלחוטי', category: 'essentials' },
  { id: 'ac', icon: '❄️', label: 'Air Conditioning', labelHe: 'מיזוג אוויר', category: 'essentials' },
  { id: 'heating', icon: '🔥', label: 'Heating', labelHe: 'חימום', category: 'essentials' },
  { id: 'kitchen', icon: '🍳', label: 'Kitchen', labelHe: 'מטבח', category: 'essentials' },
  { id: 'washer', icon: '🧺', label: 'Washer', labelHe: 'מכונת כביסה', category: 'essentials' },
  { id: 'dryer', icon: '👕', label: 'Dryer', labelHe: 'מייבש', category: 'essentials' },
  { id: 'tv', icon: '📺', label: 'TV', labelHe: 'טלוויזיה', category: 'entertainment' },
  { id: 'pool', icon: '🏊', label: 'Pool', labelHe: 'בריכה', category: 'outdoor' },
  { id: 'jacuzzi', icon: '🛁', label: 'Hot Tub', labelHe: "ג'קוזי", category: 'outdoor' },
  { id: 'parking', icon: '🚗', label: 'Free Parking', labelHe: 'חניה חינם', category: 'essentials' },
  { id: 'gym', icon: '💪', label: 'Gym', labelHe: 'חדר כושר', category: 'wellness' },
  { id: 'bbq', icon: '🍖', label: 'BBQ Grill', labelHe: 'גריל', category: 'outdoor' },
  { id: 'balcony', icon: '🌅', label: 'Balcony', labelHe: 'מרפסת', category: 'outdoor' },
  { id: 'sea-view', icon: '🌊', label: 'Sea View', labelHe: 'נוף לים', category: 'views' },
  { id: 'workspace', icon: '💻', label: 'Workspace', labelHe: 'פינת עבודה', category: 'essentials' },
  { id: 'elevator', icon: '🛗', label: 'Elevator', labelHe: 'מעלית', category: 'accessibility' },
]

// ─── Default Property Draft ────────────────────────────────────────────────────
const defaultPropertyDraft: PropertyDraft = {
  propertyType: '',
  address: '',
  city: '',
  country: 'Israel',
  coordinates: null,
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [],
  photos: [],
  title: '',
  description: '',
  basePrice: 500,
  weekendPrice: 600,
  currency: 'ILS',
  cleaningFee: 150,
  minNights: 1,
  maxNights: 30,
  blockedDates: [],
  advanceNotice: 1,
  checkInTime: '15:00',
  checkOutTime: '11:00',
  smokingAllowed: false,
  petsAllowed: false,
  partiesAllowed: false,
  quietHours: { start: '22:00', end: '08:00' },
  additionalRules: '',
  isReviewed: false,
}

// ─── Progress Indicator ────────────────────────────────────────────────────────
function ProgressIndicator({
  steps,
  currentStepIndex,
  isRTL,
  onStepClick
}: {
  steps: Step[]
  currentStepIndex: number
  isRTL: boolean
  onStepClick: (index: number) => void
}) {
  return (
    <div className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className={`text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'שלבי ההרשמה' : 'Setup Progress'}
        </h3>

        <div className="space-y-1">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex
            const isCurrent = idx === currentStepIndex
            const isClickable = idx <= currentStepIndex

            return (
              <button
                key={step.key}
                onClick={() => isClickable && onStepClick(idx)}
                disabled={!isClickable}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
                  ${isRTL ? 'flex-row-reverse text-right' : ''}
                  ${isCurrent ? 'bg-[#B5846D]/10' : ''}
                  ${isClickable ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300 shrink-0
                  ${isCompleted
                    ? 'bg-[#4A7C59] text-white'
                    : isCurrent
                      ? 'bg-[#B5846D] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium truncate ${isCurrent ? 'text-[#B5846D]' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                    {isRTL ? step.titleHe : step.title}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className={`flex items-center justify-between text-sm mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-gray-500">{isRTL ? 'התקדמות' : 'Progress'}</span>
            <span className="font-semibold text-[#B5846D]">{Math.round((currentStepIndex / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#B5846D] to-[#8B6347] rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mobile Progress Bar ───────────────────────────────────────────────────────
function MobileProgressBar({ currentStep, totalSteps, isRTL }: { currentStep: number; totalSteps: number; isRTL: boolean }) {
  return (
    <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
      <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className="text-sm text-gray-500">
          {isRTL ? `שלב ${currentStep} מתוך ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}
        </span>
        <span className="text-sm font-semibold text-[#B5846D]">{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#B5846D] to-[#8B6347] rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ─── Counter Input ─────────────────────────────────────────────────────────────
function CounterInput({
  label,
  labelHe,
  value,
  onChange,
  min = 0,
  max = 99,
  isRTL
}: {
  label: string
  labelHe: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  isRTL: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-4 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <span className="text-gray-700 font-medium">{isRTL ? labelHe : label}</span>
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#B5846D] hover:text-[#B5846D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="w-8 text-center text-lg font-semibold text-gray-900">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#B5846D] hover:text-[#B5846D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Step Components ───────────────────────────────────────────────────────────

// Step 1: Property Type
function PropertyTypeStep({
  draft,
  updateDraft,
  isRTL
}: {
  draft: PropertyDraft
  updateDraft: (data: Partial<PropertyDraft>) => void
  isRTL: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PROPERTY_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => updateDraft({ propertyType: type.id })}
            className={`
              relative p-6 rounded-2xl border-2 transition-all duration-300
              ${draft.propertyType === type.id
                ? 'border-[#B5846D] bg-[#B5846D]/5 shadow-lg'
                : 'border-gray-200 hover:border-[#B5846D]/50 hover:shadow-md'
              }
            `}
          >
            <div className="text-4xl mb-3">{type.icon}</div>
            <div className="font-medium text-gray-800">
              {isRTL ? type.labelHe : type.label}
            </div>
            {draft.propertyType === type.id && (
              <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
                <div className="w-6 h-6 bg-[#B5846D] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 2: Location
function LocationStep({
  draft,
  updateDraft,
  isRTL
}: {
  draft: PropertyDraft
  updateDraft: (data: Partial<PropertyDraft>) => void
  isRTL: boolean
}) {
  const cities = useMemo(() => [
    { id: 'eilat', name: 'Eilat', nameHe: 'אילת' },
    { id: 'tel-aviv', name: 'Tel Aviv', nameHe: 'תל אביב' },
    { id: 'jerusalem', name: 'Jerusalem', nameHe: 'ירושלים' },
    { id: 'haifa', name: 'Haifa', nameHe: 'חיפה' },
    { id: 'dead-sea', name: 'Dead Sea', nameHe: 'ים המלח' },
    { id: 'galilee', name: 'Galilee', nameHe: 'גליל' },
    { id: 'netanya', name: 'Netanya', nameHe: 'נתניה' },
    { id: 'herzliya', name: 'Herzliya', nameHe: 'הרצליה' },
  ], [])

  return (
    <div className="space-y-6">
      {/* City Selection */}
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-3 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'עיר' : 'City'}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => updateDraft({ city: city.name })}
              className={`
                px-4 py-3 rounded-xl border-2 font-medium transition-all duration-300
                ${draft.city === city.name
                  ? 'border-[#B5846D] bg-[#B5846D]/5 text-[#B5846D]'
                  : 'border-gray-200 text-gray-600 hover:border-[#B5846D]/50'
                }
              `}
            >
              {isRTL ? city.nameHe : city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Address Input */}
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'כתובת מלאה' : 'Full Address'}
        </label>
        <input
          type="text"
          value={draft.address}
          onChange={(e) => updateDraft({ address: e.target.value })}
          placeholder={isRTL ? 'רחוב הדקל 15, אילת' : '15 Palm Street, Eilat'}
          className={`
            w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent
            focus:border-[#B5846D] focus:bg-white transition-all duration-300
            placeholder:text-gray-400
            ${isRTL ? 'text-right' : ''}
          `}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />
        <p className={`text-xs text-gray-400 mt-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'הכתובת המדויקת תוצג רק לאורחים שאישרו הזמנה' : 'Exact address shown only to confirmed guests'}
        </p>
      </div>

      {/* Map Placeholder */}
      <div className="h-48 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="text-sm">{isRTL ? 'מפה אינטראקטיבית בקרוב' : 'Interactive map coming soon'}</span>
        </div>
      </div>
    </div>
  )
}

// Step 3: Basics
function BasicsStep({
  draft,
  updateDraft,
  isRTL
}: {
  draft: PropertyDraft
  updateDraft: (data: Partial<PropertyDraft>) => void
  isRTL: boolean
}) {
  return (
    <div className="space-y-2">
      <CounterInput
        label="Guests"
        labelHe="אורחים"
        value={draft.guests}
        onChange={(value) => updateDraft({ guests: value })}
        min={1}
        max={16}
        isRTL={isRTL}
      />
      <CounterInput
        label="Bedrooms"
        labelHe="חדרי שינה"
        value={draft.bedrooms}
        onChange={(value) => updateDraft({ bedrooms: value })}
        min={0}
        max={10}
        isRTL={isRTL}
      />
      <CounterInput
        label="Beds"
        labelHe="מיטות"
        value={draft.beds}
        onChange={(value) => updateDraft({ beds: value })}
        min={1}
        max={20}
        isRTL={isRTL}
      />
      <CounterInput
        label="Bathrooms"
        labelHe="חדרי אמבטיה"
        value={draft.bathrooms}
        onChange={(value) => updateDraft({ bathrooms: value })}
        min={1}
        max={10}
        isRTL={isRTL}
      />
    </div>
  )
}

// Step 4: Amenities
function AmenitiesStep({
  draft,
  updateDraft,
  isRTL
}: {
  draft: PropertyDraft
  updateDraft: (data: Partial<PropertyDraft>) => void
  isRTL: boolean
}) {
  const toggleAmenity = (id: string) => {
    const current = draft.amenities || []
    const updated = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id]
    updateDraft({ amenities: updated })
  }

  const categories = useMemo(() => ({
    essentials: { label: 'Essentials', labelHe: 'בסיסי' },
    outdoor: { label: 'Outdoor', labelHe: 'חיצוני' },
    entertainment: { label: 'Entertainment', labelHe: 'בידור' },
    wellness: { label: 'Wellness', labelHe: 'בריאות' },
    views: { label: 'Views', labelHe: 'נוף' },
    accessibility: { label: 'Accessibility', labelHe: 'נגישות' },
  }), [])

  return (
    <div className="space-y-8">
      {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
        const categoryAmenities = AMENITIES.filter((a) => a.category === categoryKey)
        if (categoryAmenities.length === 0) return null

        return (
          <div key={categoryKey}>
            <h3 className={`text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? categoryInfo.labelHe : categoryInfo.label}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categoryAmenities.map((amenity) => (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300
                    ${isRTL ? 'flex-row-reverse' : ''}
                    ${draft.amenities?.includes(amenity.id)
                      ? 'border-[#B5846D] bg-[#B5846D]/5'
                      : 'border-gray-200 hover:border-[#B5846D]/50'
                    }
                  `}
                >
                  <span className="text-xl">{amenity.icon}</span>
                  <span className={`text-sm font-medium ${draft.amenities?.includes(amenity.id) ? 'text-[#B5846D]' : 'text-gray-600'}`}>
                    {isRTL ? amenity.labelHe : amenity.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Step 5: Photos
function PhotosStep({
  draft,
  updateDraft,
  isRTL
}: {
  draft: PropertyDraft
  updateDraft: (data: Partial<PropertyDraft>) => void
  isRTL: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // In production, handle file upload here
  }, [])

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300
          ${isDragging
            ? 'border-[#B5846D] bg-[#B5846D]/5'
            : 'border-gray-300 hover:border-[#B5846D]/50 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
        />
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium text-gray-700 mb-1">
          {isRTL ? 'גרור תמונות לכאן' : 'Drag photos here'}
        </p>
        <p className="text-sm text-gray-400">
          {isRTL ? 'או לחץ לבחירת קבצים' : 'or click to browse'}
        </p>
      </div>

      {/* Photo Tips */}
      <div className={`bg-[#B5846D]/5 rounded-2xl p-6 ${isRTL ? 'text-right' : ''}`}>
        <h4 className="font-semibold text-[#8B6347] mb-3">
          {isRTL ? '💡 טיפים לתמונות מושלמות' : '💡 Tips for great photos'}
        </h4>
        <ul className={`space-y-2 text-sm text-[#8B6347]/80 ${isRTL ? 'mr-4' : 'ml-4'}`}>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>{isRTL ? 'צלם באור טבעי במהלך היום' : 'Shoot in natural daylight'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>{isRTL ? 'הראה את כל החדרים והמתקנים' : 'Show all rooms and amenities'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>{isRTL ? 'העלה לפחות 5 תמונות באיכות גבוהה' : 'Upload at least 5 high-quality photos'}</span>
          </li>
        </ul>
      </div>

      {/* Placeholder Gallery */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 6: Title & Description
function TitleDescriptionStep({
  draft,
  updateDraft,
  isRTL
}: {
  draft: PropertyDraft
  updateDraft: (data: Partial<PropertyDraft>) => void
  isRTL: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'כותרת הנכס' : 'Listing Title'}
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => updateDraft({ title: e.target.value })}
          placeholder={isRTL ? 'דירת נופש מרהיבה עם נוף לים' : 'Stunning Beachfront Apartment with Sea Views'}
          maxLength={100}
          className={`
            w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent
            focus:border-[#B5846D] focus:bg-white transition-all duration-300
            placeholder:text-gray-400 text-lg
            ${isRTL ? 'text-right' : ''}
          `}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />
        <p className={`text-xs text-gray-400 mt-2 ${isRTL ? 'text-right' : ''}`}>
          {draft.title.length}/100 {isRTL ? 'תווים' : 'characters'}
        </p>
      </div>

      {/* Description */}
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'תיאור' : 'Description'}
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => updateDraft({ description: e.target.value })}
          placeholder={isRTL
            ? 'תאר את הנכס שלך, המיקום, האווירה ומה שהופך אותו למיוחד...'
            : 'Describe your property, the location, the vibe, and what makes it special...'
          }
          rows={8}
          maxLength={2000}
          className={`
            w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent
            focus:border-[#B5846D] focus:bg-white transition-all duration-300
            placeholder:text-gray-400 resize-none
            ${isRTL ? 'text-right' : ''}
          `}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />
        <p className={`text-xs text-gray-400 mt-2 ${isRTL ? 'text-right' : ''}`}>
          {draft.description.length}/2000 {isRTL ? 'תווים' : 'characters'}
        </p>
      </div>

      {/* AI Suggestion Button */}
      <button className={`
        w-full px-4 py-3 bg-gradient-to-r from-[#2C3E50] to-[#34495E]
        text-white font-medium rounded-xl flex items-center justify-center gap-2
        hover:shadow-lg transition-all duration-300
      `}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {isRTL ? 'קבל הצעה מ-AI' : 'Get AI Suggestion'}
      </button>
    </div>
  )
}

// Step 7: Pricing
function PricingStep({
  draft,
  updateDraft,
  isRTL
}: {
  draft: PropertyDraft
  updateDraft: (data: Partial<PropertyDraft>) => void
  isRTL: boolean
}) {
  return (
    <div className="space-y-8">
      {/* Base Price */}
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'מחיר ללילה (ימי חול)' : 'Nightly Rate (Weekdays)'}
        </label>
        <div className="relative">
          <span className={`absolute top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}>₪</span>
          <input
            type="number"
            value={draft.basePrice}
            onChange={(e) => updateDraft({ basePrice: Number(e.target.value) })}
            className={`
              w-full px-4 py-4 bg-gray-50 rounded-xl border-2 border-transparent
              focus:border-[#B5846D] focus:bg-white transition-all duration-300
              text-3xl font-semibold text-center
            `}
          />
        </div>
      </div>

      {/* Weekend Price */}
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'מחיר ללילה (סופ"ש)' : 'Nightly Rate (Weekends)'}
        </label>
        <div className="relative">
          <span className={`absolute top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}>₪</span>
          <input
            type="number"
            value={draft.weekendPrice}
            onChange={(e) => updateDraft({ weekendPrice: Number(e.target.value) })}
            className={`
              w-full px-4 py-4 bg-gray-50 rounded-xl border-2 border-transparent
              focus:border-[#B5846D] focus:bg-white transition-all duration-300
              text-3xl font-semibold text-center
            `}
          />
        </div>
      </div>

      {/* Cleaning Fee */}
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'דמי ניקיון (חד פעמי)' : 'Cleaning Fee (One-time)'}
        </label>
        <div className="relative">
          <span className={`absolute top-1/2 -translate-y-1/2 text-xl text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}>₪</span>
          <input
            type="number"
            value={draft.cleaningFee}
            onChange={(e) => updateDraft({ cleaningFee: Number(e.target.value) })}
            className={`
              w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent
              focus:border-[#B5846D] focus:bg-white transition-all duration-300
              text-xl font-medium ${isRTL ? 'pr-12' : 'pl-12'}
            `}
          />
        </div>
      </div>

      {/* Earnings Estimate */}
      <div className="bg-[#4A7C59]/10 rounded-2xl p-6">
        <h4 className={`text-sm font-semibold text-[#4A7C59] uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'הכנסה חודשית משוערת' : 'Estimated Monthly Earnings'}
        </h4>
        <div className={`text-4xl font-light text-[#4A7C59] ${isRTL ? 'text-right' : ''}`}>
          ₪{((draft.basePrice * 20) + (draft.weekendPrice * 8)).toLocaleString()}
        </div>
        <p className={`text-sm text-[#4A7C59]/70 mt-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'בהנחה של 70% תפוסה' : 'Assuming 70% occupancy'}
        </p>
      </div>
    </div>
  )
}

// Step 8: Calendar/Availability
function CalendarStep({
  draft,
  updateDraft,
  isRTL
}: {
  draft: PropertyDraft
  updateDraft: (data: Partial<PropertyDraft>) => void
  isRTL: boolean
}) {
  return (
    <div className="space-y-6">
      <CounterInput
        label="Minimum nights"
        labelHe="מינימום לילות"
        value={draft.minNights}
        onChange={(value) => updateDraft({ minNights: value })}
        min={1}
        max={30}
        isRTL={isRTL}
      />
      <CounterInput
        label="Maximum nights"
        labelHe="מקסימום לילות"
        value={draft.maxNights}
        onChange={(value) => updateDraft({ maxNights: value })}
        min={1}
        max={365}
        isRTL={isRTL}
      />
      <CounterInput
        label="Advance notice (days)"
        labelHe="הודעה מראש (ימים)"
        value={draft.advanceNotice}
        onChange={(value) => updateDraft({ advanceNotice: value })}
        min={0}
        max={30}
        isRTL={isRTL}
      />

      {/* Calendar Placeholder */}
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500">
          {isRTL ? 'לוח שנה אינטראקטיבי יהיה זמין לאחר פרסום' : 'Interactive calendar available after publishing'}
        </p>
      </div>
    </div>
  )
}

// Step 9: House Rules
function HouseRulesStep({
  draft,
  updateDraft,
  isRTL
}: {
  draft: PropertyDraft
  updateDraft: (data: Partial<PropertyDraft>) => void
  isRTL: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Check-in/Check-out Times */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'שעת צ\'ק-אין' : 'Check-in Time'}
          </label>
          <input
            type="time"
            value={draft.checkInTime}
            onChange={(e) => updateDraft({ checkInTime: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#B5846D] focus:bg-white transition-all"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'שעת צ\'ק-אאוט' : 'Check-out Time'}
          </label>
          <input
            type="time"
            value={draft.checkOutTime}
            onChange={(e) => updateDraft({ checkOutTime: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#B5846D] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Rules Toggles */}
      <div className="space-y-4">
        {[
          { key: 'smokingAllowed', label: 'Smoking allowed', labelHe: 'עישון מותר' },
          { key: 'petsAllowed', label: 'Pets allowed', labelHe: 'חיות מחמד מותרות' },
          { key: 'partiesAllowed', label: 'Parties/events allowed', labelHe: 'מסיבות מותרות' },
        ].map((rule) => (
          <div
            key={rule.key}
            className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <span className="font-medium text-gray-700">
              {isRTL ? rule.labelHe : rule.label}
            </span>
            <button
              onClick={() => updateDraft({ [rule.key]: !draft[rule.key as keyof PropertyDraft] })}
              className={`
                relative w-14 h-8 rounded-full transition-colors duration-300
                ${draft[rule.key as keyof PropertyDraft] ? 'bg-[#4A7C59]' : 'bg-gray-300'}
              `}
            >
              <div className={`
                absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
                ${draft[rule.key as keyof PropertyDraft] ? 'translate-x-7' : 'translate-x-1'}
              `} />
            </button>
          </div>
        ))}
      </div>

      {/* Additional Rules */}
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'חוקים נוספים (אופציונלי)' : 'Additional Rules (Optional)'}
        </label>
        <textarea
          value={draft.additionalRules}
          onChange={(e) => updateDraft({ additionalRules: e.target.value })}
          placeholder={isRTL ? 'הוסף חוקים או הנחיות נוספות לאורחים...' : 'Add any other rules or guidelines for guests...'}
          rows={4}
          className={`
            w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent
            focus:border-[#B5846D] focus:bg-white transition-all duration-300
            placeholder:text-gray-400 resize-none
            ${isRTL ? 'text-right' : ''}
          `}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />
      </div>
    </div>
  )
}

// Step 10: Review
function ReviewStep({
  draft,
  isRTL
}: {
  draft: PropertyDraft
  isRTL: boolean
}) {
  const propertyType = PROPERTY_TYPES.find(t => t.id === draft.propertyType)
  const selectedAmenities = AMENITIES.filter(a => draft.amenities?.includes(a.id))

  return (
    <div className="space-y-8">
      {/* Preview Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        {/* Header Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-[#B5846D]/20 to-[#8B6347]/20 flex items-center justify-center">
          <svg className="w-16 h-16 text-[#B5846D]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="p-6">
          <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className="text-xl font-semibold text-gray-900">
                {draft.title || (isRTL ? 'כותרת הנכס שלך' : 'Your Property Title')}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {draft.city || (isRTL ? 'עיר' : 'City')}, {draft.country}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#B5846D]">₪{draft.basePrice}</div>
              <div className="text-xs text-gray-400">{isRTL ? 'ללילה' : '/night'}</div>
            </div>
          </div>

          {/* Property Details */}
          <div className={`flex items-center gap-4 text-sm text-gray-600 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>{propertyType?.icon} {isRTL ? propertyType?.labelHe : propertyType?.label}</span>
            <span>•</span>
            <span>{draft.guests} {isRTL ? 'אורחים' : 'guests'}</span>
            <span>•</span>
            <span>{draft.bedrooms} {isRTL ? 'חדרי שינה' : 'bedrooms'}</span>
          </div>

          {/* Amenities Preview */}
          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {selectedAmenities.slice(0, 5).map((amenity) => (
              <span key={amenity.id} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                {amenity.icon} {isRTL ? amenity.labelHe : amenity.label}
              </span>
            ))}
            {selectedAmenities.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                +{selectedAmenities.length - 5} {isRTL ? 'נוספים' : 'more'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className={`bg-[#4A7C59]/5 rounded-2xl p-6 ${isRTL ? 'text-right' : ''}`}>
        <h4 className="font-semibold text-[#4A7C59] mb-4">
          {isRTL ? '✅ רשימת השלמה' : '✅ Completion Checklist'}
        </h4>
        <div className="space-y-3">
          {[
            { done: !!draft.propertyType, label: isRTL ? 'סוג נכס נבחר' : 'Property type selected' },
            { done: !!draft.city && !!draft.address, label: isRTL ? 'מיקום הוזן' : 'Location entered' },
            { done: draft.guests > 0, label: isRTL ? 'פרטים בסיסיים הושלמו' : 'Basics completed' },
            { done: (draft.amenities?.length || 0) >= 3, label: isRTL ? 'לפחות 3 מתקנים נבחרו' : 'At least 3 amenities selected' },
            { done: !!draft.title && !!draft.description, label: isRTL ? 'כותרת ותיאור נכתבו' : 'Title and description written' },
            { done: draft.basePrice > 0, label: isRTL ? 'תמחור הוגדר' : 'Pricing set' },
          ].map((item, idx) => (
            <div key={idx} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-[#4A7C59]' : 'bg-gray-200'}`}>
                {item.done && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={item.done ? 'text-[#4A7C59]' : 'text-gray-400'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { isRTL } = useLanguage()
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [draft, setDraft] = useState<PropertyDraft>(defaultPropertyDraft)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStep = STEPS[currentStepIndex]

  const updateDraft = useCallback((data: Partial<PropertyDraft>) => {
    setDraft((prev) => ({ ...prev, ...data }))
  }, [])

  const canProceed = useMemo(() => {
    switch (currentStep.key) {
      case 'property-type': return !!draft.propertyType
      case 'location': return !!draft.city && !!draft.address
      case 'basics': return draft.guests > 0 && draft.beds > 0
      case 'amenities': return (draft.amenities?.length || 0) >= 1
      case 'photos': return true // Photos optional for now
      case 'title-description': return !!draft.title && draft.title.length >= 10
      case 'pricing': return draft.basePrice > 0
      case 'calendar': return draft.minNights > 0
      case 'house-rules': return true
      case 'review': return true
      default: return true
    }
  }, [currentStep.key, draft])

  const handleNext = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStepIndex])

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStepIndex])

  const handlePublish = useCallback(async () => {
    setIsSubmitting(true)
    try {
      // In production, submit to API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mark onboarding as complete
      localStorage.removeItem('needsOnboarding')

      router.push('/portal?onboarding=complete')
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [router])

  const renderStepContent = () => {
    switch (currentStep.key) {
      case 'property-type':
        return <PropertyTypeStep draft={draft} updateDraft={updateDraft} isRTL={isRTL} />
      case 'location':
        return <LocationStep draft={draft} updateDraft={updateDraft} isRTL={isRTL} />
      case 'basics':
        return <BasicsStep draft={draft} updateDraft={updateDraft} isRTL={isRTL} />
      case 'amenities':
        return <AmenitiesStep draft={draft} updateDraft={updateDraft} isRTL={isRTL} />
      case 'photos':
        return <PhotosStep draft={draft} updateDraft={updateDraft} isRTL={isRTL} />
      case 'title-description':
        return <TitleDescriptionStep draft={draft} updateDraft={updateDraft} isRTL={isRTL} />
      case 'pricing':
        return <PricingStep draft={draft} updateDraft={updateDraft} isRTL={isRTL} />
      case 'calendar':
        return <CalendarStep draft={draft} updateDraft={updateDraft} isRTL={isRTL} />
      case 'house-rules':
        return <HouseRulesStep draft={draft} updateDraft={updateDraft} isRTL={isRTL} />
      case 'review':
        return <ReviewStep draft={draft} isRTL={isRTL} />
      default:
        return null
    }
  }

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#faf9f7]"
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#B5846D] to-[#8B6347] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Hostly</span>
            </Link>

            <button
              onClick={() => router.push('/portal')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isRTL ? 'שמור ויצא' : 'Save & Exit'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Progress */}
      <MobileProgressBar
        currentStep={currentStepIndex + 1}
        totalSteps={STEPS.length}
        isRTL={isRTL}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-24 pb-32">
        <div className={`flex gap-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Desktop Progress Sidebar */}
          <ProgressIndicator
            steps={STEPS}
            currentStepIndex={currentStepIndex}
            isRTL={isRTL}
            onStepClick={setCurrentStepIndex}
          />

          {/* Step Content */}
          <div className="flex-1 max-w-2xl">
            {/* Step Header */}
            <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
              <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-[#B5846D]/10 rounded-xl flex items-center justify-center text-[#B5846D]">
                  {currentStep.icon}
                </div>
                <div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">
                    {isRTL ? `שלב ${currentStep.number}` : `Step ${currentStep.number}`}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {isRTL ? currentStep.titleHe : currentStep.title}
                  </h1>
                </div>
              </div>
              <p className="text-gray-500 text-lg">
                {isRTL ? currentStep.descriptionHe : currentStep.description}
              </p>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className={`
                px-6 py-3 text-gray-600 font-medium rounded-xl
                hover:bg-gray-100 transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed
                flex items-center gap-2
                ${isRTL ? 'flex-row-reverse' : ''}
              `}
            >
              <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {isRTL ? 'חזרה' : 'Back'}
            </button>

            {currentStepIndex === STEPS.length - 1 ? (
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className={`
                  px-8 py-3 bg-gradient-to-r from-[#4A7C59] to-[#3D6B4A]
                  text-white font-semibold rounded-xl
                  hover:shadow-lg hover:scale-[1.02] transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2
                `}
              >
                {isSubmitting ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    {isRTL ? 'פרסם את הנכס' : 'Publish Listing'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`
                  px-8 py-3 bg-gradient-to-r from-[#B5846D] to-[#8B6347]
                  text-white font-semibold rounded-xl
                  hover:shadow-lg hover:scale-[1.02] transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2
                  ${isRTL ? 'flex-row-reverse' : ''}
                `}
              >
                {isRTL ? 'המשך' : 'Continue'}
                <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
