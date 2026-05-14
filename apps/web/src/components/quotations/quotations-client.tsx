'use client'

import { useState } from 'react'
import { Plus, FileText, Send, ArrowRight, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useQuotations, type Quotation } from '@/hooks/use-quotations'
import { cn } from '@/lib/utils'

const STATIC_QUOTATIONS: Quotation[] = [
  {
    id: 'q1',
    companyId: 'co1',
    clientId: 'c1',
    dealId: null,
    number: 'Q-2026-008',
    status: 'ACCEPTED',
    items: [
      {
        description: 'تصوير فيديو رمضان',
        quantity: 1,
        unitPrice: 12_000_000,
        currency: 'IQD',
        total: 12_000_000,
      },
    ],
    subtotal: 12_000_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 12_000_000,
    currency: 'IQD',
    notes: null,
    validUntil: '2026-05-31',
    sentAt: '2026-04-10T00:00:00Z',
    acceptedAt: '2026-04-15T00:00:00Z',
    createdAt: '2026-04-10T00:00:00Z',
    client: { id: 'c1', name: 'مطعم بغداد', nameEn: 'Baghdad Restaurant' },
  },
  {
    id: 'q2',
    companyId: 'co1',
    clientId: 'c2',
    dealId: null,
    number: 'Q-2026-007',
    status: 'SENT',
    items: [
      {
        description: 'هوية بصرية متكاملة',
        quantity: 1,
        unitPrice: 8_500_000,
        currency: 'IQD',
        total: 8_500_000,
      },
    ],
    subtotal: 8_500_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 8_500_000,
    currency: 'IQD',
    notes: null,
    validUntil: '2026-05-20',
    sentAt: '2026-04-20T00:00:00Z',
    acceptedAt: null,
    createdAt: '2026-04-20T00:00:00Z',
    client: { id: 'c2', name: 'شركة الزلال', nameEn: 'Al-Zalal Company' },
  },
  {
    id: 'q3',
    companyId: 'co1',
    clientId: 'c3',
    dealId: null,
    number: 'Q-2026-006',
    status: 'ACCEPTED',
    items: [
      {
        description: 'تصوير فندق كامل',
        quantity: 1,
        unitPrice: 5_000_000,
        currency: 'IQD',
        total: 5_000_000,
      },
    ],
    subtotal: 5_000_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 5_000_000,
    currency: 'IQD',
    notes: null,
    validUntil: '2026-05-10',
    sentAt: '2026-03-25T00:00:00Z',
    acceptedAt: '2026-04-01T00:00:00Z',
    createdAt: '2026-03-25T00:00:00Z',
    client: { id: 'c3', name: 'فندق النعيمي', nameEn: 'Al-Naaimi Hotel' },
  },
  {
    id: 'q4',
    companyId: 'co1',
    clientId: 'c4',
    dealId: null,
    number: 'Q-2026-005',
    status: 'SENT',
    items: [
      {
        description: 'حملة إعلانية كبرى',
        quantity: 1,
        unitPrice: 11_000_000,
        currency: 'IQD',
        total: 11_000_000,
      },
    ],
    subtotal: 11_000_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 11_000_000,
    currency: 'IQD',
    notes: null,
    validUntil: '2026-05-25',
    sentAt: '2026-04-25T00:00:00Z',
    acceptedAt: null,
    createdAt: '2026-04-25T00:00:00Z',
    client: { id: 'c4', name: 'مجمع الشمري', nameEn: 'Al-Shammari Mall' },
  },
  {
    id: 'q5',
    companyId: 'co1',
    clientId: 'c5',
    dealId: null,
    number: 'Q-2026-004',
    status: 'ACCEPTED',
    items: [
      {
        description: 'تسويق رقمي شهري',
        quantity: 3,
        unitPrice: 2_000_000,
        currency: 'IQD',
        total: 6_000_000,
      },
    ],
    subtotal: 6_000_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 6_000_000,
    currency: 'IQD',
    notes: null,
    validUntil: '2026-04-30',
    sentAt: '2026-03-01T00:00:00Z',
    acceptedAt: '2026-03-10T00:00:00Z',
    createdAt: '2026-03-01T00:00:00Z',
    client: { id: 'c5', name: 'عيادات الرافدين', nameEn: 'Rafidain Clinics' },
  },
  {
    id: 'q6',
    companyId: 'co1',
    clientId: 'c1',
    dealId: null,
    number: 'Q-2026-003',
    status: 'DRAFT',
    items: [
      {
        description: 'تصوير منيو جديد',
        quantity: 1,
        unitPrice: 3_500_000,
        currency: 'IQD',
        total: 3_500_000,
      },
    ],
    subtotal: 3_500_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 3_500_000,
    currency: 'IQD',
    notes: null,
    validUntil: null,
    sentAt: null,
    acceptedAt: null,
    createdAt: '2026-05-01T00:00:00Z',
    client: { id: 'c1', name: 'مطعم بغداد', nameEn: 'Baghdad Restaurant' },
  },
  {
    id: 'q7',
    companyId: 'co1',
    clientId: 'c2',
    dealId: null,
    number: 'Q-2026-002',
    status: 'EXPIRED',
    items: [
      {
        description: 'موشن جرافيك',
        quantity: 1,
        unitPrice: 4_200_000,
        currency: 'IQD',
        total: 4_200_000,
      },
    ],
    subtotal: 4_200_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 4_200_000,
    currency: 'IQD',
    notes: null,
    validUntil: '2026-03-31',
    sentAt: '2026-03-01T00:00:00Z',
    acceptedAt: null,
    createdAt: '2026-03-01T00:00:00Z',
    client: { id: 'c2', name: 'شركة الزلال', nameEn: 'Al-Zalal Company' },
  },
  {
    id: 'q8',
    companyId: 'co1',
    clientId: 'c3',
    dealId: null,
    number: 'Q-2026-001',
    status: 'SENT',
    items: [
      {
        description: 'ريلز سوشيال ميديا',
        quantity: 4,
        unitPrice: 1_500_000,
        currency: 'IQD',
        total: 6_000_000,
      },
    ],
    subtotal: 6_000_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 6_000_000,
    currency: 'IQD',
    notes: null,
    validUntil: '2026-05-28',
    sentAt: '2026-05-05T00:00:00Z',
    acceptedAt: null,
    createdAt: '2026-05-05T00:00:00Z',
    client: { id: 'c3', name: 'فندق النعيمي', nameEn: 'Al-Naaimi Hotel' },
  },
]

