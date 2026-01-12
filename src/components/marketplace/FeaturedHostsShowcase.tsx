// ═══════════════════════════════════════════════════════════════════════════════
// FEATURED HOSTS SHOWCASE - Premium Host Sites Display
// ═══════════════════════════════════════════════════════════════════════════════
// State-of-the-art showcase displaying:
// - Host personal sites with live previews
// - City-based filtering with elegant tabs
// - Score/ranking system with badges
// - Animated cards with hover effects
// - Future host sites placeholder
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface HostSite {
  id: string
  slug: string
  name: string
  tagline: string
  city: string
  country: string
  score: number
  rating: number
  reviewCount: number
  propertyCount: number
  monthlyEarnings: number
  badges: string[]
  coverImage: string
  logoInitial: string
  gradient: string
  isLive: boolean
  joinedDate: string
}

// ─── Mock Data - Future: Fetch from API ────────────────────────────────────────
const mockHosts: HostSite[] = [
  {
    id: '1',
    slug: 'rently',
    name: 'Rently Luxury',
    tagline: 'Premium Vacation Rentals',
    city: 'Eilat',
    country: 'Israel',
    score: 98,
    rating: 4.97,
    reviewCount: 547,
    propertyCount: 28,
    monthlyEarnings: 125000,
    badges: ['Superhost', 'Top Earner', 'Premium'],
    coverImage: '/apartments/seaside/lavender/1.jpg',
    logoInitial: 'R',
    gradient: 'from-[#B5846D] to-[#8B6347]',
    isLive: true,
    joinedDate: '2023-01'
  },
  {
    id: '2',
    slug: 'tlv-stays',
    name: 'TLV Stays',
    tagline: 'Urban Luxury Living',
    city: 'Tel Aviv',
    country: 'Israel',
    score: 95,
    rating: 4.92,
    reviewCount: 312,
    propertyCount: 15,
    monthlyEarnings: 98000,
    badges: ['Superhost', 'City Expert'],
    coverImage: '',
    logoInitial: 'T',
    gradient: 'from-[#2C3E50] to-[#1a252f]',
    isLive: false,
    joinedDate: '2023-06'
  },
  {
    id: '3',
    slug: 'jerusalem-heritage',
    name: 'Jerusalem Heritage',
    tagline: 'Historic Boutique Homes',
    city: 'Jerusalem',
    country: 'Israel',
    score: 94,
    rating: 4.95,
    reviewCount: 203,
    propertyCount: 8,
    monthlyEarnings: 67000,
    badges: ['Superhost', 'Heritage'],
    coverImage: '',
    logoInitial: 'J',
    gradient: 'from-[#C9A86C] to-[#A68B4B]',
    isLive: false,
    joinedDate: '2023-08'
  },
  {
    id: '4',
    slug: 'dead-sea-retreats',
    name: 'Dead Sea Retreats',
    tagline: 'Wellness & Relaxation',
    city: 'Dead Sea',
    country: 'Israel',
    score: 92,
    rating: 4.89,
    reviewCount: 156,
    propertyCount: 6,
    monthlyEarnings: 52000,
    badges: ['Wellness', 'Nature'],
    coverImage: '',
    logoInitial: 'D',
    gradient: 'from-[#4A7C59] to-[#3D6B4A]',
    isLive: false,
    joinedDate: '2024-01'
  },
  {
    id: '5',
    slug: 'galilee-escapes',
    name: 'Galilee Escapes',
    tagline: 'Mountain & Lake Views',
    city: 'Galilee',
    country: 'Israel',
    score: 91,
    rating: 4.88,
    reviewCount: 189,
    propertyCount: 12,
    monthlyEarnings: 45000,
    badges: ['Nature', 'Family'],
    coverImage: '',
    logoInitial: 'G',
    gradient: 'from-[#34495E] to-[#2C3E50]',
    isLive: false,
    joinedDate: '2024-03'
  }
]

