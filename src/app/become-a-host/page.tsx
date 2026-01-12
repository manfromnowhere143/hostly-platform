// ═══════════════════════════════════════════════════════════════════════════════
// BECOME A HOST - Landing Page
// ═══════════════════════════════════════════════════════════════════════════════
// World-class onboarding landing page with elegant, sophisticated design.
// Features: Hero with earnings calc, How it Works, Success Stories, Benefits, FAQ
// Color Palette: Warm champagne (#B5846D), Deep navy (#2C3E50), Gold (#C9A86C)
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Animated Counter Hook ─────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
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
  }, [target, duration, isVisible])

  return { count, ref }
}

// ─── Floating Shapes Background ────────────────────────────────────────────────
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className="absolute w-[600px] h-[600px] -top-40 -left-40 bg-gradient-to-br from-[#B5846D]/30 to-transparent rounded-full blur-3xl animate-float-slow" />
      <div className="absolute w-[500px] h-[500px] top-1/2 -right-40 bg-gradient-to-bl from-[#8B6347]/20 to-transparent rounded-full blur-3xl animate-float-slow-reverse" />
      <div className="absolute w-[400px] h-[400px] bottom-20 left-1/4 bg-gradient-to-tr from-[#00A699]/20 to-transparent rounded-full blur-3xl animate-float-medium" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

