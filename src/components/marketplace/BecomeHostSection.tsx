// ═══════════════════════════════════════════════════════════════════════════════
// BECOME A HOST SECTION - State-of-the-Art Airbnb-Level Design
// ═══════════════════════════════════════════════════════════════════════════════
// World-class CTA section with:
// - Animated gradient mesh background with floating orbs
// - Dynamic earnings calculator with animated counter
// - Social proof with real host testimonials
// - Trust badges with micro-interactions
// - Stunning hover effects and transitions
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

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

// ─── Floating Orb Component ────────────────────────────────────────────────────
function FloatingOrb({
  size,
  color,
  delay,
  duration,
  initialX,
  initialY
}: {
  size: number
  color: string
  delay: number
  duration: number
  initialX: number
  initialY: number
}) {
  return (
    <div
      className="absolute rounded-full blur-3xl opacity-30 animate-float"
      style={{
        width: size,
        height: size,
        background: color,
        left: `${initialX}%`,
        top: `${initialY}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

// ─── Trust Badge Component ─────────────────────────────────────────────────────
function TrustBadge({ icon, text, delay }: { icon: string; text: string; delay: number }) {
  return (
    <div
      className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}

// ─── Host Avatar Stack ─────────────────────────────────────────────────────────
function HostAvatarStack() {
  const hosts = [
    { name: 'Sarah', color: '#FF385C' },
    { name: 'David', color: '#00A699' },
    { name: 'Maya', color: '#FC642D' },
    { name: 'Yossi', color: '#484848' },
    { name: '+847', color: '#767676', isCount: true },
  ]

  return (
    <div className="flex items-center -space-x-3">
      {hosts.map((host, idx) => (
        <div
          key={idx}
          className={`
            w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center
            text-white text-xs font-bold shadow-lg
            hover:scale-110 hover:z-10 transition-all duration-300 cursor-pointer
            ${host.isCount ? 'bg-white/10 backdrop-blur-sm' : ''}
          `}
          style={{
            background: host.isCount ? undefined : `linear-gradient(135deg, ${host.color}, ${host.color}dd)`,
            zIndex: hosts.length - idx,
            animationDelay: `${idx * 100}ms`
          }}
          title={host.isCount ? `${host.name} more hosts` : host.name}
        >
          {host.isCount ? host.name : host.name[0]}
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

  const currentEarnings = locations[location as keyof typeof locations]?.earnings || 8500

  return (
    <div className="relative">
      {/* Glowing border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF385C] via-[#BD1E59] to-[#FF385C] rounded-2xl opacity-50 blur-sm animate-pulse-slow" />

      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className={`text-sm text-white/60 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'הנכס שלך יכול להרוויח' : 'Your property could earn'}
        </div>

        {/* Animated earnings display */}
        <div className={`flex items-baseline gap-1 mb-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <span className="text-5xl md:text-6xl font-bold text-white tabular-nums">
            ₪{hasStarted ? earnings.toLocaleString() : '0'}
          </span>
          <span className="text-xl text-white/60">
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
                px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                ${location === key
                  ? 'bg-white text-[#222] shadow-lg scale-105'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
                }
              `}
            >
              {loc.name}
            </button>
          ))}
        </div>

        <div className={`text-xs text-white/40 mt-3 ${isRTL ? 'text-right' : ''}`}>
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
      avatar: '#FF385C'
    },
    {
      name: isRTL ? 'דוד מ.' : 'David M.',
      earnings: '₪32,000',
      period: isRTL ? 'בחודש שעבר' : 'last month',
      badge: isRTL ? 'מארח חדש' : 'New Host',
      avatar: '#00A699'
    },
    {
      name: isRTL ? 'מיכל ל.' : 'Michal L.',
      earnings: '₪28,500',
      period: isRTL ? 'בחודש שעבר' : 'last month',
      badge: isRTL ? 'סופרהוסט' : 'Superhost',
      avatar: '#FC642D'
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
      {/* Subtle glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/5 rounded-2xl blur-xl" />

      <div className={`
        relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10
        transform transition-all duration-500
        ${isRTL ? 'text-right' : ''}
      `}>
        <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            style={{ background: `linear-gradient(135deg, ${current.avatar}, ${current.avatar}cc)` }}
          >
            {current.name[0]}
          </div>

          <div className={isRTL ? 'text-right' : ''}>
            <div className="text-white font-semibold">{current.name}</div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-yellow-400 text-xs">★★★★★</span>
              <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/80">
                {current.badge}
              </span>
            </div>
          </div>
        </div>

        <div className={`flex items-baseline gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <span className="text-xl font-bold text-white">{isRTL ? 'הרווחתי' : 'I earned'}</span>
          <span className="text-2xl font-bold text-[#FF385C]">{current.earnings}</span>
          <span className="text-white/60 text-sm">{current.period}</span>
        </div>

        {/* Pagination dots */}
        <div className={`flex gap-1.5 mt-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          {testimonials.map((_, idx) => (
            <div
              key={idx}
              className={`
                h-1 rounded-full transition-all duration-300
                ${idx === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/30'}
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
    { icon: '🛡️', text: isRTL ? 'ביטוח מלא' : 'Full insurance' },
    { icon: '💬', text: isRTL ? 'תמיכה 24/7' : '24/7 support' },
    { icon: '⚡', text: isRTL ? 'תשלום מהיר' : 'Fast payouts' },
  ], [isRTL])

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e]">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF385C]/20 via-transparent to-transparent animate-gradient-shift" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#BD1E59]/20 via-transparent to-transparent animate-gradient-shift-reverse" />

        {/* Floating Orbs */}
        <FloatingOrb size={400} color="#FF385C" delay={0} duration={20} initialX={-10} initialY={-10} />
        <FloatingOrb size={300} color="#BD1E59" delay={2} duration={25} initialX={80} initialY={60} />
        <FloatingOrb size={200} color="#00A699" delay={4} duration={18} initialX={60} initialY={-20} />
        <FloatingOrb size={250} color="#FC642D" delay={1} duration={22} initialX={20} initialY={70} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-noise" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>

          {/* Left Column - Content */}
          <div className={`space-y-8 ${isRTL ? 'lg:col-start-2 text-right' : ''}`}>
            {/* Social Proof Header */}
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <HostAvatarStack />
              <div className="text-white/70 text-sm">
                <span className="text-white font-semibold">2,847</span> {isRTL ? 'מארחים בישראל' : 'hosts in Israel'}
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--font-playfair, serif)' }}
              >
                {isRTL ? (
                  <>
                    <span className="block">הפוך את הנכס שלך</span>
                    <span className="block bg-gradient-to-r from-[#FF385C] to-[#BD1E59] bg-clip-text text-transparent">
                      למקור הכנסה
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">Turn your space into</span>
                    <span className="block bg-gradient-to-r from-[#FF385C] to-[#BD1E59] bg-clip-text text-transparent">
                      your income
                    </span>
                  </>
                )}
              </h2>

              <p className="text-lg md:text-xl text-white/70 max-w-lg leading-relaxed">
                {isRTL
                  ? 'הצטרף לקהילת המארחים המצליחה ביותר בישראל. קבל כלים מתקדמים, תמיכה מלאה, והכנסה קבועה.'
                  : 'Join Israel\'s most successful host community. Get powerful tools, full support, and steady income.'
                }
              </p>
            </div>

            {/* CTA Button */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Link href="/become-a-host" className="group relative">
                {/* Button glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FF385C] to-[#BD1E59] rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

                <button className="relative px-8 py-4 bg-gradient-to-r from-[#FF385C] to-[#BD1E59] text-white font-semibold text-lg rounded-xl shadow-2xl hover:shadow-[#FF385C]/25 transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap">
                  {isRTL ? 'התחל עכשיו - חינם' : 'Get Started - It\'s Free'}
                  <svg
                    className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>

              <Link
                href="/become-a-host#how-it-works"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 text-center"
              >
                {isRTL ? 'איך זה עובד?' : 'How it works'}
              </Link>
            </div>

            {/* Trust Badges */}
            <div className={`flex flex-wrap gap-6 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {trustBadges.map((badge, idx) => (
                <TrustBadge key={idx} icon={badge.icon} text={badge.text} delay={idx * 100} />
              ))}
            </div>
          </div>

          {/* Right Column - Earnings Calculator & Testimonial */}
          <div className={`space-y-6 ${isRTL ? 'lg:col-start-1' : ''}`}>
            <EarningsCalculator isRTL={isRTL} />
            <TestimonialBubble isRTL={isRTL} />
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className={`mt-16 pt-12 border-t border-white/10 ${isRTL ? 'text-right' : ''}`}>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${isRTL ? 'direction-rtl' : ''}`}>
            {[
              { value: '₪2.5M+', label: isRTL ? 'הכנסות מארחים השנה' : 'Host earnings this year' },
              { value: '98%', label: isRTL ? 'שיעור שביעות רצון' : 'Satisfaction rate' },
              { value: '< 24h', label: isRTL ? 'זמן הרשמה ממוצע' : 'Average signup time' },
              { value: '10K+', label: isRTL ? 'הזמנות מוצלחות' : 'Successful bookings' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10%, 15%) scale(1.05);
          }
          50% {
            transform: translate(-5%, 25%) scale(0.95);
          }
          75% {
            transform: translate(15%, 10%) scale(1.02);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            opacity: 0.2;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 0.4;
            transform: translate(5%, 5%) scale(1.1);
          }
        }

        @keyframes gradient-shift-reverse {
          0%, 100% {
            opacity: 0.2;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 0.3;
            transform: translate(-5%, -5%) scale(1.15);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-gradient-shift {
          animation: gradient-shift 15s ease-in-out infinite;
        }

        .animate-gradient-shift-reverse {
          animation: gradient-shift-reverse 18s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
      `}</style>
    </section>
  )
}
