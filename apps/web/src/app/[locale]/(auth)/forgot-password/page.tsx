'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const api = process.env['NEXT_PUBLIC_API_URL'] ?? ''
      const res = await fetch(`${api}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Error')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : isAr ? 'حدث خطأ' : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-sm px-4">
      <div className="mb-8 text-center">
        <p className="text-lg font-bold tracking-[0.3em] text-white">VISION OS</p>
        <p className="mt-1 text-sm text-white/50">
          {isAr ? 'استعادة كلمة المرور' : 'Reset your password'}
        </p>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
        {sent ? (
          <p className="text-center text-sm text-white/70">
            {isAr
              ? 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني'
              : 'Reset link sent to your email'}
          </p>
        ) : (
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
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isAr ? 'إرسال' : 'Send'}
            </button>
          </form>
        )}
        <div className="mt-4 text-center text-xs text-white/30">
          <a href={`/${locale}/login`} className="transition hover:text-white/60">
            {isAr ? '← العودة لتسجيل الدخول' : '← Back to login'}
          </a>
        </div>
      </div>
    </div>
  )
}
