// ═══════════════════════════════════════════════════════════════════════════════
// BECOME A HOST SECTION - Elegant Luxury Design
// ═══════════════════════════════════════════════════════════════════════════════
// Sophisticated CTA section with:
// - Muted, elegant color palette (champagne, deep navy, warm tones)
// - Subtle animations and refined micro-interactions
// - Dynamic earnings calculator
// - Social proof with host testimonials
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Elegant Color Palette ─────────────────────────────────────────────────────
const colors = {
  // Primary - Warm champagne/gold tones
  primary: '#B5846D',
  primaryLight: '#D4B896',
  primaryDark: '#8B6347',

  // Accent - Deep sophisticated tones
  accent: '#2C3E50',
  accentLight: '#34495E',

  // Neutrals
  dark: '#1a1a1a',
  darkMuted: '#2d2d2d',
  light: '#faf9f7',
  cream: '#f5f3ef',

  // Success/Trust
  success: '#4A7C59',
  gold: '#C9A86C',
}

// ─── Animated Counter Hook ─────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(!startOnView)

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function: easeOutExpo
      const easeOutExpo = 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(easeOutExpo * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration, hasStarted])

  return { count, start: () => setHasStarted(true), hasStarted }
}

// ─── Trust Badge Component ─────────────────────────────────────────────────────
function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[#faf9f7]/70 hover:text-[#faf9f7] transition-colors group">
      <span className="text-base group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium tracking-wide">{text}</span>
    </div>
  )
}

// ─── Host Avatar Stack ─────────────────────────────────────────────────────────
function HostAvatarStack() {
  const hosts = [
    { name: 'S', gradient: 'from-[#B5846D] to-[#8B6347]' },
    { name: 'D', gradient: 'from-[#4A7C59] to-[#3D6B4A]' },
    { name: 'M', gradient: 'from-[#C9A86C] to-[#A68B4B]' },
    { name: 'Y', gradient: 'from-[#2C3E50] to-[#1a252f]' },
    { name: '+', gradient: 'from-[#34495E] to-[#2C3E50]', isCount: true },
  ]

  return (
    <div className="flex items-center -space-x-2">
      {hosts.map((host, idx) => (
        <div
          key={idx}
          className={`
            w-9 h-9 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center
            text-white text-xs font-semibold shadow-md
            hover:scale-110 hover:z-10 transition-all duration-300 cursor-pointer
            bg-gradient-to-br ${host.gradient}
          `}
          style={{ zIndex: hosts.length - idx }}
        >
          {host.isCount ? '847' : host.name}
        </div>
      ))}
    </div>
  )
}

