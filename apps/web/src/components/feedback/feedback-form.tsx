'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { X, Star } from 'lucide-react'

const STORAGE_KEY = 'agencyos:feedback:submitted'
const INSTALL_KEY = 'agencyos:first-visit'
const DAYS_BEFORE_PROMPT = 7

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1'

export function FeedbackForm() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    liked: '',
    improved: '',
    missing: '',
    willContinue: null as boolean | null,
    willPay: '',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY) === '1') return

    const firstVisit = localStorage.getItem(INSTALL_KEY)
    if (!firstVisit) {
      localStorage.setItem(INSTALL_KEY, Date.now().toString())
      return
    }

    const daysSince = (Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24)
    if (daysSince >= DAYS_BEFORE_PROMPT) {
      setOpen(true)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      await fetch(`${API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } catch {
      // best-effort
    } finally {
      setSending(false)
      localStorage.setItem(STORAGE_KEY, '1')
      setSubmitted(true)
      setTimeout(() => setOpen(false), 2000)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0d0d0d] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">
              {isAr ? '🎯 رأيك يهمنا' : '🎯 Your Feedback Matters'}
            </h2>
            <p className="mt-0.5 text-xs text-white/40">
              {isAr ? 'دقيقة واحدة تساعدنا كثيراً' : 'One minute helps us a lot'}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, '1')
              setOpen(false)
            }}
            className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Star className="h-10 w-10 fill-amber-400 text-amber-400" />
            <p className="text-sm font-medium">
              {isAr ? 'شكراً جزيلاً! 🙏' : 'Thank you so much! 🙏'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                {isAr ? 'ما الذي أعجبك في النظام؟' : 'What did you like about the system?'}
              </label>
              <textarea
                rows={2}
                value={form.liked}
                onChange={(e) => setForm((p) => ({ ...p, liked: e.target.value }))}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/20 focus:border-purple-400/40 focus:outline-none"
                placeholder={isAr ? 'اكتب هنا...' : 'Write here...'}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                {isAr ? 'ما الذي يحتاج تحسين؟' : 'What needs improvement?'}
              </label>
              <textarea
                rows={2}
                value={form.improved}
                onChange={(e) => setForm((p) => ({ ...p, improved: e.target.value }))}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/20 focus:border-purple-400/40 focus:outline-none"
                placeholder={isAr ? 'اكتب هنا...' : 'Write here...'}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                {isAr ? 'هل ستكمل استخدام النظام؟' : 'Will you continue using the system?'}
              </label>
              <div className="flex gap-2">
                {[
                  { value: true, label: isAr ? 'نعم بالتأكيد' : 'Definitely yes' },
                  { value: false, label: isAr ? 'لا أعتقد' : 'Probably not' },
                ].map(({ value, label }) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, willContinue: value }))}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs transition-colors ${
                      form.willContinue === value
                        ? 'border-purple-400/40 bg-purple-400/10 text-purple-300'
                        : 'border-white/[0.08] text-white/40 hover:text-white/70'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                {isAr ? 'كم ستدفع شهرياً مقابل النظام؟' : 'How much would you pay monthly?'}
              </label>
              <select
                value={form.willPay}
                onChange={(e) => setForm((p) => ({ ...p, willPay: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.08] bg-[#111] px-3 py-2 text-sm text-white focus:border-purple-400/40 focus:outline-none"
              >
                <option value="">{isAr ? 'اختر...' : 'Select...'}</option>
                <option value="free">
                  {isAr ? 'لا شيء — يجب أن يكون مجاناً' : 'Nothing — should be free'}
                </option>
                <option value="low">$10–$30 {isAr ? 'شهرياً' : '/mo'}</option>
                <option value="mid">$30–$80 {isAr ? 'شهرياً' : '/mo'}</option>
                <option value="high">$80–$150 {isAr ? 'شهرياً' : '/mo'}</option>
                <option value="enterprise">$150+ {isAr ? 'شهرياً' : '/mo'}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {sending
                ? isAr
                  ? 'جاري الإرسال...'
                  : 'Sending...'
                : isAr
                  ? 'إرسال الرأي'
                  : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
