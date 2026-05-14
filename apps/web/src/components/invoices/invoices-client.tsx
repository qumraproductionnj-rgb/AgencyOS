'use client'

import { useState } from 'react'
import { Plus, Eye, Bell, FileCheck, AlertTriangle, Clock } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useInvoices, type Invoice } from '@/hooks/use-invoices'
import { cn } from '@/lib/utils'

const STATIC_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    companyId: 'co1',
    clientId: 'c1',
    number: 'INV-2026-145',
    status: 'PAID',
    type: 'STANDARD',
    items: [
      {
        description: 'حملة رمضان',
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
    paidAmount: 8_500_000,
    balanceDue: 0,
    currency: 'IQD',
    dueDate: '2026-04-30',
    notes: null,
    pdfUrl: null,
    createdAt: '2026-04-01T00:00:00Z',
    client: { id: 'c1', name: 'مطعم بغداد', nameEn: 'Baghdad Restaurant' },
    payments: [
      {
        id: 'p1',
        amount: 8_500_000,
        currency: 'IQD',
        method: 'CASH',
        referenceNo: null,
        paidAt: '2026-04-28T00:00:00Z',
        notes: null,
        createdAt: '2026-04-28T00:00:00Z',
      },
    ],
  },
  {
    id: 'inv2',
    companyId: 'co1',
    clientId: 'c2',
    number: 'INV-2026-144',
    status: 'SENT',
    type: 'STANDARD',
    items: [
      {
        description: 'هوية الزلال — دفعة أولى',
        quantity: 1,
        unitPrice: 12_200_000,
        currency: 'IQD',
        total: 12_200_000,
      },
    ],
    subtotal: 12_200_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 12_200_000,
    paidAmount: 0,
    balanceDue: 12_200_000,
    currency: 'IQD',
    dueDate: '2026-05-20',
    notes: null,
    pdfUrl: null,
    createdAt: '2026-04-15T00:00:00Z',
    client: { id: 'c2', name: 'شركة الزلال', nameEn: 'Al-Zalal Company' },
    payments: [],
  },
  {
    id: 'inv3',
    companyId: 'co1',
    clientId: 'c3',
    number: 'INV-2026-141',
    status: 'OVERDUE',
    type: 'STANDARD',
    items: [
      {
        description: 'تصوير الفندق',
        quantity: 1,
        unitPrice: 3_800_000,
        currency: 'IQD',
        total: 3_800_000,
      },
    ],
    subtotal: 3_800_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 3_800_000,
    paidAmount: 0,
    balanceDue: 3_800_000,
    currency: 'IQD',
    dueDate: '2026-04-30',
    notes: null,
    pdfUrl: null,
    createdAt: '2026-03-28T00:00:00Z',
    client: { id: 'c3', name: 'فندق النعيمي', nameEn: 'Al-Naaimi Hotel' },
    payments: [],
  },
  {
    id: 'inv4',
    companyId: 'co1',
    clientId: 'c4',
    number: 'INV-2026-140',
    status: 'PARTIALLY_PAID',
    type: 'STANDARD',
    items: [
      {
        description: 'الشمري Mall — دفعة أولى',
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
    paidAmount: 2_500_000,
    balanceDue: 2_500_000,
    currency: 'IQD',
    dueDate: '2026-05-15',
    notes: null,
    pdfUrl: null,
    createdAt: '2026-04-20T00:00:00Z',
    client: { id: 'c4', name: 'مجمع الشمري', nameEn: 'Al-Shammari Mall' },
    payments: [
      {
        id: 'p2',
        amount: 2_500_000,
        currency: 'IQD',
        method: 'BANK_TRANSFER',
        referenceNo: 'FIB-20260501',
        paidAt: '2026-05-01T00:00:00Z',
        notes: null,
        createdAt: '2026-05-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'inv5',
    companyId: 'co1',
    clientId: 'c5',
    number: 'INV-2026-138',
    status: 'PAID',
    type: 'STANDARD',
    items: [
      {
        description: 'تسويق الرافدين',
        quantity: 1,
        unitPrice: 6_000_000,
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
    paidAmount: 6_000_000,
    balanceDue: 0,
    currency: 'IQD',
    dueDate: '2026-03-31',
    notes: null,
    pdfUrl: null,
    createdAt: '2026-03-01T00:00:00Z',
    client: { id: 'c5', name: 'عيادات الرافدين', nameEn: 'Rafidain Clinics' },
    payments: [
      {
        id: 'p3',
        amount: 6_000_000,
        currency: 'IQD',
        method: 'CASH',
        referenceNo: null,
        paidAt: '2026-03-28T00:00:00Z',
        notes: null,
        createdAt: '2026-03-28T00:00:00Z',
      },
    ],
  },
  {
    id: 'inv6',
    companyId: 'co1',
    clientId: 'c1',
    number: 'INV-2026-135',
    status: 'PAID',
    type: 'STANDARD',
    items: [
      {
        description: 'تصوير مارس',
        quantity: 1,
        unitPrice: 4_500_000,
        currency: 'IQD',
        total: 4_500_000,
      },
    ],
    subtotal: 4_500_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 4_500_000,
    paidAmount: 4_500_000,
    balanceDue: 0,
    currency: 'IQD',
    dueDate: '2026-03-15',
    notes: null,
    pdfUrl: null,
    createdAt: '2026-03-01T00:00:00Z',
    client: { id: 'c1', name: 'مطعم بغداد', nameEn: 'Baghdad Restaurant' },
    payments: [],
  },
  {
    id: 'inv7',
    companyId: 'co1',
    clientId: 'c2',
    number: 'INV-2026-130',
    status: 'CANCELLED',
    type: 'STANDARD',
    items: [
      {
        description: 'خدمة ملغاة',
        quantity: 1,
        unitPrice: 2_000_000,
        currency: 'IQD',
        total: 2_000_000,
      },
    ],
    subtotal: 2_000_000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 2_000_000,
    paidAmount: 0,
    balanceDue: 2_000_000,
    currency: 'IQD',
    dueDate: '2026-02-28',
    notes: null,
    pdfUrl: null,
    createdAt: '2026-02-01T00:00:00Z',
    client: { id: 'c2', name: 'شركة الزلال', nameEn: 'Al-Zalal Company' },
    payments: [],
  },
  {
    id: 'inv8',
    companyId: 'co1',
    clientId: 'c4',
    number: 'INV-2026-150',
    status: 'SENT',
    type: 'STANDARD',
    items: [
      {
        description: 'الشمري Mall — دفعة ثانية',
        quantity: 1,
        unitPrice: 6_000_000,
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
    paidAmount: 0,
    balanceDue: 6_000_000,
    currency: 'IQD',
    dueDate: '2026-06-01',
    notes: null,
    pdfUrl: null,
    createdAt: '2026-05-10T00:00:00Z',
    client: { id: 'c4', name: 'مجمع الشمري', nameEn: 'Al-Shammari Mall' },
    payments: [],
  },
]

const STATUS_CFG = {
  PAID: { ar: 'مدفوع', en: 'Paid', style: 'bg-emerald-400/10 text-emerald-400' },
  SENT: { ar: 'معلق', en: 'Pending', style: 'bg-sky-400/10 text-sky-400' },
  OVERDUE: { ar: 'متأخر', en: 'Overdue', style: 'bg-red-400/10 text-red-400' },
  PARTIALLY_PAID: { ar: 'جزئي', en: 'Partial', style: 'bg-amber-400/10 text-amber-400' },
  CANCELLED: { ar: 'مُلغى', en: 'Cancelled', style: 'bg-white/[0.06] text-white/40' },
  DRAFT: { ar: 'مسودة', en: 'Draft', style: 'bg-white/[0.06] text-white/40' },
  REFUNDED: { ar: 'مُسترد', en: 'Refunded', style: 'bg-purple-400/10 text-purple-400' },
} as const

function fmtMoney(n: number) {
  return new Intl.NumberFormat('en-IQ').format(n)
}
function fmtDate(iso: string, isAr: boolean) {
  return new Date(iso).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function InvoicesClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [statusFilter, setStatusFilter] = useState('')

  const { data: apiData } = useInvoices(statusFilter ? { status: statusFilter } : undefined)
  const invoices = apiData ?? STATIC_INVOICES

  const filtered = statusFilter ? invoices.filter((i) => i.status === statusFilter) : invoices

  const collected = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
  const pending = invoices
    .filter((i) => ['SENT', 'PARTIALLY_PAID'].includes(i.status))
    .reduce((s, i) => s + i.balanceDue, 0)
  const overdue = invoices
    .filter((i) => i.status === 'OVERDUE')
    .reduce((s, i) => s + i.balanceDue, 0)
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE')

  const statuses = [
    { v: '', ar: 'الكل', en: 'All' },
    { v: 'PAID', ar: 'مدفوع', en: 'Paid' },
    { v: 'SENT', ar: 'معلق', en: 'Pending' },
    { v: 'OVERDUE', ar: 'متأخر', en: 'Overdue' },
    { v: 'CANCELLED', ar: 'ملغى', en: 'Cancelled' },
  ]

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'الفواتير' : 'Invoices'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {invoices.length} {isAr ? 'فاتورة' : 'invoices'}
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/20">
          <Plus className="h-3.5 w-3.5" />
          {isAr ? 'فاتورة جديدة' : 'New Invoice'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {isAr ? 'المحصّل' : 'Collected'}
            </p>
            <FileCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-300">{fmtMoney(collected)}</p>
          <p className="text-muted-foreground mt-1 text-xs">{isAr ? 'دينار عراقي' : 'IQD'}</p>
        </div>
        <div className="rounded-xl border border-sky-400/20 bg-sky-400/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {isAr ? 'المعلّق' : 'Pending'}
            </p>
            <Clock className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-sky-300">{fmtMoney(pending)}</p>
          <p className="text-muted-foreground mt-1 text-xs">{isAr ? 'دينار عراقي' : 'IQD'}</p>
        </div>
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {isAr ? 'المتأخر' : 'Overdue'}
            </p>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-red-300">{fmtMoney(overdue)}</p>
          <p className="text-muted-foreground mt-1 text-xs">{isAr ? 'دينار عراقي' : 'IQD'}</p>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {overdueInvoices.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">
              {isAr
                ? `${overdueInvoices.length} فاتورة متأخرة — ${fmtMoney(overdue)} د.ع`
                : `${overdueInvoices.length} overdue invoice${overdueInvoices.length > 1 ? 's' : ''} — ${fmtMoney(overdue)} IQD`}
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-red-400/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-400/20">
            <Bell className="h-3 w-3" />
            {isAr ? 'إرسال تذكير' : 'Send Reminder'}
          </button>
        </div>
      )}

      {/* Status Filter */}
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
                { ar: 'المبلغ', en: 'Amount' },
                { ar: 'الحالة', en: 'Status' },
                { ar: 'الاستحقاق', en: 'Due', hide: 'hidden md:table-cell' },
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
            {filtered.map((inv) => {
              const cfg = STATUS_CFG[inv.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.DRAFT
              const isOverdue = inv.status === 'OVERDUE'
              return (
                <tr
                  key={inv.id}
                  className={cn(
                    'transition-colors hover:bg-white/[0.02]',
                    isOverdue && 'bg-red-400/[0.02]',
                  )}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-sm font-medium text-sky-300">{inv.number}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium">
                      {isAr ? inv.client.name : (inv.client.nameEn ?? inv.client.name)}
                    </div>
                    <div className="text-muted-foreground text-xs">{inv.items[0]?.description}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-mono text-sm font-semibold">{fmtMoney(inv.total)}</div>
                    {inv.balanceDue > 0 && inv.balanceDue < inv.total && (
                      <div className="text-muted-foreground text-[11px]">
                        {isAr ? 'المتبقي' : 'Due'}: {fmtMoney(inv.balanceDue)}
                      </div>
                    )}
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
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    <span
                      className={cn(
                        'text-xs',
                        isOverdue ? 'font-medium text-red-400' : 'text-muted-foreground',
                      )}
                    >
                      {fmtDate(inv.dueDate, isAr)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title={isAr ? 'عرض' : 'View'}
                        className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {isOverdue && (
                        <button
                          title={isAr ? 'تذكير' : 'Remind'}
                          className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-amber-400"
                        >
                          <Bell className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {inv.status === 'PAID' && (
                        <button
                          title={isAr ? 'إيصال' : 'Receipt'}
                          className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-emerald-400"
                        >
                          <FileCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
