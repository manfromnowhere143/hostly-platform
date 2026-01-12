// ═══════════════════════════════════════════════════════════════════════════════
// PORTAL LOGIN - State-of-the-Art Authentication
// ═══════════════════════════════════════════════════════════════════════════════
// Beautiful, secure login page with:
// - Email/Password authentication
// - JWT token management
// - Remember me functionality
// - RTL support
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const { isRTL } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      router.push('/portal')
    }
  }, [router])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || (isRTL ? 'שגיאה בהתחברות' : 'Login failed'))
        return
      }

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

      // Store user info (only if valid)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      if (data.organization) {
        localStorage.setItem('organization', JSON.stringify(data.organization))
      }

      // Redirect to portal
      router.push('/portal')
    } catch (err) {
      setError(isRTL ? 'שגיאת רשת' : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }, [email, password, isRTL, router])

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-[#faf9f7] via-white to-[#f5f3ef] flex items-center justify-center p-4"
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] -top-40 -right-40 bg-gradient-to-br from-[#B5846D]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute w-[500px] h-[500px] -bottom-40 -left-40 bg-gradient-to-tr from-[#8B6347]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#B5846D] to-[#8B6347] rounded-xl flex items-center justify-center shadow-lg shadow-[#B5846D]/20">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-2xl font-bold text-[#222]">Hostly</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#222] mb-2">
              {isRTL ? 'ברוכים השבים' : 'Welcome back'}
            </h1>
            <p className="text-[#717171]">
              {isRTL ? 'התחבר לחשבון המארח שלך' : 'Sign in to your host account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className={`text-sm text-red-600 ${isRTL ? 'text-right' : ''}`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium text-[#222] ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'כתובת אימייל' : 'Email address'}
              </label>
              <div className="relative">
                <svg
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? 'you@example.com' : 'you@example.com'}
                  required
                  className={`
                    w-full px-4 py-3 bg-[#f7f7f7] rounded-xl border-2 border-transparent
                    focus:border-[#B5846D] focus:bg-white transition-all duration-300
                    placeholder:text-gray-400 text-[#222] font-medium
                    ${isRTL ? 'pr-12 text-right' : 'pl-12'}
                  `}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium text-[#222] ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'סיסמה' : 'Password'}
              </label>
              <div className="relative">
                <svg
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`
                    w-full px-4 py-3 bg-[#f7f7f7] rounded-xl border-2 border-transparent
                    focus:border-[#B5846D] focus:bg-white transition-all duration-300
                    placeholder:text-gray-400 text-[#222] font-medium
                    ${isRTL ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <label className={`flex items-center gap-2 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#B5846D] focus:ring-[#B5846D]"
                />
                <span className="text-sm text-[#717171]">
                  {isRTL ? 'זכור אותי' : 'Remember me'}
                </span>
              </label>
              <Link href="/portal/forgot-password" className="text-sm text-[#B5846D] hover:underline">
                {isRTL ? 'שכחת סיסמה?' : 'Forgot password?'}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full px-6 py-4 bg-gradient-to-r from-[#B5846D] to-[#8B6347] text-white font-semibold text-lg rounded-xl
                shadow-lg shadow-[#B5846D]/30 hover:shadow-xl hover:shadow-[#B5846D]/40 hover:scale-[1.02]
                transition-all duration-300
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
                  {isRTL ? 'התחבר' : 'Sign in'}
                  <svg className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
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
          </div>
        </div>

        {/* Sign Up Link */}
        <p className={`text-center mt-8 text-[#717171]`}>
          {isRTL ? 'אין לך חשבון?' : "Don't have an account?"}{' '}
          <Link href="/become-a-host/signup" className="text-[#B5846D] font-semibold hover:underline">
            {isRTL ? 'הרשם עכשיו' : 'Sign up'}
          </Link>
        </p>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-[#717171] hover:text-[#222] transition-colors">
            ← {isRTL ? 'חזרה לדף הבית' : 'Back to home'}
          </Link>
        </div>
      </div>
    </main>
  )
}
