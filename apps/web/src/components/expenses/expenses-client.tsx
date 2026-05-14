'use client'

import { useLocale } from 'next-intl'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Banknote, CreditCard, Smartphone, Globe, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const REVENUE_DATA = [
  { month: 'ديس', monthEn: 'Dec', iqd: 32, usd: 1.2 },
  { month: 'يناير', monthEn: 'Jan', iqd: 28, usd: 0.8 },
  { month: 'فبراير', monthEn: 'Feb', iqd: 41, usd: 1.5 },
  { month: 'مارس', monthEn: 'Mar', iqd: 38, usd: 1.1 },
  { month: 'أبريل', monthEn: 'Apr', iqd: 45.2, usd: 2.1 },
  { month: 'مايو', monthEn: 'May', iqd: 18, usd: 0.5 },
]

const PAYMENT_METHODS = [
  {
    icon: Banknote,
    label: 'نقدي IQD',
    labelEn: 'Cash IQD',
    pct: 68,
    color: 'bg-emerald-400',
    iconColor: 'text-emerald-400',
    amount: '30.7M',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    icon: CreditCard,
    label: 'FIB Bank',
    labelEn: 'FIB Bank',
    pct: 22,
    color: 'bg-sky-400',
    iconColor: 'text-sky-400',
    amount: '9.9M',
    gradient: 'from-sky-500/20 to-sky-500/5',
  },
  {
    icon: Smartphone,
    label: 'FastPay',
    labelEn: 'FastPay',
    pct: 8,
    color: 'bg-purple-400',
    iconColor: 'text-purple-400',
    amount: '3.6M',
    gradient: 'from-purple-500/20 to-purple-500/5',
  },
  {
    icon: Globe,
    label: 'Stripe USD',
    labelEn: 'Stripe USD',
    pct: 2,
    color: 'bg-amber-400',
    iconColor: 'text-amber-400',
    amount: '$1.2K',
    gradient: 'from-amber-500/20 to-amber-500/5',
  },
]

const TRANSACTIONS = [
  {
    date: '2026-05-10',
    clientAr: 'مطعم بغداد',
    clientEn: 'Baghdad Restaurant',
    amount: 8_500_000,
    method: 'CASH',
    methodAr: 'نقدي',
    status: 'COMPLETED',
    statusAr: 'مكتمل',
  },
  {
    date: '2026-05-08',
    clientAr: 'مجمع الشمري',
    clientEn: 'Al-Shammari Mall',
    amount: 2_500_000,
    method: 'FIB',
    methodAr: 'FIB',
    status: 'COMPLETED',
    statusAr: 'مكتمل',
  },
  {
    date: '2026-05-05',
    clientAr: 'شركة الزلال',
    clientEn: 'Al-Zalal Company',
    amount: 6_000_000,
    method: 'CASH',
    methodAr: 'نقدي',
    status: 'COMPLETED',
    statusAr: 'مكتمل',
  },
  {
    date: '2026-04-28',
    clientAr: 'عيادات الرافدين',
    clientEn: 'Rafidain Clinics',
    amount: 4_500_000,
    method: 'CASH',
    methodAr: 'نقدي',
    status: 'COMPLETED',
    statusAr: 'مكتمل',
  },
  {
    date: '2026-04-20',
    clientAr: 'فندق النعيمي',
    clientEn: 'Al-Naaimi Hotel',
    amount: 1_200_000,
    method: 'FASTPAY',
    methodAr: 'FastPay',
    status: 'COMPLETED',
    statusAr: 'مكتمل',
  },
  {
    date: '2026-04-15',
    clientAr: 'مطعم بغداد',
    clientEn: 'Baghdad Restaurant',
    amount: 3_000_000,
    method: 'FIB',
    methodAr: 'FIB',
    status: 'COMPLETED',
    statusAr: 'مكتمل',
  },
  {
    date: '2026-04-10',
    clientAr: 'مجموعة الأكاديمي',
    clientEn: 'Al-Academie Group',
    amount: 900,
    method: 'STRIPE',
    methodAr: 'Stripe',
    status: 'COMPLETED',
    statusAr: 'مكتمل',
    usd: true,
  },
]

function fmtMoney(n: number, usd = false) {
  if (usd) return `$${new Intl.NumberFormat('en-US').format(n)}`
  return new Intl.NumberFormat('en-IQ').format(n)
}