const STATUS_CFG = {
  ACCEPTED: { ar: 'معتمد', en: 'Accepted', style: 'bg-emerald-400/10 text-emerald-400' },
  SENT: { ar: 'مُرسل', en: 'Sent', style: 'bg-sky-400/10 text-sky-400' },
  DRAFT: { ar: 'مراجعة', en: 'Draft', style: 'bg-white/[0.06] text-white/50' },
  REJECTED: { ar: 'مرفوض', en: 'Rejected', style: 'bg-red-400/10 text-red-400' },
  EXPIRED: { ar: 'منتهي', en: 'Expired', style: 'bg-amber-400/10 text-amber-400' },
} as const

function formatM(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`
}

function fmtDate(iso: string, isAr: boolean) {
  return new Date(iso).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function QuotationsClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [statusFilter, setStatusFilter] = useState('')

  const { data: apiData } = useQuotations(statusFilter ? { status: statusFilter } : undefined)
  const quotations = apiData ?? STATIC_QUOTATIONS

  const filtered = statusFilter ? quotations.filter((q) => q.status === statusFilter) : quotations

  const pendingTotal = quotations
    .filter((q) => q.status === 'SENT')
    .reduce((s, q) => s + q.total, 0)
  const acceptedThisMonth = quotations.filter(
    (q) =>
      q.status === 'ACCEPTED' &&
      q.acceptedAt &&
      new Date(q.acceptedAt).getMonth() === new Date().getMonth(),
  ).length
  const conversionRate = Math.round(
    (quotations.filter((q) => q.status === 'ACCEPTED').length /
      Math.max(quotations.filter((q) => q.status !== 'DRAFT').length, 1)) *
      100,
  )

  const statuses = [
    { v: '', ar: 'الكل', en: 'All' },
    { v: 'ACCEPTED', ar: 'معتمد', en: 'Accepted' },
    { v: 'SENT', ar: 'مُرسل', en: 'Sent' },
    { v: 'DRAFT', ar: 'مراجعة', en: 'Draft' },
    { v: 'EXPIRED', ar: 'منتهي', en: 'Expired' },
  ]

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'عروض الأسعار' : 'Quotations'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {quotations.length} {isAr ? 'عرض' : 'quotations'}
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/20">
          <Plus className="h-3.5 w-3.5" />
          {isAr ? 'عرض جديد' : 'New Quotation'}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {isAr ? 'قيد الانتظار' : 'Pending'}
            </p>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 text-2xl font-bold">{formatM(pendingTotal)}</p>
          <p className="text-muted-foreground mt-1 text-xs">{isAr ? 'دينار عراقي' : 'IQD'}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {isAr ? 'معتمدة هذا الشهر' : 'Accepted This Month'}
            </p>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-bold">{acceptedThisMonth}</p>
          <p className="text-muted-foreground mt-1 text-xs">{isAr ? 'عرض' : 'quotations'}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {isAr ? 'معدل التحويل' : 'Conversion Rate'}
            </p>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-3 text-2xl font-bold">{conversionRate}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-sky-400"
              style={{ width: `${conversionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex w-fit gap-1 overflow-x-auto rounded-lg border border-white/[0.06] p-1">
        {statuses.map((s) => (
          <button
            key={s.v}
            onClick={() => setStatusFilter(s.v)}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors',
              statusFilter === s.v
                ? 'bg-white/[0.08] font-medium text-white'
                : 'text-muted-foreground hover:bg-white/[0.04]',
            )}
          >
            {isAr ? s.ar : s.en}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {[
                { ar: 'الرقم', en: 'Number' },
                { ar: 'العميل', en: 'Client' },
                { ar: 'المبلغ', en: 'Amount', hide: '' },
                { ar: 'الحالة', en: 'Status' },
                { ar: 'الإنشاء', en: 'Created', hide: 'hidden md:table-cell' },
                { ar: 'الانتهاء', en: 'Expires', hide: 'hidden lg:table-cell' },
                { ar: 'إجراء', en: 'Action', end: true },
              ].map((h) => (
                <th
                  key={h.ar}
                  className={cn(
                    'text-muted-foreground px-4 py-3 text-[11px] font-semibold uppercase tracking-wider',
                    h.end ? 'text-end' : 'text-start',
                    h.hide,
                  )}
                >
                  {isAr ? h.ar : h.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((q) => {
              const cfg = STATUS_CFG[q.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.DRAFT
              return (
                <tr key={q.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-sm font-medium text-sky-300">{q.number}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium">
                      {isAr ? q.client.name : (q.client.nameEn ?? q.client.name)}
                    </div>
                    <div className="text-muted-foreground max-w-[160px] truncate text-xs">
                      {q.items[0]?.description}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-sm font-semibold text-sky-300">
                    {formatM(q.total)} {isAr ? 'د.ع' : 'IQD'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                        cfg.style,
                      )}
                    >
                      {isAr ? cfg.ar : cfg.en}
                    </span>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3.5 text-xs md:table-cell">
                    {fmtDate(q.createdAt, isAr)}
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3.5 text-xs lg:table-cell">
                    {q.validUntil ? fmtDate(q.validUntil, isAr) : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title={isAr ? 'عرض PDF' : 'View PDF'}
                        className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>
                      {q.status === 'DRAFT' && (
                        <button
                          title={isAr ? 'إرسال' : 'Send'}
                          className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-sky-400"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {q.status === 'ACCEPTED' && (
                        <button
                          title={isAr ? 'تحويل لفاتورة' : 'Convert to Invoice'}
                          className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-emerald-400"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">
              {isAr ? 'لا يوجد عروض' : 'No quotations'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
