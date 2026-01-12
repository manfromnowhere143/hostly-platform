// ═══════════════════════════════════════════════════════════════════════════════
// MARKETPLACE HOMEPAGE - Airbnb-Level Design with Real Search
// ═══════════════════════════════════════════════════════════════════════════════
// World-class property discovery with stunning visuals and micro-interactions.
// Connected to REAL Boom PMS for live availability and pricing!
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button, Badge } from '@/components/ui'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBooking } from '@/contexts/BookingContext'
import { MarketplaceSearchProvider, useMarketplaceSearch, SearchProperty } from '@/contexts/MarketplaceSearchContext'
import DateRangePicker from '@/components/marketplace/DateRangePicker'
import GuestsPicker from '@/components/marketplace/GuestsPicker'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Property {
  id: string
  boomId?: number // Real Boom PMS ID for live pricing & availability
  slug: string
  name: string
  displayName?: string
  location: string
  host: string
  hostName: string
  price: number
  currency?: string
  rating: number
  reviews: number
  images: string[]
  isSuperhost: boolean
  tags: string[]
  specs?: {
    bedrooms: number
    bathrooms: number
    guests: number
    sqm?: number
  }
  amenities?: string[]
  project?: string
  unit?: string
  subtitle?: string
  description?: string
}

// ─── Category Data (Bilingual) - Elegant Emoji Icons ─────────────────────────
const categories = [
  { id: 'beach', label: { en: 'Beach', he: 'חוף' }, icon: '🏖️' },
  { id: 'mountain', label: { en: 'Mountains', he: 'הרים' }, icon: '⛰️' },
  { id: 'city', label: { en: 'City', he: 'עיר' }, icon: '🏙️' },
  { id: 'countryside', label: { en: 'Countryside', he: 'כפר' }, icon: '🌾' },
  { id: 'lake', label: { en: 'Lakefront', he: 'אגם' }, icon: '🏞️' },
  { id: 'luxury', label: { en: 'Luxury', he: 'יוקרה' }, icon: '✨' },
  { id: 'unique', label: { en: 'Unique', he: 'מיוחד' }, icon: '🏡' },
  { id: 'desert', label: { en: 'Desert', he: 'מדבר' }, icon: '🏜️' },
]

// ─── Fallback Properties (used while loading or if API fails) ─────────────────
const fallbackProperties: Property[] = [
  {
    id: '1',
    slug: 'sunset-penthouse',
    name: 'Sunset Penthouse',
    location: 'Eilat, Israel',
    host: 'rently',
    hostName: 'Rently',
    price: 450,
    rating: 4.97,
    reviews: 124,
    images: [],
    isSuperhost: true,
    tags: ['Sea View', 'Luxury'],
  },
]

