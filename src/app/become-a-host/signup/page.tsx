// ═══════════════════════════════════════════════════════════════════════════════
// HOST SIGNUP - Multi-Step Registration Flow
// ═══════════════════════════════════════════════════════════════════════════════
// Beautiful, animated registration with progressive disclosure.
// Steps: Email/Password → Business Info → Verification
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  organizationName: string
  phone: string
  location: string
  propertyCount: string
  agreedToTerms: boolean
}

type Step = 'account' | 'business' | 'complete'

// ─── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ currentStep, isRTL }: { currentStep: Step; isRTL: boolean }) {
  const steps = ['account', 'business', 'complete'] as const
  const currentIndex = steps.indexOf(currentStep)

  return (
    <div className={`flex items-center justify-center gap-2 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {steps.map((step, idx) => (
        <div key={step} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
              transition-all duration-500
              ${idx <= currentIndex
                ? 'bg-gradient-to-br from-[#B5846D] to-[#8B6347] text-white shadow-lg'
                : 'bg-gray-100 text-gray-400'
              }
            `}
          >
            {idx < currentIndex ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              idx + 1
            )}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-12 h-1 mx-2 rounded-full transition-all duration-500 ${
                idx < currentIndex ? 'bg-[#B5846D]' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Input Component ───────────────────────────────────────────────────────────
function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  isRTL,
  icon,
  ...props
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  isRTL: boolean
  icon?: React.ReactNode
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium text-[#222] ${isRTL ? 'text-right' : ''}`}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}>
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 bg-[#f7f7f7] rounded-xl border-2 transition-all duration-300
            placeholder:text-gray-400 text-[#222] font-medium
            ${icon ? (isRTL ? 'pr-12' : 'pl-12') : ''}
            ${isFocused ? 'border-[#B5846D] bg-white shadow-lg shadow-[#B5846D]/10' : 'border-transparent'}
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          {...props}
        />
      </div>
      {error && (
        <p className={`text-sm text-red-500 ${isRTL ? 'text-right' : ''}`}>{error}</p>
      )}
    </div>
  )
}

// ─── Account Step ──────────────────────────────────────────────────────────────
function AccountStep({
  formData,
  setFormData,
  errors,
  isRTL
}: {
  formData: FormData
  setFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
  isRTL: boolean
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
      <div className={`text-center mb-8 ${isRTL ? 'text-right' : ''}`}>
        <h2 className="text-2xl font-bold text-[#222] mb-2">
          {isRTL ? 'צור את החשבון שלך' : 'Create your account'}
        </h2>
        <p className="text-[#717171]">
          {isRTL ? 'הזן את פרטי ההתחברות שלך' : 'Enter your login credentials'}
        </p>
      </div>

      <Input
        label={isRTL ? 'שם מלא' : 'Full name'}
        value={formData.name}
        onChange={(value) => setFormData({ name: value })}
        placeholder={isRTL ? 'ישראל ישראלי' : 'John Doe'}
        error={errors.name}
        isRTL={isRTL}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      <Input
        label={isRTL ? 'כתובת אימייל' : 'Email address'}
        type="email"
        value={formData.email}
        onChange={(value) => setFormData({ email: value })}
        placeholder="you@example.com"
        error={errors.email}
        isRTL={isRTL}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />

      <Input
        label={isRTL ? 'סיסמה' : 'Password'}
        type="password"
        value={formData.password}
        onChange={(value) => setFormData({ password: value })}
        placeholder="••••••••"
        error={errors.password}
        isRTL={isRTL}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />

      <Input
        label={isRTL ? 'אימות סיסמה' : 'Confirm password'}
        type="password"
        value={formData.confirmPassword}
        onChange={(value) => setFormData({ confirmPassword: value })}
        placeholder="••••••••"
        error={errors.confirmPassword}
        isRTL={isRTL}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
      />

      {/* Divider */}
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-[#717171]">{isRTL ? 'או' : 'or'}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <button className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-[#222] hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {isRTL ? 'המשך עם Google' : 'Continue with Google'}
        </button>

        <button className="w-full px-4 py-3 bg-black rounded-xl font-medium text-white hover:bg-gray-900 transition-all flex items-center justify-center gap-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          {isRTL ? 'המשך עם Apple' : 'Continue with Apple'}
        </button>
      </div>
    </div>
  )
}

// ─── Business Step ─────────────────────────────────────────────────────────────
function BusinessStep({
  formData,
  setFormData,
  errors,
  isRTL
}: {
  formData: FormData
  setFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
  isRTL: boolean
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
      <div className={`text-center mb-8 ${isRTL ? 'text-right' : ''}`}>
        <h2 className="text-2xl font-bold text-[#222] mb-2">
          {isRTL ? 'ספר לנו על העסק שלך' : 'Tell us about your business'}
        </h2>
        <p className="text-[#717171]">
          {isRTL ? 'נתאים את הפלטפורמה לצרכים שלך' : "We'll customize the platform for your needs"}
        </p>
      </div>

      <Input
        label={isRTL ? 'שם העסק/המותג' : 'Business/Brand name'}
        value={formData.organizationName}
        onChange={(value) => setFormData({ organizationName: value })}
        placeholder={isRTL ? 'נכסי לוקס' : 'Luxury Properties'}
        error={errors.organizationName}
        isRTL={isRTL}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />

      <Input
        label={isRTL ? 'מספר טלפון' : 'Phone number'}
        type="tel"
        value={formData.phone}
        onChange={(value) => setFormData({ phone: value })}
        placeholder={isRTL ? '050-123-4567' : '050-123-4567'}
        error={errors.phone}
        isRTL={isRTL}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        }
      />

      <div className="space-y-2">
        <label className={`block text-sm font-medium text-[#222] ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'מיקום הנכסים' : 'Property location'}
        </label>
        <div className="relative">
          <svg className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <select
            value={formData.location}
            onChange={(e) => setFormData({ location: e.target.value })}
            className={`
              w-full px-4 py-3 bg-[#f7f7f7] rounded-xl border-2
              text-[#222] font-medium appearance-none cursor-pointer
              hover:bg-gray-100 focus:border-[#B5846D] focus:bg-white transition-all
              ${isRTL ? 'pr-12' : 'pl-12'}
              ${errors.location ? 'border-red-500 bg-red-50' : 'border-transparent'}
            `}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            <option value="">{isRTL ? 'בחר מיקום' : 'Select location'}</option>
            <option value="eilat">{isRTL ? 'אילת' : 'Eilat'}</option>
            <option value="tel-aviv">{isRTL ? 'תל אביב' : 'Tel Aviv'}</option>
            <option value="jerusalem">{isRTL ? 'ירושלים' : 'Jerusalem'}</option>
            <option value="haifa">{isRTL ? 'חיפה' : 'Haifa'}</option>
            <option value="dead-sea">{isRTL ? 'ים המלח' : 'Dead Sea'}</option>
            <option value="galilee">{isRTL ? 'גליל' : 'Galilee'}</option>
            <option value="other">{isRTL ? 'אחר' : 'Other'}</option>
          </select>
          <svg className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none ${isRTL ? 'left-4' : 'right-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {errors.location && (
          <p className={`text-sm text-red-500 ${isRTL ? 'text-right' : ''}`}>{errors.location}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className={`block text-sm font-medium text-[#222] ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'כמה נכסים יש לך?' : 'How many properties do you have?'}
        </label>
        <div className={`grid grid-cols-4 gap-3 ${isRTL ? 'direction-rtl' : ''}`}>
          {['1', '2-5', '6-10', '10+'].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setFormData({ propertyCount: count })}
              className={`
                py-3 rounded-xl font-medium transition-all duration-300
                ${formData.propertyCount === count
                  ? 'bg-[#B5846D] text-white shadow-lg'
                  : 'bg-[#f7f7f7] text-[#222] hover:bg-gray-200'
                }
              `}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Terms checkbox */}
      <div className="space-y-2">
        <label className={`flex items-start gap-3 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => setFormData({ agreedToTerms: e.target.checked })}
            className={`w-5 h-5 mt-0.5 rounded border-gray-300 text-[#B5846D] focus:ring-[#B5846D] ${errors.agreedToTerms ? 'border-red-500' : ''}`}
          />
          <span className={`text-sm text-[#717171] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? (
              <>
                אני מסכים ל<Link href="/terms" className="text-[#B5846D] hover:underline">תנאי השימוש</Link> ול<Link href="/privacy" className="text-[#B5846D] hover:underline">מדיניות הפרטיות</Link>
              </>
            ) : (
              <>
                I agree to the <Link href="/terms" className="text-[#B5846D] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#B5846D] hover:underline">Privacy Policy</Link>
              </>
            )}
          </span>
        </label>
        {errors.agreedToTerms && (
          <p className={`text-sm text-red-500 ${isRTL ? 'text-right' : ''}`}>{errors.agreedToTerms}</p>
        )}
      </div>
    </div>
  )
}

// ─── Complete Step ─────────────────────────────────────────────────────────────
function CompleteStep({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="text-center py-12 animate-in fade-in zoom-in duration-700">
      {/* Success animation */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <div className="absolute w-32 h-32 bg-green-100 rounded-full animate-ping opacity-20" />
        <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
          <svg className="w-12 h-12 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-[#222] mb-4" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
        {isRTL ? 'ברוך הבא להוסטלי!' : 'Welcome to Hostly!'}
      </h2>

      <p className="text-lg text-[#717171] mb-8 max-w-md mx-auto">
        {isRTL
          ? 'החשבון שלך נוצר בהצלחה. עכשיו בוא נוסיף את הנכס הראשון שלך.'
          : 'Your account has been created successfully. Now let\'s add your first property.'
        }
      </p>

      {/* Quick stats */}
      <div className={`grid grid-cols-3 gap-4 max-w-md mx-auto mb-8 ${isRTL ? 'direction-rtl' : ''}`}>
        <div className="bg-[#f7f7f7] rounded-xl p-4">
          <div className="text-2xl font-bold text-[#B5846D]">₪0</div>
          <div className="text-xs text-[#717171]">{isRTL ? 'עמלות רישום' : 'Listing fees'}</div>
        </div>
        <div className="bg-[#f7f7f7] rounded-xl p-4">
          <div className="text-2xl font-bold text-[#B5846D]">3%</div>
          <div className="text-xs text-[#717171]">{isRTL ? 'עמלת הזמנה' : 'Booking fee'}</div>
        </div>
        <div className="bg-[#f7f7f7] rounded-xl p-4">
          <div className="text-2xl font-bold text-[#B5846D]">24h</div>
          <div className="text-xs text-[#717171]">{isRTL ? 'תשלום' : 'Payout'}</div>
        </div>
      </div>

      <Link href="/portal/onboarding">
        <button className="px-8 py-4 bg-gradient-to-r from-[#B5846D] to-[#8B6347] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          {isRTL ? 'הוסף את הנכס הראשון' : 'Add your first property'}
        </button>
      </Link>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SignupPage() {
  const { isRTL } = useLanguage()
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormDataState] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    organizationName: '',
    phone: '',
    location: '',
    propertyCount: '1',
    agreedToTerms: false,
  })

  const setFormData = useCallback((data: Partial<FormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }))
    // Clear errors for changed fields
    setErrors((prev) => {
      const newErrors = { ...prev }
      Object.keys(data).forEach((key) => delete newErrors[key])
      return newErrors
    })
  }, [])

  const validateStep = useCallback((currentStep: Step): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 'account') {
      if (!formData.name.trim()) {
        newErrors.name = isRTL ? 'שם נדרש' : 'Name is required'
      }
      if (!formData.email.trim()) {
        newErrors.email = isRTL ? 'אימייל נדרש' : 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = isRTL ? 'אימייל לא תקין' : 'Invalid email address'
      }
      if (!formData.password) {
        newErrors.password = isRTL ? 'סיסמה נדרשת' : 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = isRTL ? 'הסיסמה חייבת להכיל לפחות 8 תווים' : 'Password must be at least 8 characters'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = isRTL ? 'הסיסמאות לא תואמות' : 'Passwords do not match'
      }
    }

    if (currentStep === 'business') {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = isRTL ? 'שם העסק נדרש' : 'Business name is required'
      }
      if (!formData.location) {
        newErrors.location = isRTL ? 'מיקום נדרש' : 'Location is required'
      }
      if (!formData.agreedToTerms) {
        newErrors.agreedToTerms = isRTL ? 'יש לאשר את התנאים' : 'You must agree to the terms'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, isRTL])

  const handleNext = useCallback(async () => {
    if (!validateStep(step)) return

    if (step === 'account') {
      setStep('business')
    } else if (step === 'business') {
      setIsLoading(true)
      try {
        // Call registration API
        const response = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            organizationName: formData.organizationName,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.error?.code === 'ALREADY_EXISTS') {
            setErrors({ email: isRTL ? 'אימייל זה כבר רשום' : 'This email is already registered' })
          } else {
            setErrors({ email: data.error?.message || (isRTL ? 'שגיאה בהרשמה' : 'Registration failed') })
          }
          return
        }

        // Store tokens
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
        }

        setStep('complete')
      } catch (error) {
        setErrors({ email: isRTL ? 'שגיאת רשת' : 'Network error' })
      } finally {
        setIsLoading(false)
      }
    }
  }, [step, validateStep, formData, isRTL])

  const handleBack = useCallback(() => {
    if (step === 'business') {
      setStep('account')
    }
  }, [step])

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-[#fafafa] to-white"
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

            <Link href="/become-a-host" className="text-sm text-[#717171] hover:text-[#222] transition-colors">
              {isRTL ? 'חזרה' : 'Back'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="min-h-screen flex items-center justify-center pt-16 pb-12 px-4">
        <div className="w-full max-w-md">
          {step !== 'complete' && <ProgressBar currentStep={step} isRTL={isRTL} />}

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            {step === 'account' && (
              <AccountStep
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                isRTL={isRTL}
              />
            )}

            {step === 'business' && (
              <BusinessStep
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                isRTL={isRTL}
              />
            )}

            {step === 'complete' && <CompleteStep isRTL={isRTL} />}

            {/* Navigation Buttons */}
            {step !== 'complete' && (
              <div className={`flex gap-3 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {step === 'business' && (
                  <button
                    onClick={handleBack}
                    className="flex-1 px-6 py-3 bg-[#f7f7f7] text-[#222] font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    {isRTL ? 'חזרה' : 'Back'}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className={`
                    flex-1 px-6 py-3 bg-gradient-to-r from-[#B5846D] to-[#8B6347] text-white font-semibold rounded-xl
                    hover:shadow-lg hover:scale-[1.02] transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    flex items-center justify-center gap-2
                  `}
                >
                  {isLoading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      {step === 'account' ? (isRTL ? 'המשך' : 'Continue') : (isRTL ? 'צור חשבון' : 'Create account')}
                      <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Login link */}
          {step !== 'complete' && (
            <p className={`text-center mt-6 text-[#717171] ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'כבר יש לך חשבון?' : 'Already have an account?'}{' '}
              <Link href="/portal/login" className="text-[#B5846D] font-medium hover:underline">
                {isRTL ? 'התחבר' : 'Log in'}
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .direction-rtl { direction: rtl; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-right { from { transform: translateX(10px); } to { transform: translateX(0); } }
        @keyframes zoom-in { from { transform: scale(0.95); } to { transform: scale(1); } }
        .animate-in { animation-duration: 500ms; animation-fill-mode: forwards; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-right { animation-name: slide-in-from-right; }
        .zoom-in { animation-name: zoom-in; }
      `}</style>
    </main>
  )
}
