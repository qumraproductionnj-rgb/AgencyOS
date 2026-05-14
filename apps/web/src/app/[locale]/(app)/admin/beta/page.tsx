'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Send, Users, CheckCircle, Clock, XCircle } from 'lucide-react'

interface BetaInvite {
  id: string
  email: string
  companyName: string
  type: string
  status: string
  createdAt: string
  expiresAt: string
  acceptedAt: string | null
}

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1'

export default function AdminBetaPage() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const [invites, setInvites] = useState<BetaInvite[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  const [form, setForm] = useState({ email: '', companyName: '', type: 'agency', notes: '' })
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function fetchInvites() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/beta/invites`)
      const data = await res.json()
      setInvites(Array.isArray(data) ? data : [])
      setFetched(true)
    } finally {
      setLoading(false)
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setMsg(null)
    try {
      const res = await fetch(`${API}/beta/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setMsg({ ok: true, text: isAr ? 'تم إرسال الدعوة بنجاح' : 'Invite sent successfully' })
        setForm({ email: '', companyName: '', type: 'agency', notes: '' })
        if (fetched) fetchInvites()
      } else {
        const err = await res.json()
        setMsg({ ok: false, text: err.message ?? (isAr ? 'فشل الإرسال' : 'Failed to send') })
      }
    } finally {
      setSending(false)
    }
  }

  const statusIcon = (status: string) => {
    if (status === 'accepted') return <CheckCircle className="h-4 w-4 text-emerald-400" />
    if (status === 'expired') return <XCircle className="h-4 w-4 text-red-400" />
    return <Clock className="h-4 w-4 text-amber-400" />
  }

  const statusLabel = (status: string) => {
    if (status === 'accepted') return isAr ? 'مقبولة' : 'Accepted'
    if (status === 'expired') return isAr ? 'منتهية' : 'Expired'
    return isAr ? 'مرسلة' : 'Sent'
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-purple-400" />
        <h1 className="text-lg font-bold">{isAr ? 'إدارة Beta' : 'Beta Management'}</h1>
      </div>

      {/* Send invite form */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold text-white/70">
          {isAr ? 'إرسال دعوة جديدة' : 'Send New Invite'}
        </h2>
        <form onSubmit={sendInvite} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            type="email"
            placeholder={isAr ? 'البريد الإلكتروني' : 'Email'}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-purple-400/40 focus:outline-none"
          />
          <input
            required
            placeholder={isAr ? 'اسم الشركة' : 'Company Name'}
            value={form.companyName}
            onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-purple-400/40 focus:outline-none"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            className="rounded-lg border border-white/[0.08] bg-[#111] px-3 py-2 text-sm text-white focus:border-purple-400/40 focus:outline-none"
          >
            <option value="agency">{isAr ? 'وكالة' : 'Agency'}</option>
            <option value="production">{isAr ? 'إنتاج' : 'Production'}</option>
            <option value="photography">{isAr ? 'تصوير' : 'Photography'}</option>
            <option value="social-media">{isAr ? 'سوشال ميديا' : 'Social Media'}</option>
          </select>
          <input
            placeholder={isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-purple-400/40 focus:outline-none"
          />
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 rounded-lg bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-300 transition-colors hover:bg-purple-500/30 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? (isAr ? 'جاري الإرسال...' : 'Sending...') : isAr ? 'إرسال' : 'Send'}
            </button>
            {msg && (
              <span className={`text-sm ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                {msg.text}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Invites list */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/70">
            {isAr ? 'الدعوات المرسلة' : 'Sent Invites'}
          </h2>
          <button
            onClick={fetchInvites}
            disabled={loading}
            className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
          >
            {loading ? '...' : isAr ? 'تحميل' : 'Load'}
          </button>
        </div>

        {!fetched ? (
          <p className="py-4 text-center text-sm text-white/30">
            {isAr ? 'انقر تحميل لعرض الدعوات' : 'Click Load to view invites'}
          </p>
        ) : invites.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/30">
            {isAr ? 'لا توجد دعوات بعد' : 'No invites yet'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-white/40">
                  <th className="pb-2 text-start font-medium">{isAr ? 'البريد' : 'Email'}</th>
                  <th className="pb-2 text-start font-medium">{isAr ? 'الشركة' : 'Company'}</th>
                  <th className="pb-2 text-start font-medium">{isAr ? 'النوع' : 'Type'}</th>
                  <th className="pb-2 text-start font-medium">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="pb-2 text-start font-medium">{isAr ? 'تاريخ الإرسال' : 'Sent'}</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/[0.04] text-white/70">
                    <td className="py-2">{inv.email}</td>
                    <td className="py-2">{inv.companyName}</td>
                    <td className="py-2 capitalize">{inv.type}</td>
                    <td className="py-2">
                      <span className="flex items-center gap-1.5">
                        {statusIcon(inv.status)}
                        {statusLabel(inv.status)}
                      </span>
                    </td>
                    <td className="py-2">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
