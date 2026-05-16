'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginUser } from '@/lib/auth'
import { useAuthStore } from '@/store/auth.store'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const isAr = locale === 'ar'
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      const from = searchParams.get('from') ?? `/${locale}/dashboard`
      router.replace(from)
    }
  }, [isAuthenticated, locale, router, searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginUser(email, password)
      const from = searchParams.get('from') ?? `/${locale}/dashboard`
      router.replace(from)
    } catch (err) {
      setError(err instanceof Error ? err.message : isAr ? 'حدث خطأ' : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-sm px-4">
      {/* V Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <svg
          viewBox="0 0 100 80"
          width="56"
          height="45"
          className="drop-shadow-[0_0_12px_rgba(150,130,255,0.6)]"
        >
          <path
            d="M10,10 L50,70 L90,10"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
        <div className="text-center">
          <p className="text-lg font-bold tracking-[0.3em] text-white">VISION OS</p>
          <p className="mt-1 text-sm text-white/50">
            {isAr ? 'سجّل دخولك للمتابعة' : 'Sign in to continue'}
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">
              {isAr ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder={isAr ? 'example@company.com' : 'example@company.com'}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 pe-10 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 end-0 flex items-center px-3 text-white/30 hover:text-white/60"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            style={{ boxShadow: '0 0 20px rgba(255,255,255,0.15)' }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAr ? (
              'تسجيل الدخول'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-white/30">
          <a href={`/${locale}/forgot-password`} className="transition hover:text-white/60">
            {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
          </a>
          <a href={`/${locale}/register`} className="transition hover:text-white/60">
            {isAr ? 'ليس لديك حساب؟' : 'No account?'}
          </a>
        </div>
      </div>
    </div>
  )
}