// ─── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection({ isRTL, t }: { isRTL: boolean; t: (key: string) => string }) {
  const [earnings, setEarnings] = useState(8500)

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fafafa] via-white to-[#f0f0f0]">
        <FloatingShapes />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
          {/* Content */}
          <div className={`space-y-8 ${isRTL ? 'lg:col-start-2 text-right' : ''}`}>
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-[#B5846D]/10 rounded-full ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="w-2 h-2 bg-[#B5846D] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-[#B5846D]">
                {isRTL ? '2,847 מארחים חדשים החודש' : '2,847 new hosts this month'}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#222] leading-[1.1]"
              style={{ fontFamily: 'var(--font-playfair, serif)' }}
            >
              {isRTL ? (
                <>
                  <span className="block">הפוך את הנכס</span>
                  <span className="block">שלך ל</span>
                  <span className="block bg-gradient-to-r from-[#B5846D] to-[#8B6347] bg-clip-text text-transparent">
                    מקור הכנסה
                  </span>
                </>
              ) : (
                <>
                  <span className="block">Turn your</span>
                  <span className="block">property into</span>
                  <span className="block bg-gradient-to-r from-[#B5846D] to-[#8B6347] bg-clip-text text-transparent">
                    income
                  </span>
                </>
              )}
            </h1>

            <p className="text-xl text-[#717171] max-w-lg leading-relaxed">
              {isRTL
                ? 'הצטרף לאלפי מארחים שמרוויחים הכנסה נוספת על ידי השכרת הנכס שלהם. קל, בטוח, ורווחי.'
                : 'Join thousands of hosts earning extra income by renting their space. Simple, secure, and profitable.'
              }
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Link href="/become-a-host/signup" className="group">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#B5846D] to-[#8B6347] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#B5846D]/30 hover:shadow-xl hover:shadow-[#B5846D]/40 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  {isRTL ? 'התחל עכשיו' : 'Get Started'}
                  <svg className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>

              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-white text-[#222] font-semibold text-lg rounded-xl border-2 border-[#222] hover:bg-[#222] hover:text-white transition-all duration-300"
              >
                {isRTL ? 'איך זה עובד?' : 'How it works'}
              </button>
            </div>

            {/* Trust indicators */}
            <div className={`flex items-center gap-8 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-[#717171]">{isRTL ? 'ללא עמלות' : 'No listing fees'}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-[#717171]">{isRTL ? 'ביטוח מלא' : 'Full insurance'}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-[#717171]">{isRTL ? 'תמיכה 24/7' : '24/7 support'}</span>
              </div>
            </div>
          </div>

          {/* Earnings Calculator Card */}
          <div className={`relative ${isRTL ? 'lg:col-start-1' : ''}`}>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#B5846D]/20 via-[#8B6347]/20 to-[#B5846D]/20 rounded-3xl blur-2xl opacity-60" />

            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className={`text-center ${isRTL ? 'text-right' : ''}`}>
                <p className="text-[#717171] mb-2">
                  {isRTL ? 'הנכס שלך יכול להרוויח עד' : 'Your property could earn up to'}
                </p>
                <div className="text-6xl md:text-7xl font-bold text-[#222] mb-2 tabular-nums">
                  ₪{earnings.toLocaleString()}
                </div>
                <p className="text-[#717171]">
                  {isRTL ? 'לחודש באילת' : 'per month in Eilat'}
                </p>
              </div>

              {/* Location selector */}
              <div className="mt-8 space-y-4">
                <label className={`block text-sm font-medium text-[#222] ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'איפה הנכס שלך?' : "Where's your property?"}
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-[#f7f7f7] rounded-xl border-0 text-[#222] font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#B5846D] transition-all"
                    onChange={(e) => {
                      const values: Record<string, number> = {
                        eilat: 8500,
                        'tel-aviv': 12000,
                        jerusalem: 9500,
                        haifa: 7000,
                        other: 6500
                      }
                      setEarnings(values[e.target.value] || 8500)
                    }}
                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                  >
                    <option value="eilat">{isRTL ? 'אילת' : 'Eilat'}</option>
                    <option value="tel-aviv">{isRTL ? 'תל אביב' : 'Tel Aviv'}</option>
                    <option value="jerusalem">{isRTL ? 'ירושלים' : 'Jerusalem'}</option>
                    <option value="haifa">{isRTL ? 'חיפה' : 'Haifa'}</option>
                    <option value="other">{isRTL ? 'אחר' : 'Other'}</option>
                  </select>
                  <svg className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#717171] pointer-events-none ${isRTL ? 'left-4' : 'right-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <Link href="/become-a-host/signup">
                <button className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-[#B5846D] to-[#8B6347] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  {isRTL ? 'התחל להרוויח' : 'Start earning'}
                </button>
              </Link>

              <p className={`text-xs text-[#717171] mt-4 ${isRTL ? 'text-right' : 'text-center'}`}>
                {isRTL ? '*ההערכה מבוססת על נתוני השוק. ההכנסה בפועל תלויה במיקום, בעונה ובתעריפים.' : '*Estimate based on market data. Actual earnings depend on location, season, and rates.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-[#717171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}

// ─── How It Works Section ──────────────────────────────────────────────────────
function HowItWorksSection({ isRTL }: { isRTL: boolean }) {
  const steps = useMemo(() => [
    {
      number: '01',
      icon: '🏠',
      title: isRTL ? 'הוסף את הנכס שלך' : 'List your space',
      description: isRTL
        ? 'הוסף תמונות, תיאור ופרטי הנכס. האשף שלנו ידריך אותך צעד אחר צעד.'
        : 'Add photos, description, and property details. Our wizard guides you step by step.',
      color: '#B5846D'
    },
    {
      number: '02',
      icon: '📅',
      title: isRTL ? 'קבע תעריפים וזמינות' : 'Set rates & availability',
      description: isRTL
        ? 'בחר את התעריפים שלך, הגדר זמינות ובחר את כללי הבית.'
        : 'Choose your rates, set availability, and select your house rules.',
      color: '#00A699'
    },
    {
      number: '03',
      icon: '💰',
      title: isRTL ? 'התחל להרוויח' : 'Start earning',
      description: isRTL
        ? 'קבל הזמנות, ארח אורחים וצפה בהכנסות שלך גדלות.'
        : 'Receive bookings, host guests, and watch your income grow.',
      color: '#FC642D'
    }
  ], [isRTL])

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isRTL ? 'text-right' : ''}`}>
          <span className="inline-block px-4 py-2 bg-[#f7f7f7] rounded-full text-sm font-medium text-[#717171] mb-4">
            {isRTL ? 'תהליך פשוט' : 'Simple process'}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#222] mb-4" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            {isRTL ? 'איך זה עובד?' : 'How it works'}
          </h2>
          <p className="text-xl text-[#717171] max-w-2xl mx-auto">
            {isRTL
              ? 'בשלושה צעדים פשוטים תהפוך את הנכס שלך למקור הכנסה'
              : 'In three simple steps, turn your property into an income source'
            }
          </p>
        </div>

        {/* Steps */}
        <div className={`grid md:grid-cols-3 gap-8 lg:gap-12 ${isRTL ? 'direction-rtl' : ''}`}>
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative group"
            >
              {/* Connector line (hidden on mobile) */}
              {idx < steps.length - 1 && (
                <div className={`hidden md:block absolute top-12 h-0.5 bg-gradient-to-r from-gray-200 to-gray-100 ${isRTL ? 'right-full mr-4 left-0 ml-4' : 'left-full ml-4 right-0 mr-4'}`} style={{ width: 'calc(100% - 3rem)' }} />
              )}

              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                {/* Step number */}
                <div
                  className="absolute -top-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ background: step.color, [isRTL ? 'right' : 'left']: '2rem' }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-5xl mb-6 mt-4">{step.icon}</div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#222] mb-3">{step.title}</h3>
                <p className="text-[#717171] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/become-a-host/signup">
            <button className="px-8 py-4 bg-[#222] text-white font-semibold text-lg rounded-xl hover:bg-[#000] transition-all duration-300">
              {isRTL ? 'התחל עכשיו' : 'Get started now'}
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Success Stories Section ───────────────────────────────────────────────────
function SuccessStoriesSection({ isRTL }: { isRTL: boolean }) {
  const [activeStory, setActiveStory] = useState(0)

  const stories = useMemo(() => [
    {
      name: isRTL ? 'שרה כהן' : 'Sarah Cohen',
      location: isRTL ? 'אילת' : 'Eilat',
      earnings: '₪45,000',
      period: isRTL ? 'לחודש' : '/month',
      quote: isRTL
        ? '"הצטרפתי להוסטלי לפני שנה והכנסתי יותר מ-500,000 ש"ח. הפלטפורמה קלה לשימוש והתמיכה מדהימה."'
        : '"I joined Hostly a year ago and made over ₪500,000. The platform is easy to use and the support is amazing."',
      badge: 'Superhost',
      avatar: '#B5846D',
      properties: 3
    },
    {
      name: isRTL ? 'דוד מזרחי' : 'David Mizrachi',
      location: isRTL ? 'תל אביב' : 'Tel Aviv',
      earnings: '₪32,000',
      period: isRTL ? 'לחודש' : '/month',
      quote: isRTL
        ? '"התחלתי עם דירה אחת ועכשיו יש לי שלוש. הכלים לניהול מחירים עזרו לי למקסם את ההכנסות."'
        : '"I started with one apartment and now have three. The pricing tools helped me maximize income."',
      badge: 'Top Earner',
      avatar: '#00A699',
      properties: 3
    },
    {
      name: isRTL ? 'מיכל לוי' : 'Michal Levy',
      location: isRTL ? 'ירושלים' : 'Jerusalem',
      earnings: '₪28,500',
      period: isRTL ? 'לחודש' : '/month',
      quote: isRTL
        ? '"אני מארחת מהבית וזה משתלב מצוין עם העבודה שלי. ההכנסה הנוספת שינתה לי את החיים."'
        : '"I host from home and it fits perfectly with my work. The extra income has been life-changing."',
      badge: 'New Host',
      avatar: '#FC642D',
      properties: 1
    }
  ], [isRTL])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % stories.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [stories.length])

  const current = stories[activeStory]

  return (
    <section className="py-24 bg-[#f7f7f7]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isRTL ? 'text-right' : ''}`}>
          <span className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium text-[#717171] mb-4">
            {isRTL ? 'סיפורי הצלחה' : 'Success stories'}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#222] mb-4" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            {isRTL ? 'מארחים כמוך' : 'Hosts like you'}
          </h2>
        </div>

        {/* Story Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={`grid md:grid-cols-2 ${isRTL ? 'md:grid-flow-dense' : ''}`}>
              {/* Content */}
              <div className={`p-8 md:p-12 ${isRTL ? 'md:col-start-2 text-right' : ''}`}>
                <div className={`flex items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${current.avatar}, ${current.avatar}cc)` }}
                  >
                    {current.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#222]">{current.name}</h3>
                    <p className="text-[#717171]">{current.location} • {current.properties} {isRTL ? 'נכסים' : 'properties'}</p>
                  </div>
                </div>

                <blockquote className="text-lg text-[#222] mb-6 leading-relaxed">
                  {current.quote}
                </blockquote>

                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <div className="text-3xl font-bold text-[#B5846D]">
                      {current.earnings}
                      <span className="text-lg text-[#717171] font-normal">{current.period}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#B5846D]/10 text-[#B5846D] text-sm font-medium rounded-full">
                    {current.badge}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className={`bg-gradient-to-br from-[#B5846D] to-[#8B6347] p-8 md:p-12 text-white ${isRTL ? 'md:col-start-1' : ''}`}>
                <div className="h-full flex flex-col justify-center space-y-8">
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-5xl font-bold mb-1">₪500K+</div>
                    <div className="text-white/80">{isRTL ? 'הכנסה כוללת' : 'Total earnings'}</div>
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-5xl font-bold mb-1">98%</div>
                    <div className="text-white/80">{isRTL ? 'שיעור תפוסה' : 'Occupancy rate'}</div>
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-5xl font-bold mb-1">4.97</div>
                    <div className="text-white/80">{isRTL ? 'דירוג ממוצע' : 'Average rating'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Story navigation */}
          <div className={`flex justify-center gap-2 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {stories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStory(idx)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${idx === activeStory ? 'w-8 bg-[#B5846D]' : 'w-2 bg-gray-300 hover:bg-gray-400'}
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Benefits Section ──────────────────────────────────────────────────────────
function BenefitsSection({ isRTL }: { isRTL: boolean }) {
  const benefits = useMemo(() => [
    {
      icon: '💰',
      title: isRTL ? 'הכנסה גבוהה' : 'High earnings',
      description: isRTL ? 'הרוויח עד 30% יותר מפלטפורמות אחרות עם הכלים החכמים שלנו' : 'Earn up to 30% more than other platforms with our smart tools'
    },
    {
      icon: '🛡️',
      title: isRTL ? 'ביטוח מלא' : 'Full protection',
      description: isRTL ? 'כיסוי עד ₪3,000,000 לנזקי רכוש ואחריות צד שלישי' : 'Up to ₪3,000,000 coverage for property damage and liability'
    },
    {
      icon: '📊',
      title: isRTL ? 'ניתוח מתקדם' : 'Advanced analytics',
      description: isRTL ? 'קבל תובנות מעמיקות על הביצועים שלך ואופטימיזציה של מחירים' : 'Get deep insights into your performance and optimize pricing'
    },
    {
      icon: '🔗',
      title: isRTL ? 'סנכרון ערוצים' : 'Channel sync',
      description: isRTL ? 'סנכרון אוטומטי עם Airbnb, Booking.com ו-VRBO' : 'Auto-sync with Airbnb, Booking.com, and VRBO'
    },
    {
      icon: '💳',
      title: isRTL ? 'תשלום מהיר' : 'Fast payouts',
      description: isRTL ? 'קבל את הכסף שלך תוך 24 שעות מהצ\'ק-אין' : 'Get your money within 24 hours of check-in'
    },
    {
      icon: '🎯',
      title: isRTL ? 'אתר מותאם אישית' : 'Custom website',
      description: isRTL ? 'קבל אתר הזמנות ישירות משלך בחינם' : 'Get your own direct booking website for free'
    }
  ], [isRTL])

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isRTL ? 'text-right' : ''}`}>
          <span className="inline-block px-4 py-2 bg-[#f7f7f7] rounded-full text-sm font-medium text-[#717171] mb-4">
            {isRTL ? 'למה הוסטלי?' : 'Why Hostly?'}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#222] mb-4" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            {isRTL ? 'הכלים הכי טובים בשוק' : 'Best-in-class tools'}
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${isRTL ? 'direction-rtl' : ''}`}>
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="group p-6 bg-[#f7f7f7] rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{benefit.icon}</div>
              <h3 className="text-lg font-bold text-[#222] mb-2">{benefit.title}</h3>
              <p className="text-[#717171]">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ Section ───────────────────────────────────────────────────────────────
function FAQSection({ isRTL }: { isRTL: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = useMemo(() => [
    {
      question: isRTL ? 'כמה עולה להירשם?' : 'How much does it cost to sign up?',
      answer: isRTL
        ? 'ההרשמה חינמית לחלוטין! אנחנו גובים עמלה רק כשאתה מקבל הזמנה - 3% מכל הזמנה, הכי נמוך בשוק.'
        : 'Signing up is completely free! We only charge a commission when you receive a booking - 3% per booking, the lowest in the market.'
    },
    {
      question: isRTL ? 'האם אני צריך להיות בעל הנכס?' : 'Do I need to own the property?',
      answer: isRTL
        ? 'לא בהכרח. אתה יכול להיות בעל הנכס, שוכר עם אישור להשכרת משנה, או מנהל נכסים.'
        : 'Not necessarily. You can be the property owner, a tenant with permission to sublet, or a property manager.'
    },
    {
      question: isRTL ? 'איך הביטוח עובד?' : 'How does the insurance work?',
      answer: isRTL
        ? 'כל הזמנה מכוסה אוטומטית בביטוח עד ₪3,000,000 הכולל נזקי רכוש, גניבה ואחריות צד שלישי.'
        : 'Every booking is automatically covered by insurance up to ₪3,000,000, including property damage, theft, and third-party liability.'
    },
    {
      question: isRTL ? 'מתי אני מקבל תשלום?' : 'When do I get paid?',
      answer: isRTL
        ? 'התשלום מועבר לחשבונך תוך 24 שעות מרגע הצ\'ק-אין של האורח. ללא עיכובים.'
        : 'Payment is transferred to your account within 24 hours of the guest\'s check-in. No delays.'
    },
    {
      question: isRTL ? 'איך אני מנהל את הלוח שנה?' : 'How do I manage the calendar?',
      answer: isRTL
        ? 'הפלטפורמה שלנו מסנכרנת אוטומטית עם Airbnb, Booking.com ו-VRBO. לא צריך לעדכן ידנית.'
        : 'Our platform auto-syncs with Airbnb, Booking.com, and VRBO. No manual updates needed.'
    }
  ], [isRTL])

  return (
    <section className="py-24 bg-[#f7f7f7]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isRTL ? 'text-right' : ''}`}>
          <span className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium text-[#717171] mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#222] mb-4" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            {isRTL ? 'שאלות נפוצות' : 'Common questions'}
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className={`w-full p-6 flex items-center justify-between gap-4 hover:bg-[#fafafa] transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
              >
                <span className="text-lg font-semibold text-[#222]">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-[#717171] transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className={`px-6 pb-6 text-[#717171] leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA Section ─────────────────────────────────────────────────────────
function FinalCTASection({ isRTL }: { isRTL: boolean }) {
  return (
    <section className="py-24 bg-gradient-to-br from-[#B5846D] to-[#8B6347] text-white relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-white rounded-full" />
        <div className="absolute w-64 h-64 -bottom-32 -right-32 bg-white rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center max-w-3xl mx-auto ${isRTL ? 'text-right' : ''}`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            {isRTL ? 'מוכן להתחיל להרוויח?' : 'Ready to start earning?'}
          </h2>
          <p className="text-xl text-white/80 mb-10">
            {isRTL
              ? 'הצטרף לאלפי מארחים מצליחים והפוך את הנכס שלך למקור הכנסה יציב'
              : 'Join thousands of successful hosts and turn your property into steady income'
            }
          </p>

          <Link href="/become-a-host/signup">
            <button className="px-10 py-5 bg-white text-[#B5846D] font-bold text-xl rounded-xl shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300">
              {isRTL ? 'התחל עכשיו - חינם' : 'Get Started - Free'}
            </button>
          </Link>

          <p className="text-sm text-white/60 mt-6">
            {isRTL ? 'אין צורך בכרטיס אשראי • הגדרה בפחות מ-10 דקות' : 'No credit card required • Setup in under 10 minutes'}
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export default function BecomeHostPage() {
  const { t, isRTL } = useLanguage()

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-white"
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#B5846D] to-[#8B6347] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-xl text-[#222]">Hostly</span>
            </Link>

            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link href="/become-a-host/signup" className="hidden sm:block px-4 py-2 text-[#222] font-medium hover:bg-[#f7f7f7] rounded-lg transition-colors">
                {isRTL ? 'התחבר' : 'Log in'}
              </Link>
              <Link href="/become-a-host/signup">
                <button className="px-4 py-2 bg-gradient-to-r from-[#B5846D] to-[#8B6347] text-white font-medium rounded-lg hover:shadow-lg transition-all">
                  {isRTL ? 'הרשמה' : 'Sign up'}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="pt-16">
        <HeroSection isRTL={isRTL} t={t} />
        <HowItWorksSection isRTL={isRTL} />
        <SuccessStoriesSection isRTL={isRTL} />
        <BenefitsSection isRTL={isRTL} />
        <FAQSection isRTL={isRTL} />
        <FinalCTASection isRTL={isRTL} />
      </div>

      {/* Footer */}
      <footer className="py-8 bg-[#222] text-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-6 h-6 bg-gradient-to-br from-[#B5846D] to-[#8B6347] rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">H</span>
              </div>
              <span className="font-semibold text-white">Hostly</span>
            </div>
            <p className="text-sm">© 2026 Hostly. {isRTL ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 30px) scale(1.1); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -20px) scale(1.05); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.08); }
        }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-slow-reverse { animation: float-slow-reverse 25s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }
        .direction-rtl { direction: rtl; }
      `}</style>
    </main>
  )
}