// ─── Earnings Calculator ───────────────────────────────────────────────────────
function EarningsCalculator({ isRTL }: { isRTL: boolean }) {
  const [location, setLocation] = useState('eilat')
  const { count: earnings, start, hasStarted } = useAnimatedCounter(8500, 1500)

  const locations = useMemo(() => ({
    eilat: { name: isRTL ? 'אילת' : 'Eilat', earnings: 8500 },
    tlv: { name: isRTL ? 'תל אביב' : 'Tel Aviv', earnings: 12000 },
    jerusalem: { name: isRTL ? 'ירושלים' : 'Jerusalem', earnings: 9500 },
    haifa: { name: isRTL ? 'חיפה' : 'Haifa', earnings: 7000 },
  }), [isRTL])

  useEffect(() => {
    if (!hasStarted) {
      const timer = setTimeout(start, 500)
      return () => clearTimeout(timer)
    }
  }, [start, hasStarted])

  return (
    <div className="relative">
      {/* Subtle glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#B5846D]/30 via-[#C9A86C]/20 to-[#B5846D]/30 rounded-2xl blur-md" />

      <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl p-6 border border-[#B5846D]/20">
        <div className={`text-xs uppercase tracking-widest text-[#B5846D] mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'הכנסה חודשית משוערת' : 'Estimated Monthly Income'}
        </div>

        {/* Animated earnings display */}
        <div className={`flex items-baseline gap-1 mb-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <span className="text-4xl md:text-5xl font-light text-[#faf9f7] tabular-nums tracking-tight">
            ₪{hasStarted ? earnings.toLocaleString() : '0'}
          </span>
          <span className="text-lg text-[#faf9f7]/50 font-light">
            / {isRTL ? 'חודש' : 'month'}
          </span>
        </div>

        {/* Location selector */}
        <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {Object.entries(locations).map(([key, loc]) => (
            <button
              key={key}
              onClick={() => setLocation(key)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300
                ${location === key
                  ? 'bg-[#B5846D] text-white'
                  : 'bg-[#faf9f7]/5 text-[#faf9f7]/60 hover:bg-[#faf9f7]/10 hover:text-[#faf9f7]/80'
                }
              `}
            >
              {loc.name}
            </button>
          ))}
        </div>

        <div className={`text-xs text-[#faf9f7]/30 mt-3 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'בהתבסס על נכסים דומים באזור' : 'Based on similar properties in the area'}
        </div>
      </div>
    </div>
  )
}

// ─── Testimonial Bubble ────────────────────────────────────────────────────────
function TestimonialBubble({ isRTL }: { isRTL: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = useMemo(() => [
    {
      name: isRTL ? 'שרה כ.' : 'Sarah K.',
      earnings: '₪45,000',
      period: isRTL ? 'בחודש שעבר' : 'last month',
      badge: isRTL ? 'סופרהוסט' : 'Superhost',
      gradient: 'from-[#B5846D] to-[#8B6347]'
    },
    {
      name: isRTL ? 'דוד מ.' : 'David M.',
      earnings: '₪32,000',
      period: isRTL ? 'בחודש שעבר' : 'last month',
      badge: isRTL ? 'מארח מוביל' : 'Top Host',
      gradient: 'from-[#4A7C59] to-[#3D6B4A]'
    },
    {
      name: isRTL ? 'מיכל ל.' : 'Michal L.',
      earnings: '₪28,500',
      period: isRTL ? 'בחודש שעבר' : 'last month',
      badge: isRTL ? 'מארחת חדשה' : 'New Host',
      gradient: 'from-[#C9A86C] to-[#A68B4B]'
    },
  ], [isRTL])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const current = testimonials[currentIndex]

  return (
    <div className="relative">
      <div className={`
        relative bg-[#faf9f7]/5 backdrop-blur-sm rounded-2xl p-4 border border-[#faf9f7]/10
        transform transition-all duration-500
        ${isRTL ? 'text-right' : ''}
      `}>
        <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br ${current.gradient}`}
          >
            {current.name[0]}
          </div>

          <div className={isRTL ? 'text-right' : ''}>
            <div className="text-[#faf9f7] font-medium text-sm">{current.name}</div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-[#C9A86C] text-xs">★★★★★</span>
              <span className="text-xs px-2 py-0.5 bg-[#B5846D]/20 rounded-full text-[#B5846D]">
                {current.badge}
              </span>
            </div>
          </div>
        </div>

        <div className={`flex items-baseline gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <span className="text-sm text-[#faf9f7]/70">{isRTL ? 'הרווחתי' : 'I earned'}</span>
          <span className="text-xl font-semibold text-[#C9A86C]">{current.earnings}</span>
          <span className="text-[#faf9f7]/40 text-xs">{current.period}</span>
        </div>

        {/* Pagination dots */}
        <div className={`flex gap-1 mt-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          {testimonials.map((_, idx) => (
            <div
              key={idx}
              className={`
                h-1 rounded-full transition-all duration-300
                ${idx === currentIndex ? 'w-4 bg-[#B5846D]' : 'w-1 bg-[#faf9f7]/20'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BecomeHostSection() {
  const { t, isRTL } = useLanguage()

  const trustBadges = useMemo(() => [
    { icon: '✓', text: isRTL ? 'ללא עמלות רישום' : 'No listing fees' },
    { icon: '◈', text: isRTL ? 'ביטוח פרימיום' : 'Premium insurance' },
    { icon: '◉', text: isRTL ? 'תמיכה 24/7' : '24/7 support' },
    { icon: '⟡', text: isRTL ? 'תשלום מהיר' : 'Fast payouts' },
  ], [isRTL])

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Elegant Dark Background */}
      <div className="absolute inset-0 bg-[#0f0f0f]">
        {/* Subtle gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#B5846D]/8 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#2C3E50]/10 via-transparent to-transparent" />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-noise" />

        {/* Elegant line pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(90deg, #B5846D 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>

          {/* Left Column - Content */}
          <div className={`space-y-8 ${isRTL ? 'lg:col-start-2 text-right' : ''}`}>
            {/* Social Proof Header */}
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <HostAvatarStack />
              <div className="text-[#faf9f7]/50 text-sm tracking-wide">
                <span className="text-[#faf9f7] font-medium">2,847</span> {isRTL ? 'מארחים בישראל' : 'hosts in Israel'}
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-light text-[#faf9f7] leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-playfair, Georgia, serif)' }}
              >
                {isRTL ? (
                  <>
                    <span className="block">הפוך את הנכס שלך</span>
                    <span className="block text-[#B5846D]">למקור הכנסה</span>
                  </>
                ) : (
                  <>
                    <span className="block">Turn your space into</span>
                    <span className="block text-[#B5846D]">steady income</span>
                  </>
                )}
              </h2>

              <p className="text-base md:text-lg text-[#faf9f7]/50 max-w-lg leading-relaxed font-light">
                {isRTL
                  ? 'הצטרף לקהילת המארחים המובילה בישראל. כלים מתקדמים, תמיכה מלאה, והכנסה יציבה.'
                  : 'Join Israel\'s premier host community. Advanced tools, full support, and reliable income.'
                }
              </p>
            </div>

            {/* CTA Button */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Link href="/become-a-host" className="group">
                <button className="px-8 py-4 bg-[#B5846D] text-white font-medium text-base rounded-lg hover:bg-[#a07460] transition-all duration-300 flex items-center gap-2 whitespace-nowrap tracking-wide">
                  {isRTL ? 'התחל עכשיו' : 'Get Started'}
                  <svg
                    className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>

              <Link
                href="/become-a-host#how-it-works"
                className="px-8 py-4 bg-transparent text-[#faf9f7]/70 font-medium text-base rounded-lg border border-[#faf9f7]/20 hover:bg-[#faf9f7]/5 hover:text-[#faf9f7] transition-all duration-300 text-center tracking-wide"
              >
                {isRTL ? 'איך זה עובד?' : 'How it works'}
              </Link>
            </div>

            {/* Trust Badges */}
            <div className={`flex flex-wrap gap-6 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {trustBadges.map((badge, idx) => (
                <TrustBadge key={idx} icon={badge.icon} text={badge.text} />
              ))}
            </div>
          </div>

          {/* Right Column - Earnings Calculator & Testimonial */}
          <div className={`space-y-4 ${isRTL ? 'lg:col-start-1' : ''}`}>
            <EarningsCalculator isRTL={isRTL} />
            <TestimonialBubble isRTL={isRTL} />
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className={`mt-20 pt-12 border-t border-[#faf9f7]/10 ${isRTL ? 'text-right' : ''}`}>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${isRTL ? 'direction-rtl' : ''}`}>
            {[
              { value: '₪2.5M+', label: isRTL ? 'הכנסות מארחים השנה' : 'Host earnings this year' },
              { value: '98%', label: isRTL ? 'שיעור שביעות רצון' : 'Satisfaction rate' },
              { value: '< 24h', label: isRTL ? 'זמן הרשמה ממוצע' : 'Average signup time' },
              { value: '10K+', label: isRTL ? 'הזמנות מוצלחות' : 'Successful bookings' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-3xl font-light text-[#faf9f7] mb-1 tracking-tight">{stat.value}</div>
                <div className="text-xs text-[#faf9f7]/40 tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
      `}</style>
    </section>
  )
}
