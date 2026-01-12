// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTY DETAIL PAGE - State of the Art
// ═══════════════════════════════════════════════════════════════════════════════
// Beautiful property detail page with booking integration
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBooking } from '@/contexts/BookingContext'
import { Button } from '@/components/ui'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Property {
  id: string
  boomId?: number // Real Boom PMS ID for live pricing
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

// ─── Icons ─────────────────────────────────────────────────────────────────────
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function PropertyPage({
  params,
}: {
  params: Promise<{ hostSlug: string; propertySlug: string }>
}) {
  const { hostSlug, propertySlug } = use(params)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const { t, isRTL, lang } = useLanguage()
  const { openBooking } = useBooking()

  // Open Hostly booking modal with real Boom data
  const handleReserve = () => {
    if (!property) return

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
    console.log(`[Property] Opening booking for ${property.name} with Boom ID: ${property.boomId}`)
    openBooking(bookingProperty, lang as 'en' | 'he')
  }

  // Fetch property data - refetch when language changes
  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true)
        const response = await fetch(`/api/public/${hostSlug}/curated-listings?limit=50&lang=${lang}`)
        const data = await response.json()

        if (data.success && data.data.listings.length > 0) {
          const found = data.data.listings.find((p: Property) => p.slug === propertySlug)
          if (found) {
            setProperty(found)
          }
        }
      } catch (error) {
        console.error('[Property] Error fetching:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [hostSlug, propertySlug, lang])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{isRTL ? 'הנכס לא נמצא' : 'Property Not Found'}</h1>
        <Link href={`/h/${hostSlug}`}>
          <Button>{isRTL ? 'חזור לרשימה' : 'Back to Listings'}</Button>
        </Link>
      </div>
    )
  }

  const displayImages = property.images.length > 0 ? property.images : ['/apartments/placeholder.jpg']

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[var(--neutral-200)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link
              href={`/h/${hostSlug}`}
              className={`flex items-center gap-2 text-sm font-medium hover:text-[var(--brand-primary)] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ChevronLeftIcon className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{isRTL ? 'חזור' : 'Back'}</span>
            </Link>

            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="flex items-center gap-2 text-sm font-medium hover:bg-[var(--neutral-100)] rounded-lg px-3 py-2 transition-colors">
                <ShareIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{isRTL ? 'שתף' : 'Share'}</span>
              </button>
              <button className="flex items-center gap-2 text-sm font-medium hover:bg-[var(--neutral-100)] rounded-lg px-3 py-2 transition-colors">
                <HeartIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{isRTL ? 'שמור' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <section className="relative">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] max-h-[500px]">
          {/* Main Image */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer group"
            onClick={() => setShowAllPhotos(true)}
          >
            <Image
              src={displayImages[0]}
              alt={property.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Grid Images */}
          {displayImages.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="relative cursor-pointer group"
              onClick={() => setShowAllPhotos(true)}
            >
              <Image
                src={img}
                alt={`${property.name} - ${idx + 2}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}

          {/* Show All Button */}
          <button
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            {isRTL ? `הצג את כל ${displayImages.length} התמונות` : `Show all ${displayImages.length} photos`}
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-12 ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
          {/* Main Content */}
          <div className={`lg:col-span-2 ${isRTL ? 'lg:col-start-2' : ''}`}>
            {/* Title & Location */}
            <div className="mb-8">
              <h1
                className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2"
                style={{ fontFamily: 'var(--font-playfair, serif)' }}
              >
                {property.name}
              </h1>
              <div className={`flex items-center gap-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <StarIcon className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span className="font-semibold">{(property.rating || 4.9).toFixed(2)}</span>
                  <span className="text-[var(--foreground-muted)]">· {property.reviews} {t('marketplace.reviews')}</span>
                </div>
                {property.isSuperhost && (
                  <>
                    <span className="text-[var(--foreground-muted)]">·</span>
                    <span className="font-medium">{t('marketplace.superhost')}</span>
                  </>
                )}
                <span className="text-[var(--foreground-muted)]">·</span>
                <span>{property.location}</span>
              </div>
            </div>

            {/* Host Info */}
            <div className={`flex items-center gap-4 py-6 border-y border-[var(--neutral-200)] ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary-300)] to-[var(--primary-400)] flex items-center justify-center text-white text-xl font-bold">
                {property.hostName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{isRTL ? `מארח: ${property.hostName}` : `Hosted by ${property.hostName}`}</p>
                {property.isSuperhost && (
                  <p className="text-sm text-[var(--foreground-muted)]">{t('marketplace.superhost')}</p>
                )}
              </div>
            </div>

            {/* Specs */}
            {property.specs && (
              <div className={`flex gap-8 py-6 border-b border-[var(--neutral-200)] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">🛏️</span>
                  <div>
                    <p className="font-semibold">{property.specs.bedrooms}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">{t('marketplace.bedrooms')}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">🚿</span>
                  <div>
                    <p className="font-semibold">{property.specs.bathrooms}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">{t('marketplace.bathrooms')}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="font-semibold">{property.specs.guests}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">{t('marketplace.guests')}</p>
                  </div>
                </div>
                {property.specs.sqm && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-2xl">📐</span>
                    <div>
                      <p className="font-semibold">{property.specs.sqm}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">m²</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="py-6 border-b border-[var(--neutral-200)]">
              <h2 className="text-xl font-semibold mb-4">{isRTL ? 'על המקום' : 'About this place'}</h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed">
                {property.description || (isRTL
                  ? 'דירת נופש יוקרתית עם כל הפינוקים. מיקום מעולה, נוף מדהים וכל מה שצריך לחופשה מושלמת.'
                  : 'Luxurious vacation rental with all the amenities. Perfect location, stunning views, and everything you need for a perfect getaway.'
                )}
              </p>
            </div>

            {/* Amenities */}
            {property.tags && property.tags.length > 0 && (
              <div className="py-6 border-b border-[var(--neutral-200)]">
                <h2 className="text-xl font-semibold mb-4">{t('marketplace.whatOffers')}</h2>
                <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
                  {property.tags.map((tag, idx) => (
                    <div key={idx} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-lg">✓</span>
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className={`lg:col-span-1 ${isRTL ? 'lg:col-start-1' : ''}`}>
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-[var(--neutral-200)] p-6">
              {/* Price */}
              <div className={`flex items-baseline gap-1 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-2xl font-bold">
                  {property.currency === 'ILS' ? '₪' : '$'}{property.price}
                </span>
                <span className="text-[var(--foreground-muted)]">/ {t('marketplace.night')}</span>
              </div>

              {/* Date Inputs */}
              <div className="border border-[var(--neutral-300)] rounded-xl mb-4 overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="p-3 border-b border-r border-[var(--neutral-300)]">
                    <label className="block text-xs font-bold mb-1">{t('marketplace.checkIn')}</label>
                    <input
                      type="date"
                      className="w-full text-sm outline-none bg-transparent"
                    />
                  </div>
                  <div className="p-3 border-b border-[var(--neutral-300)]">
                    <label className="block text-xs font-bold mb-1">{t('marketplace.checkOut')}</label>
                    <input
                      type="date"
                      className="w-full text-sm outline-none bg-transparent"
                    />
                  </div>
                </div>
                <div className="p-3">
                  <label className="block text-xs font-bold mb-1">{t('marketplace.guests')}</label>
                  <select className="w-full text-sm outline-none bg-transparent">
                    <option>1 {isRTL ? 'אורח' : 'guest'}</option>
                    <option>2 {isRTL ? 'אורחים' : 'guests'}</option>
                    <option>3 {isRTL ? 'אורחים' : 'guests'}</option>
                    <option>4 {isRTL ? 'אורחים' : 'guests'}</option>
                  </select>
                </div>
              </div>

              {/* Reserve Button - Opens Hostly Booking Engine */}
              <Button
                size="lg"
                fullWidth
                className="bg-gradient-to-r from-[#FF385C] to-[#BD1E59] hover:from-[#E31C5F] hover:to-[#A01852] mb-4"
                onClick={handleReserve}
              >
                {t('marketplace.reserve')}
              </Button>

              <p className="text-center text-sm text-[var(--foreground-muted)]">
                {isRTL ? 'לא תחויב עדיין' : "You won't be charged yet"}
              </p>

              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t border-[var(--neutral-200)] space-y-3">
                <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="underline">{property.currency === 'ILS' ? '₪' : '$'}{property.price} x 5 {isRTL ? 'לילות' : 'nights'}</span>
                  <span>{property.currency === 'ILS' ? '₪' : '$'}{property.price * 5}</span>
                </div>
                <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="underline">{isRTL ? 'עמלת שירות' : 'Service fee'}</span>
                  <span>{property.currency === 'ILS' ? '₪' : '$'}{Math.round(property.price * 0.12)}</span>
                </div>
                <div className={`flex justify-between font-semibold pt-3 border-t border-[var(--neutral-200)] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'סה"כ' : 'Total'}</span>
                  <span>{property.currency === 'ILS' ? '₪' : '$'}{property.price * 5 + Math.round(property.price * 0.12)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-[100] bg-black">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="text-white hover:bg-white/10 rounded-full p-2"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <span className="text-white text-sm">{currentImage + 1} / {displayImages.length}</span>
            <div className="w-10" />
          </div>

          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <button
              onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : displayImages.length - 1)}
              className="absolute left-4 text-white hover:bg-white/10 rounded-full p-2"
            >
              <ChevronLeftIcon className="w-8 h-8" />
            </button>

            <div className="relative w-full max-w-4xl h-full">
              <Image
                src={displayImages[currentImage]}
                alt={`${property.name} - ${currentImage + 1}`}
                fill
                className="object-contain"
              />
            </div>

            <button
              onClick={() => setCurrentImage(prev => prev < displayImages.length - 1 ? prev + 1 : 0)}
              className="absolute right-4 text-white hover:bg-white/10 rounded-full p-2"
            >
              <ChevronRightIcon className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