// ─── City Filter Tabs ──────────────────────────────────────────────────────────
function CityTabs({
  cities,
  activeCity,
  onCityChange,
  isRTL
}: {
  cities: { id: string; name: string; count: number }[]
  activeCity: string
  onCityChange: (city: string) => void
  isRTL: boolean
}) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {cities.map((city) => (
        <button
          key={city.id}
          onClick={() => onCityChange(city.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
            ${activeCity === city.id
              ? 'bg-[#1a1a1a] text-white'
              : 'bg-[#f5f3ef] text-[#717171] hover:bg-[#e8e6e1] hover:text-[#1a1a1a]'
            }
          `}
        >
          {city.name}
          {city.count > 0 && (
            <span className={`ml-1.5 text-xs opacity-60`}>({city.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Score Badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const getScoreColor = () => {
    if (score >= 95) return 'from-[#C9A86C] to-[#A68B4B]'
    if (score >= 90) return 'from-[#4A7C59] to-[#3D6B4A]'
    return 'from-[#34495E] to-[#2C3E50]'
  }

  const getScoreLabel = () => {
    if (score >= 95) return 'Elite'
    if (score >= 90) return 'Premium'
    return 'Rising'
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${getScoreColor()} text-white text-xs font-semibold`}>
      <span className="text-white/80">◆</span>
      <span>{score}</span>
      <span className="text-white/60 text-[10px] uppercase tracking-wider">{getScoreLabel()}</span>
    </div>
  )
}

// ─── Host Card Component ───────────────────────────────────────────────────────
function HostCard({ host, isRTL, rank }: { host: HostSite; isRTL: boolean; rank: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={host.isLive ? `/h/${host.slug}` : '/become-a-host'}>
        <div className={`
          relative bg-white rounded-2xl overflow-hidden border border-[#e8e6e1]
          shadow-sm hover:shadow-xl transition-all duration-500
          ${isHovered ? 'transform -translate-y-2' : ''}
        `}>
          {/* Rank Badge */}
          <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-20`}>
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-bold shadow-lg">
              #{rank}
            </div>
          </div>

          {/* Cover Image / Placeholder */}
          <div className="relative h-48 overflow-hidden">
            {host.coverImage && host.isLive ? (
              <Image
                src={host.coverImage}
                alt={host.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${host.gradient} flex items-center justify-center`}>
                <div className="text-center text-white/80">
                  <div className="text-5xl font-light mb-2" style={{ fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                    {host.logoInitial}
                  </div>
                  <div className="text-xs uppercase tracking-widest opacity-60">
                    {host.isLive ? 'View Site' : 'Coming Soon'}
                  </div>
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Logo */}
            <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${host.gradient} flex items-center justify-center shadow-xl border-2 border-white/20`}>
                <span className="text-white text-2xl font-light" style={{ fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                  {host.logoInitial}
                </span>
              </div>
            </div>

            {/* Score Badge */}
            <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-10`}>
              <ScoreBadge score={host.score} />
            </div>
          </div>

          {/* Content */}
          <div className={`p-5 ${isRTL ? 'text-right' : ''}`}>
            {/* Header */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-0.5">{host.name}</h3>
              <p className="text-sm text-[#717171]">{host.tagline}</p>
            </div>

            {/* Location & Rating */}
            <div className={`flex items-center gap-3 mb-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <svg className="w-4 h-4 text-[#B5846D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-[#717171]">{host.city}</span>
              </div>
              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-[#C9A86C]">★</span>
                <span className="text-[#1a1a1a] font-medium">{host.rating}</span>
                <span className="text-[#717171]">({host.reviewCount})</span>
              </div>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 gap-4 pt-4 border-t border-[#f0eeea] ${isRTL ? 'direction-rtl' : ''}`}>
              <div>
                <div className="text-xl font-semibold text-[#1a1a1a]">{host.propertyCount}</div>
                <div className="text-xs text-[#717171] uppercase tracking-wider">
                  {isRTL ? 'נכסים' : 'Properties'}
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold text-[#4A7C59]">
                  ₪{(host.monthlyEarnings / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-[#717171] uppercase tracking-wider">
                  {isRTL ? 'לחודש' : '/month'}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className={`flex flex-wrap gap-1.5 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {host.badges.slice(0, 3).map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#f5f3ef] text-[#717171] text-xs rounded-full"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Hover CTA Overlay */}
          <div className={`
            absolute inset-0 bg-[#1a1a1a]/90 flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity duration-300
          `}>
            <div className="text-center">
              <div className="text-white text-lg font-medium mb-2">
                {host.isLive
                  ? (isRTL ? 'צפה באתר' : 'View Site')
                  : (isRTL ? 'בקרוב' : 'Coming Soon')
                }
              </div>
              {host.isLive && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#B5846D] text-white rounded-lg text-sm font-medium">
                  {isRTL ? 'בקר עכשיו' : 'Visit Now'}
                  <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

// ─── Future Host Placeholder ───────────────────────────────────────────────────
function FutureHostPlaceholder({ isRTL }: { isRTL: boolean }) {
  return (
    <Link href="/become-a-host">
      <div className={`
        relative bg-gradient-to-br from-[#f5f3ef] to-[#e8e6e1] rounded-2xl overflow-hidden
        border-2 border-dashed border-[#d0cdc6] h-full min-h-[400px]
        hover:border-[#B5846D] hover:shadow-lg transition-all duration-300
        flex items-center justify-center group cursor-pointer
      `}>
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <svg className="w-10 h-10 text-[#B5846D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">
            {isRTL ? 'המקום שלך כאן' : 'Your spot here'}
          </h3>
          <p className="text-[#717171] mb-6 max-w-xs mx-auto">
            {isRTL
              ? 'צור אתר מותאם אישית לנכסים שלך והצטרף לקהילת המארחים המובילה'
              : 'Create a custom website for your properties and join the top host community'
            }
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-lg text-sm font-medium group-hover:bg-[#B5846D] transition-colors">
            {isRTL ? 'התחל עכשיו' : 'Get Started'}
            <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FeaturedHostsShowcase() {
  const { isRTL, t } = useLanguage()
  const [activeCity, setActiveCity] = useState('all')

  const cities = useMemo(() => [
    { id: 'all', name: isRTL ? 'הכל' : 'All', count: mockHosts.length },
    { id: 'eilat', name: isRTL ? 'אילת' : 'Eilat', count: mockHosts.filter(h => h.city === 'Eilat').length },
    { id: 'tel-aviv', name: isRTL ? 'תל אביב' : 'Tel Aviv', count: mockHosts.filter(h => h.city === 'Tel Aviv').length },
    { id: 'jerusalem', name: isRTL ? 'ירושלים' : 'Jerusalem', count: mockHosts.filter(h => h.city === 'Jerusalem').length },
    { id: 'other', name: isRTL ? 'אזורים נוספים' : 'Other Areas', count: mockHosts.filter(h => !['Eilat', 'Tel Aviv', 'Jerusalem'].includes(h.city)).length },
  ], [isRTL])

  const filteredHosts = useMemo(() => {
    if (activeCity === 'all') return mockHosts
    if (activeCity === 'other') return mockHosts.filter(h => !['Eilat', 'Tel Aviv', 'Jerusalem'].includes(h.city))
    const cityName = cities.find(c => c.id === activeCity)?.name
    return mockHosts.filter(h => h.city === cityName || (activeCity === 'tel-aviv' && h.city === 'Tel Aviv'))
  }, [activeCity, cities])

  // Sort by score
  const sortedHosts = useMemo(() => {
    return [...filteredHosts].sort((a, b) => b.score - a.score)
  }, [filteredHosts])

  return (
    <section className="py-20 bg-[#faf9f7]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-widest text-[#B5846D] font-medium">
                {isRTL ? 'אתרי מארחים' : 'Host Sites'}
              </span>
              <div className="h-px w-12 bg-[#B5846D]/30" />
            </div>
            <h2
              className="text-3xl md:text-4xl font-light text-[#1a1a1a] mb-2"
              style={{ fontFamily: 'var(--font-playfair, Georgia, serif)' }}
            >
              {isRTL ? 'מארחים מובילים' : 'Featured Hosts'}
            </h2>
            <p className="text-[#717171] max-w-lg">
              {isRTL
                ? 'גלה את האתרים האישיים של המארחים המצליחים ביותר בישראל'
                : 'Discover the personal sites of Israel\'s most successful hosts'
              }
            </p>
          </div>

          {/* City Filter */}
          <CityTabs
            cities={cities}
            activeCity={activeCity}
            onCityChange={setActiveCity}
            isRTL={isRTL}
          />
        </div>

        {/* Hosts Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${isRTL ? 'direction-rtl' : ''}`}>
          {sortedHosts.map((host, idx) => (
            <HostCard
              key={host.id}
              host={host}
              isRTL={isRTL}
              rank={idx + 1}
            />
          ))}

          {/* Future Host Placeholder - Always show at the end */}
          <FutureHostPlaceholder isRTL={isRTL} />
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-12 ${isRTL ? 'text-right' : ''}`}>
          <p className="text-[#717171] mb-4">
            {isRTL
              ? 'רוצה להצטרף לרשימת המארחים המובילים?'
              : 'Want to join the top hosts list?'
            }
          </p>
          <Link href="/become-a-host">
            <button className="px-6 py-3 bg-[#1a1a1a] text-white font-medium rounded-lg hover:bg-[#333] transition-colors">
              {isRTL ? 'צור את האתר שלך' : 'Create Your Site'}
            </button>
          </Link>
        </div>
      </div>

    </section>
  )
}