// ─── Icons ────────────────────────────────────────────────────────────────────
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className || 'w-5 h-5'}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// ─── Property Card Component ──────────────────────────────────────────────────
function PropertyCard({ property, onSelect }: { property: Property; onSelect?: (property: Property) => void }) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState<Record<number, boolean>>({})
  const { isRTL, t } = useLanguage()

  // Check if image is a URL or a color code
  const isImageUrl = (img: string) => img.startsWith('http') || img.startsWith('/')

  // Get images to display (at least show placeholder if empty)
  const displayImages = property.images.length > 0 ? property.images : ['#E8D5C4']

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Carousel */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        {/* Images */}
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${currentImage * 100}%)` }}
        >
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className="min-w-full h-full flex items-center justify-center relative"
              style={{ backgroundColor: isImageUrl(img) ? '#f5f5f5' : img }}
            >
              {isImageUrl(img) && !imageError[idx] ? (
                <Image
                  src={img}
                  alt={`${property.name} - Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  onError={() => setImageError(prev => ({ ...prev, [idx]: true }))}
                />
              ) : (
                <div className="text-6xl opacity-30">🏠</div>
              )}
            </div>
          ))}
        </div>

        {/* Favorite Button - RTL aware */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setIsLiked(!isLiked)
          }}
          className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-10 p-2 transition-transform hover:scale-110 active:scale-95`}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon
            className={`w-6 h-6 drop-shadow-md transition-colors ${
              isLiked ? 'text-[#FF385C] fill-current' : 'text-white'
            }`}
            filled={isLiked}
          />
        </button>

        {/* Superhost Badge - RTL aware, Elegant */}
        {property.isSuperhost && (
          <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} z-10`}>
            <span className={`
              px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-md
              text-[11px] font-medium tracking-wide text-[var(--neutral-700)]
              shadow-sm
              ${isRTL ? 'font-heebo' : 'uppercase'}
            `}>
              {t('marketplace.superhost')}
            </span>
          </div>
        )}

        {/* Navigation Arrows */}
        {isHovered && displayImages.length > 1 && (
          <>
            {currentImage > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentImage(currentImage - 1)
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105 shadow-md"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            )}
            {currentImage < displayImages.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentImage(currentImage + 1)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105 shadow-md"
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Dots Indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentImage(idx)
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImage
                    ? 'bg-white w-2'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content - Elegant RTL-aware Typography */}
      <div
        className="cursor-pointer mt-3"
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={() => onSelect?.(property)}
      >
        <div className="space-y-0.5">
          {/* Property Name & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={`
              text-[11.5px] font-extralight text-[var(--neutral-700)] truncate leading-tight
              ${isRTL ? 'font-heebo' : 'uppercase'}
            `} style={{
              letterSpacing: isRTL ? '0.02em' : '0.12em',
              fontWeight: 300,
            }}>
              {property.name}
            </h3>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <StarIcon className="w-3 h-3" />
              <span className="text-[12px]">{(property.rating || 4.9).toFixed(2)}</span>
            </div>
          </div>

          {/* Location */}
          <p className={`
            text-[12px] text-[var(--neutral-500)] truncate
            ${isRTL ? 'font-heebo' : ''}
          `}>
            {isRTL ? 'אילת, ישראל' : property.location}
          </p>

          {/* Host */}
          <p className={`
            text-[12px] text-[var(--neutral-400)]
            ${isRTL ? 'font-heebo' : ''}
          `}>
            {isRTL ? `מארח: ${property.hostName}` : `Hosted by ${property.hostName}`}
          </p>

          {/* Price */}
          <p className="pt-1">
            <span className={`text-[14px] font-medium text-[var(--foreground)] ${isRTL ? 'font-heebo' : ''}`}>
              {property.currency === 'ILS' ? '₪' : '$'}{property.price}
            </span>
            <span className={`text-[12px] text-[var(--neutral-500)] ${isRTL ? 'font-heebo' : ''}`}>
              {isRTL ? ' ללילה' : ' night'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Search Result Card (from search API) ─────────────────────────────────────
function SearchResultCard({ property, onSelect }: { property: SearchProperty; onSelect: () => void }) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState<Record<number, boolean>>({})
  const { isRTL, t } = useLanguage()

  const displayImages = property.photos.length > 0
    ? property.photos.map(p => p.url)
    : ['#E8D5C4']

  // Check if string is an image URL (http or local path)
  const isImageUrl = (img: string) => img.startsWith('http') || img.startsWith('/')

  // Format price from agorot to shekels
  const formatPrice = (agorot: number) => Math.round(agorot / 100)

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Carousel */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${currentImage * 100}%)` }}
        >
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className="min-w-full h-full flex items-center justify-center relative"
              style={{ backgroundColor: isImageUrl(img) ? '#f5f5f5' : img }}
            >
              {isImageUrl(img) && !imageError[idx] ? (
                <Image
                  src={img}
                  alt={`${property.name} - Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  onError={() => setImageError(prev => ({ ...prev, [idx]: true }))}
                />
              ) : (
                <div className="text-6xl opacity-30">🏠</div>
              )}
            </div>
          ))}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsLiked(!isLiked)
          }}
          className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-10 p-2 transition-transform hover:scale-110 active:scale-95`}
        >
          <HeartIcon
            className={`w-6 h-6 drop-shadow-md transition-colors ${isLiked ? 'text-[#FF385C]' : 'text-white'}`}
            filled={isLiked}
          />
        </button>

        {/* Available Badge */}
        <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} z-10`}>
          <span className="px-2.5 py-1 bg-green-500/90 backdrop-blur-sm rounded-md text-[11px] font-medium text-white shadow-sm">
            {isRTL ? 'זמין' : 'Available'}
          </span>
        </div>

        {/* Navigation Arrows */}
        {isHovered && displayImages.length > 1 && (
          <>
            {currentImage > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentImage(currentImage - 1)
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            )}
            {currentImage < displayImages.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentImage(currentImage + 1)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayImages.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentImage(idx)
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImage ? 'bg-white w-2' : 'bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="cursor-pointer mt-3" dir={isRTL ? 'rtl' : 'ltr'} onClick={onSelect}>
        <div className="space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-[11.5px] font-extralight text-[var(--neutral-700)] truncate leading-tight ${isRTL ? 'font-heebo' : 'uppercase'}`} style={{ letterSpacing: isRTL ? '0.02em' : '0.12em', fontWeight: 300 }}>
              {property.name}
            </h3>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <StarIcon className="w-3 h-3" />
              <span className="text-[12px]">4.95</span>
            </div>
          </div>

          <p className={`text-[12px] text-[var(--neutral-500)] truncate ${isRTL ? 'font-heebo' : ''}`}>
            {property.location || (isRTL ? 'אילת, ישראל' : 'Eilat, Israel')}
          </p>

          <p className={`text-[12px] text-[var(--neutral-400)] ${isRTL ? 'font-heebo' : ''}`}>
            {isRTL ? `מארח: ${property.organizationName}` : `Hosted by ${property.organizationName}`}
          </p>

          {/* Price from search results */}
          {property.pricing ? (
            <p className="pt-1">
              <span className={`text-[14px] font-medium text-[var(--foreground)] ${isRTL ? 'font-heebo' : ''}`}>
                ₪{formatPrice(property.pricing.total)}
              </span>
              <span className={`text-[12px] text-[var(--neutral-500)] ${isRTL ? 'font-heebo' : ''}`}>
                {isRTL ? ` סה"כ (${property.pricing.nights} לילות)` : ` total (${property.pricing.nights} nights)`}
              </span>
            </p>
          ) : (
            <p className="pt-1 text-[12px] text-[var(--neutral-400)]">
              {isRTL ? 'בדיקת מחיר...' : 'Checking price...'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Close Icon ────────────────────────────────────────────────────────────────
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ─── Property Modal Component ──────────────────────────────────────────────────
function PropertyModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const [currentImage, setCurrentImage] = useState(0)
  const { t, isRTL, lang } = useLanguage()
  const { openBooking } = useBooking()

  const handleBookNow = () => {
    const bookingProperty = {
      id: property.id,
      boomId: property.boomId,
      slug: property.slug,
      name: property.name,
      images: property.images,
      bedrooms: property.specs?.bedrooms,
      beds: property.specs?.bedrooms,
      bathrooms: property.specs?.bathrooms,
      maxGuests: property.specs?.guests,
      pricing: {
        basePrice: property.price,
        currency: property.currency || 'ILS',
      },
    }
    console.log(`[Booking] Opening for ${property.name} with Boom ID: ${property.boomId}`)
    openBooking(bookingProperty, lang as 'en' | 'he')
    onClose()
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const displayImages = property.images.length > 0 ? property.images : ['#E8D5C4']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg">
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:h-[500px] bg-gray-100">
            {displayImages.map((img, idx) => (
              <div key={idx} className={`absolute inset-0 transition-opacity duration-300 ${idx === currentImage ? 'opacity-100' : 'opacity-0'}`}>
                {img.startsWith('http') || img.startsWith('/') ? (
                  <Image src={img} alt={`${property.name} - Image ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: img }}>
                    <span className="text-6xl opacity-30">🏠</span>
                  </div>
                )}
              </div>
            ))}

            {displayImages.length > 1 && (
              <>
                <button onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : displayImages.length - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentImage(prev => prev < displayImages.length - 1 ? prev + 1 : 0)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {displayImages.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImage(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentImage ? 'bg-white w-4' : 'bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={`flex-1 p-6 md:p-8 overflow-y-auto ${isRTL ? 'text-right' : ''}`}>
            <div className="mb-6">
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {property.isSuperhost && (
                  <span className="px-2 py-0.5 bg-[var(--primary-100)] text-[var(--primary-700)] text-xs font-medium rounded-full">{t('marketplace.superhost')}</span>
                )}
                <div className={`flex items-center gap-1 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <StarIcon className="w-4 h-4" />
                  <span>{(property.rating || 4.9).toFixed(2)}</span>
                  <span className="text-[var(--foreground-muted)]">· {property.reviews} {t('marketplace.reviews')}</span>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-1" style={{ fontFamily: 'var(--font-playfair, serif)' }}>{property.name}</h2>
              <p className="text-[var(--foreground-muted)]">{property.location}</p>
            </div>

            {property.specs && (
              <div className={`flex gap-6 py-4 border-y border-[var(--neutral-200)] mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="text-center">
                  <div className="text-xl font-semibold">{property.specs.bedrooms}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">{t('marketplace.bedrooms')}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{property.specs.bathrooms}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">{t('marketplace.bathrooms')}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{property.specs.guests}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">{t('marketplace.guests')}</div>
                </div>
                {property.specs?.sqm && (
                  <div className="text-center">
                    <div className="text-xl font-semibold">{property.specs.sqm}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">m²</div>
                  </div>
                )}
              </div>
            )}

            {property.description && <p className="text-[var(--foreground-muted)] mb-6">{property.description}</p>}

            {property.tags && property.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">{t('marketplace.whatOffers')}</h3>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {property.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-[var(--neutral-100)] rounded-full text-sm">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className={`flex items-center justify-between pt-6 border-t border-[var(--neutral-200)] ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <span className="text-2xl font-bold">{property.currency === 'ILS' ? '₪' : '$'}{property.price}</span>
                <span className="text-[var(--foreground-muted)]"> / {t('marketplace.night')}</span>
              </div>
              <Button size="lg" className="bg-gradient-to-r from-[#FF385C] to-[#BD1E59] hover:from-[#E31C5F] hover:to-[#A01852]" onClick={handleBookNow}>
                {t('marketplace.reserve')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Search Result Modal Component (for searched properties) ─────────────────
function SearchResultModal({
  property,
  searchState,
  onClose
}: {
  property: SearchProperty
  searchState: { checkIn: Date | null; checkOut: Date | null; adults: number; children: number }
  onClose: () => void
}) {
  const [currentImage, setCurrentImage] = useState(0)
  const { t, isRTL, lang } = useLanguage()
  const { openBooking } = useBooking()

  const handleBookNow = () => {
    // Transform to booking format with search dates pre-filled
    const bookingProperty = {
      id: property.id,
      slug: property.slug,
      name: property.name,
      images: property.photos.map(p => p.url),
      bedrooms: property.bedrooms || undefined,
      bathrooms: property.bathrooms || undefined,
      maxGuests: property.maxGuests || undefined,
      pricing: property.pricing ? {
        basePrice: Math.round(property.pricing.averageNightlyRate / 100),
        currency: property.pricing.currency,
      } : undefined,
    }

    // Open booking with pre-filled dates from search
    const prefilledDates = searchState.checkIn && searchState.checkOut ? {
      checkIn: searchState.checkIn,
      checkOut: searchState.checkOut,
      adults: searchState.adults,
      children: searchState.children,
    } : undefined

    console.log(`[Booking] Opening for ${property.name} with search dates:`, prefilledDates)
    openBooking(bookingProperty, lang as 'en' | 'he', prefilledDates)
    onClose()
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const displayImages = property.photos.length > 0
    ? property.photos.map(p => p.url)
    : ['#E8D5C4']

  const formatPrice = (agorot: number) => Math.round(agorot / 100).toLocaleString()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg">
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Image Gallery */}
          <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:h-[500px] bg-gray-100">
            {displayImages.map((img, idx) => (
              <div key={idx} className={`absolute inset-0 transition-opacity duration-300 ${idx === currentImage ? 'opacity-100' : 'opacity-0'}`}>
                {img.startsWith('http') || img.startsWith('/') ? (
                  <Image src={img} alt={`${property.name} - Image ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: img }}>
                    <span className="text-6xl opacity-30">🏠</span>
                  </div>
                )}
              </div>
            ))}

            {/* Available Badge */}
            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
              <span className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg shadow-lg">
                {isRTL ? 'זמין לתאריכים שנבחרו' : 'Available for your dates'}
              </span>
            </div>

            {displayImages.length > 1 && (
              <>
                <button onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : displayImages.length - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentImage(prev => prev < displayImages.length - 1 ? prev + 1 : 0)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {displayImages.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImage(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentImage ? 'bg-white w-4' : 'bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <div className={`flex-1 p-6 md:p-8 overflow-y-auto ${isRTL ? 'text-right' : ''}`}>
            <div className="mb-6">
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="px-2 py-0.5 bg-[var(--primary-100)] text-[var(--primary-700)] text-xs font-medium rounded-full">
                  {t('marketplace.superhost')}
                </span>
                <div className={`flex items-center gap-1 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <StarIcon className="w-4 h-4" />
                  <span>4.95</span>
                  <span className="text-[var(--foreground-muted)]">· {isRTL ? '100+ ביקורות' : '100+ reviews'}</span>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-1" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
                {property.name}
              </h2>
              <p className="text-[var(--foreground-muted)]">
                {property.location || (isRTL ? 'אילת, ישראל' : 'Eilat, Israel')}
              </p>
              <p className="text-sm text-[var(--neutral-500)] mt-1">
                {isRTL ? `מארח: ${property.organizationName || 'Rently Luxury'}` : `Hosted by ${property.organizationName || 'Rently Luxury'}`}
              </p>
            </div>

            {/* Specs */}
            {(property.bedrooms || property.bathrooms || property.maxGuests) && (
              <div className={`flex gap-6 py-4 border-y border-[var(--neutral-200)] mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {property.bedrooms && (
                  <div className="text-center">
                    <div className="text-xl font-semibold">{property.bedrooms}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">{t('marketplace.bedrooms')}</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <div className="text-xl font-semibold">{property.bathrooms}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">{t('marketplace.bathrooms')}</div>
                  </div>
                )}
                {property.maxGuests && (
                  <div className="text-center">
                    <div className="text-xl font-semibold">{property.maxGuests}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">{t('marketplace.guests')}</div>
                  </div>
                )}
              </div>
            )}

            {/* Search Date Summary */}
            {searchState.checkIn && searchState.checkOut && (
              <div className={`bg-[var(--neutral-50)] rounded-xl p-4 mb-6 ${isRTL ? 'text-right' : ''}`}>
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`font-medium ${isRTL ? 'font-heebo' : ''}`}>
                    {isRTL ? 'התאריכים שלך' : 'Your dates'}
                  </span>
                </div>
                <p className={`text-sm text-[var(--neutral-600)] ${isRTL ? 'font-heebo' : ''}`}>
                  {searchState.checkIn.toLocaleDateString(isRTL ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' })}
                  {' → '}
                  {searchState.checkOut.toLocaleDateString(isRTL ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' })}
                  {' · '}
                  {property.pricing?.nights || 0} {isRTL ? 'לילות' : 'nights'}
                  {' · '}
                  {searchState.adults + searchState.children} {isRTL ? 'אורחים' : 'guests'}
                </p>
              </div>
            )}

            {/* Price Summary */}
            {property.pricing && (
              <div className={`space-y-2 mb-6 ${isRTL ? 'text-right' : ''}`}>
                <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[var(--neutral-600)]">
                    ₪{formatPrice(property.pricing.averageNightlyRate)} × {property.pricing.nights} {isRTL ? 'לילות' : 'nights'}
                  </span>
                  <span>₪{formatPrice(property.pricing.accommodation)}</span>
                </div>
                {property.pricing.cleaningFee > 0 && (
                  <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[var(--neutral-600)]">{isRTL ? 'דמי ניקיון' : 'Cleaning fee'}</span>
                    <span>₪{formatPrice(property.pricing.cleaningFee)}</span>
                  </div>
                )}
                {property.pricing.serviceFee > 0 && (
                  <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[var(--neutral-600)]">{isRTL ? 'עמלת שירות' : 'Service fee'}</span>
                    <span>₪{formatPrice(property.pricing.serviceFee)}</span>
                  </div>
                )}
                {property.pricing.taxes > 0 && (
                  <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[var(--neutral-600)]">{isRTL ? 'מיסים' : 'Taxes'}</span>
                    <span>₪{formatPrice(property.pricing.taxes)}</span>
                  </div>
                )}
                <div className={`flex justify-between pt-3 border-t border-[var(--neutral-200)] font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'סה"כ' : 'Total'}</span>
                  <span>₪{formatPrice(property.pricing.total)}</span>
                </div>
              </div>
            )}

            {/* Book Now Button */}
            <div className={`flex items-center justify-between pt-6 border-t border-[var(--neutral-200)] ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                {property.pricing ? (
                  <>
                    <span className="text-2xl font-bold">₪{formatPrice(property.pricing.total)}</span>
                    <span className="text-[var(--foreground-muted)]"> {isRTL ? 'סה"כ' : 'total'}</span>
                  </>
                ) : (
                  <span className="text-lg text-[var(--neutral-500)]">{isRTL ? 'בדיקת מחיר...' : 'Checking price...'}</span>
                )}
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#FF385C] to-[#BD1E59] hover:from-[#E31C5F] hover:to-[#A01852]"
                onClick={handleBookNow}
              >
                {t('marketplace.reserve')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Search Bar Component ─────────────────────────────────────────────────────
function SearchBar() {
  const { lang, t, isRTL } = useLanguage()
  const {
    state,
    setDates,
    setGuests,
    search,
    toggleDatePicker,
    toggleGuestsPicker,
    closeAllPickers,
  } = useMarketplaceSearch()

  // Refs for positioning the pickers
  const searchBarRef = useRef<HTMLDivElement>(null)
  const guestsRef = useRef<HTMLDivElement>(null)

  const formatDate = (date: Date | null): string => {
    if (!date) return t('marketplace.addDates')
    return date.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatGuests = (): string => {
    const total = state.adults + state.children
    if (total === 0) return t('marketplace.addGuests')
    if (lang === 'he') {
      return `${total} אורחים`
    }
    return `${total} guest${total > 1 ? 's' : ''}`
  }

  const handleSearch = async () => {
    closeAllPickers()
    await search()
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Date Range Picker - rendered via portal */}
      <DateRangePicker
        checkIn={state.checkIn}
        checkOut={state.checkOut}
        onSelect={setDates}
        isOpen={state.isDatePickerOpen}
        onClose={() => toggleDatePicker(false)}
        lang={lang as 'en' | 'he'}
        anchorRef={searchBarRef as React.RefObject<HTMLElement>}
      />

      <div
        ref={searchBarRef}
        className={`
          bg-white rounded-full shadow-lg border transition-all duration-300
          ${state.isDatePickerOpen || state.isGuestsPickerOpen ? 'shadow-xl border-[var(--neutral-300)] scale-[1.02]' : 'border-[var(--neutral-200)]'}
        `}
      >
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Where */}
          <div className={`flex-1 px-6 py-4 cursor-pointer hover:bg-[var(--neutral-100)] transition-colors ${isRTL ? 'rounded-r-full text-right' : 'rounded-l-full'}`}>
            <label className={`block text-[11px] font-semibold text-[var(--foreground)] ${isRTL ? 'font-heebo' : 'uppercase tracking-wide'}`}>
              {t('marketplace.where')}
            </label>
            <input
              type="text"
              placeholder={t('marketplace.searchDest')}
              className={`w-full bg-transparent text-[13px] text-[var(--foreground)] placeholder:text-[var(--neutral-400)] outline-none ${isRTL ? 'font-heebo text-right' : ''}`}
            />
          </div>

          <div className="w-px h-8 bg-[var(--neutral-200)]" />

          {/* Check in */}
          <div
            className={`relative px-6 py-4 cursor-pointer hover:bg-[var(--neutral-100)] transition-colors ${isRTL ? 'text-right' : ''}`}
            onClick={() => toggleDatePicker(!state.isDatePickerOpen)}
          >
            <label className={`block text-[11px] font-semibold text-[var(--foreground)] ${isRTL ? 'font-heebo' : 'uppercase tracking-wide'}`}>
              {t('marketplace.checkIn')}
            </label>
            <span className={`text-[13px] ${state.checkIn ? 'text-[var(--foreground)]' : 'text-[var(--neutral-400)]'} ${isRTL ? 'font-heebo' : ''}`}>
              {formatDate(state.checkIn)}
            </span>
          </div>

          <div className="w-px h-8 bg-[var(--neutral-200)]" />

          {/* Check out */}
          <div
            className={`px-6 py-4 cursor-pointer hover:bg-[var(--neutral-100)] transition-colors ${isRTL ? 'text-right' : ''}`}
            onClick={() => toggleDatePicker(!state.isDatePickerOpen)}
          >
            <label className={`block text-[11px] font-semibold text-[var(--foreground)] ${isRTL ? 'font-heebo' : 'uppercase tracking-wide'}`}>
              {t('marketplace.checkOut')}
            </label>
            <span className={`text-[13px] ${state.checkOut ? 'text-[var(--foreground)]' : 'text-[var(--neutral-400)]'} ${isRTL ? 'font-heebo' : ''}`}>
              {formatDate(state.checkOut)}
            </span>
          </div>

          <div className="w-px h-8 bg-[var(--neutral-200)]" />

          {/* Who */}
          <div
            ref={guestsRef}
            className={`relative flex-1 flex items-center justify-between py-2 ${isRTL ? 'pr-6 pl-2 flex-row-reverse' : 'pl-6 pr-2'}`}
          >
            <div
              className={`cursor-pointer ${isRTL ? 'text-right' : ''}`}
              onClick={() => toggleGuestsPicker(!state.isGuestsPickerOpen)}
            >
              <label className={`block text-[11px] font-semibold text-[var(--foreground)] ${isRTL ? 'font-heebo' : 'uppercase tracking-wide'}`}>
                {t('marketplace.who')}
              </label>
              <span className={`text-[13px] ${state.adults > 0 ? 'text-[var(--foreground)]' : 'text-[var(--neutral-400)]'} ${isRTL ? 'font-heebo' : ''}`}>
                {formatGuests()}
              </span>
            </div>

            <GuestsPicker
              adults={state.adults}
              children={state.children}
              onSelect={setGuests}
              isOpen={state.isGuestsPickerOpen}
              onClose={() => toggleGuestsPicker(false)}
              lang={lang as 'en' | 'he'}
              anchorRef={guestsRef as React.RefObject<HTMLElement>}
            />

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              disabled={state.isSearching}
              className={`
                flex items-center gap-2 px-4 py-3
                bg-gradient-to-r from-[#FF385C] to-[#BD1E59]
                hover:from-[#E31C5F] hover:to-[#A01852]
                text-white font-medium rounded-full
                transition-all duration-200
                hover:shadow-lg hover:scale-105 active:scale-100
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
              `}
            >
              {state.isSearching ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <SearchIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{t('marketplace.search')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Content Component ───────────────────────────────────────────────────
function MarketplaceContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [properties, setProperties] = useState<Property[]>(fallbackProperties)
  const [loading, setLoading] = useState(true)
  const [totalProperties, setTotalProperties] = useState(0)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedSearchResult, setSelectedSearchResult] = useState<SearchProperty | null>(null)
  const { lang, t, isRTL } = useLanguage()
  const { openBooking } = useBooking()
  const { state: searchState, clearSearch } = useMarketplaceSearch()

  // Fetch curated Rently properties
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true)
        const response = await fetch(`/api/public/rently/curated-listings?limit=28&lang=${lang}`)
        const data = await response.json()

        if (data.success && data.data.listings.length > 0) {
          setProperties(data.data.listings)
          setTotalProperties(data.data.total)
          console.log(`[Marketplace] Loaded ${data.data.listings.length} curated Rently properties (${lang})`)
        } else {
          console.log('[Marketplace] No properties from API, using fallback')
          setProperties(fallbackProperties)
        }
      } catch (error) {
        console.error('[Marketplace] Error fetching properties:', error)
        setProperties(fallbackProperties)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [lang])

  // Handle selecting a search result - show elegant modal first
  const handleSelectSearchResult = useCallback((result: SearchProperty) => {
    setSelectedSearchResult(result)
  }, [])

  // Determine what to show: search results or default properties
  const showSearchResults = searchState.hasSearched && !searchState.error

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section with Search */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF385C] via-[#BD1E59] to-[#92174D] opacity-[0.03]" />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(181, 132, 109, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(181, 132, 109, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 50% 100%, rgba(181, 132, 109, 0.05) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <SearchBar />
        </div>
      </section>

      {/* Search Results Header */}
      {showSearchResults && (
        <section className="py-4 bg-[var(--neutral-50)] border-b border-[var(--neutral-200)]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <h2 className={`text-lg font-semibold text-[var(--foreground)] ${isRTL ? 'font-heebo' : ''}`}>
                  {searchState.results?.length || 0} {isRTL ? 'נכסים זמינים' : 'properties available'}
                </h2>
                {searchState.checkIn && searchState.checkOut && (
                  <p className={`text-sm text-[var(--neutral-500)] ${isRTL ? 'font-heebo' : ''}`}>
                    {searchState.checkIn.toLocaleDateString()} - {searchState.checkOut.toLocaleDateString()}
                    {' · '}{searchState.adults + searchState.children} {isRTL ? 'אורחים' : 'guests'}
                  </p>
                )}
              </div>
              <button
                onClick={clearSearch}
                className={`text-sm text-[var(--neutral-600)] hover:text-[var(--foreground)] underline ${isRTL ? 'font-heebo' : ''}`}
              >
                {isRTL ? 'נקה חיפוש' : 'Clear search'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Category Pills - Only show when not searching */}
      {!showSearchResults && (
        <section className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-[var(--neutral-200)]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-4 overflow-x-auto scrollbar-hide">
              <div className={`flex items-center justify-center gap-8 sm:gap-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                      className={`
                        group flex flex-col items-center justify-center
                        min-w-fit pb-3 border-b-2 transition-all duration-200
                        ${isSelected
                          ? 'border-[var(--foreground)] opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:border-[var(--neutral-300)]'
                        }
                      `}
                    >
                      <span className={`text-[22px] mb-1 transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {category.icon}
                      </span>
                      <span className={`text-[11px] font-medium whitespace-nowrap text-center ${isRTL ? 'font-heebo tracking-normal' : 'tracking-wide uppercase'}`}>
                        {category.label[lang]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Properties/Results Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Error */}
          {searchState.error && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">😕</div>
              <h3 className={`text-lg font-medium text-[var(--foreground)] mb-2 ${isRTL ? 'font-heebo' : ''}`}>
                {isRTL ? 'שגיאה בחיפוש' : 'Search Error'}
              </h3>
              <p className={`text-[var(--neutral-500)] ${isRTL ? 'font-heebo' : ''}`}>
                {searchState.error}
              </p>
            </div>
          )}

          {/* Search Results */}
          {showSearchResults && !searchState.error && (
            <>
              {searchState.results && searchState.results.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {searchState.results.map((result) => (
                    <SearchResultCard
                      key={result.id}
                      property={result}
                      onSelect={() => handleSelectSearchResult(result)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏠</div>
                  <h3 className={`text-lg font-medium text-[var(--foreground)] mb-2 ${isRTL ? 'font-heebo' : ''}`}>
                    {isRTL ? 'לא נמצאו נכסים זמינים' : 'No properties available'}
                  </h3>
                  <p className={`text-[var(--neutral-500)] mb-4 ${isRTL ? 'font-heebo' : ''}`}>
                    {isRTL ? 'נסו לשנות את התאריכים או מספר האורחים' : 'Try adjusting your dates or guest count'}
                  </p>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-[var(--foreground)] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {isRTL ? 'נקה חיפוש' : 'Clear search'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Default Properties (when not searching) */}
          {!showSearchResults && !searchState.error && (
            <>
              {loading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square rounded-xl bg-gray-200 mb-3" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onSelect={setSelectedProperty}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Property Modal */}
          {selectedProperty && (
            <PropertyModal
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          )}

          {/* Search Result Modal */}
          {selectedSearchResult && (
            <SearchResultModal
              property={selectedSearchResult}
              searchState={{
                checkIn: searchState.checkIn,
                checkOut: searchState.checkOut,
                adults: searchState.adults,
                children: searchState.children,
              }}
              onClose={() => setSelectedSearchResult(null)}
            />
          )}

          {/* Total count */}
          {!loading && !showSearchResults && totalProperties > 0 && (
            <p className="text-center text-sm text-[var(--foreground-muted)] mt-8">
              {t('marketplace.showing')} {properties.length} {t('marketplace.of')} {totalProperties} {t('marketplace.properties')}
            </p>
          )}
        </div>
      </section>

      {/* Featured Host Banner */}
      <section className="py-12 bg-gradient-to-r from-[var(--primary-50)] to-[var(--primary-100)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[var(--primary-300)] to-[var(--primary-400)] flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair, serif)' }}>R</span>
            </div>
            <div className={`flex-1 text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
              <Badge variant="primary" className="mb-3">{t('marketplace.featuredHost')}</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
                Rently Luxury Rentals
              </h2>
              <p className="text-[var(--foreground-muted)] mb-4 max-w-xl">{t('marketplace.hostDescription')}</p>
              <Link href="/h/rently">
                <Button className="group">
                  {t('marketplace.exploreHost')}
                  <ChevronRightIcon className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
                </Button>
              </Link>
            </div>
            <div className={`flex gap-8 text-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <div className="text-3xl font-bold text-[var(--brand-primary)]">{totalProperties || 28}</div>
                <div className="text-sm text-[var(--foreground-muted)]">{t('marketplace.properties')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--brand-primary)]">4.95</div>
                <div className="text-sm text-[var(--foreground-muted)]">{t('marketplace.avgRating')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--brand-primary)]">500+</div>
                <div className="text-sm text-[var(--foreground-muted)]">{t('marketplace.reviews')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#222222] to-[#111111] p-8 md:p-12">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className={`relative flex flex-col md:flex-row items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('marketplace.becomeHost')}</h2>
                <p className="text-white/70 max-w-md">{t('marketplace.becomeHostDesc')}</p>
              </div>
              <Button size="lg" className="bg-white text-[#222222] hover:bg-white/90 whitespace-nowrap">
                {t('marketplace.getStarted')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <MarketplaceSearchProvider>
      <MarketplaceContent />
    </MarketplaceSearchProvider>
  )
}