function fmtDate(iso: string, isAr: boolean) {
  return new Date(iso).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

const PL = {
  revenue: 45_200_000,
  expenses: 28_500_000,
  profit: 16_700_000,
  profitPct: 37,
}

export function ExpensesClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          {isAr ? 'المدفوعات والتقارير المالية' : 'Payments & Finance'}
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">{isAr ? 'أبريل 2026' : 'April 2026'}</p>
      </div>

      {/* P&L + Payment Methods row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* P&L */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold">
            {isAr ? 'الملخص المالي (P&L)' : 'Financial Summary (P&L)'}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  {isAr ? 'الإيرادات' : 'Revenue'}
                </span>
                <span className="font-mono font-semibold text-emerald-300">
                  {fmtMoney(PL.revenue)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                  {isAr ? 'النفقات' : 'Expenses'}
                </span>
                <span className="font-mono font-semibold text-red-300">
                  {fmtMoney(PL.expenses)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-red-400"
                  style={{ width: `${Math.round((PL.expenses / PL.revenue) * 100)}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-300">
                  {isAr ? 'صافي الربح' : 'Net Profit'}
                </span>
                <span className="font-mono text-lg font-bold text-emerald-300">
                  {fmtMoney(PL.profit)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-emerald-400/60">
                <span>{isAr ? 'هامش الربح' : 'Profit margin'}</span>
                <span className="font-semibold text-emerald-400">{PL.profitPct}%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-emerald-400/10">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${PL.profitPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold">{isAr ? 'طرق الدفع' : 'Payment Methods'}</h3>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon
              return (
                <div
                  key={m.label}
                  className={cn(
                    'rounded-xl border border-white/[0.06] bg-gradient-to-b p-3.5',
                    m.gradient,
                  )}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className={cn('h-4 w-4 shrink-0', m.iconColor)} />
                    <span className="truncate text-xs font-medium">
                      {isAr ? m.label : m.labelEn}
                    </span>
                  </div>
                  <div className="text-base font-bold">{m.amount}</div>
                  <div className="mt-2 h-1 rounded-full bg-white/[0.06]">
                    <div
                      className={cn('h-full rounded-full', m.color)}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground mt-1 text-[11px]">{m.pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {isAr ? 'الإيرادات — آخر 6 أشهر' : 'Revenue — Last 6 Months'}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-white/40">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              {isAr ? 'دينار عراقي (M)' : 'IQD (M)'}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {isAr ? 'دولار (K$)' : 'USD (K$)'}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={REVENUE_DATA} barCategoryGap="30%" barGap={4}>
            <XAxis
              dataKey={isAr ? 'month' : 'monthEn'}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: 'rgba(10,10,10,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 12,
              }}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar dataKey="iqd" name={isAr ? 'دينار عراقي' : 'IQD'} radius={[4, 4, 0, 0]}>
              {REVENUE_DATA.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === REVENUE_DATA.length - 1
                      ? 'rgba(56,189,248,0.8)'
                      : 'rgba(255,255,255,0.12)'
                  }
                />
              ))}
            </Bar>
            <Bar dataKey="usd" name="USD" radius={[4, 4, 0, 0]}>
              {REVENUE_DATA.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === REVENUE_DATA.length - 1 ? 'rgba(251,191,36,0.8)' : 'rgba(251,191,36,0.15)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="border-b border-white/[0.06] px-5 py-3.5">
          <h3 className="text-sm font-semibold">
            {isAr ? 'آخر المعاملات' : 'Recent Transactions'}
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {[
                { ar: 'التاريخ', en: 'Date' },
                { ar: 'العميل', en: 'Client' },
                { ar: 'المبلغ', en: 'Amount' },
                { ar: 'الطريقة', en: 'Method', hide: 'hidden sm:table-cell' },
                { ar: 'الحالة', en: 'Status', hide: 'hidden md:table-cell' },
              ].map((h) => (
                <th
                  key={h.ar}
                  className={cn(
                    'text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider',
                    h.hide,
                  )}
                >
                  {isAr ? h.ar : h.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {TRANSACTIONS.map((tx, i) => (
              <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                <td className="text-muted-foreground px-4 py-3.5 text-xs">
                  {fmtDate(tx.date, isAr)}
                </td>
                <td className="px-4 py-3.5 font-medium">{isAr ? tx.clientAr : tx.clientEn}</td>
                <td className="px-4 py-3.5 font-mono text-sm font-semibold text-sky-300">
                  {fmtMoney(tx.amount, tx.usd)} {tx.usd ? '' : isAr ? 'د.ع' : 'IQD'}
                </td>
                <td className="hidden px-4 py-3.5 sm:table-cell">
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-white/60">
                    {isAr ? tx.methodAr : tx.method}
                  </span>
                </td>
                <td className="hidden px-4 py-3.5 md:table-cell">
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                    {isAr ? tx.statusAr : tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
