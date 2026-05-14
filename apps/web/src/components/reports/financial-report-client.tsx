'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

const REVENUE_DATA = [
  { monthAr: 'يناير', monthEn: 'Jan', revenue: 28, expenses: 18, profit: 10 },
  { monthAr: 'فبراير', monthEn: 'Feb', revenue: 41, expenses: 24, profit: 17 },
  { monthAr: 'مارس', monthEn: 'Mar', revenue: 38, expenses: 22, profit: 16 },
  { monthAr: 'أبريل', monthEn: 'Apr', revenue: 45, expenses: 26, profit: 19 },
  { monthAr: 'مايو', monthEn: 'May', revenue: 52, expenses: 29, profit: 23 },
  { monthAr: 'يونيو', monthEn: 'Jun', revenue: 47, expenses: 25, profit: 22 },
]

const EXPENSE_BREAKDOWN = [
  { nameAr: 'رواتب', nameEn: 'Salaries', value: 45, color: '#38bdf8' },
  { nameAr: 'إيجار', nameEn: 'Rent', value: 15, color: '#a78bfa' },
  { nameAr: 'تسويق', nameEn: 'Marketing', value: 20, color: '#34d399' },
  { nameAr: 'معدات', nameEn: 'Equipment', value: 12, color: '#fbbf24' },
  { nameAr: 'أخرى', nameEn: 'Other', value: 8, color: '#f87171' },
]

const TOOLTIP_STYLE = {
  background: 'rgba(10,10,10,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
}

export function FinancialReportClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [range, setRange] = useState<'6m' | '12m' | 'ytd'>('6m')

  const totalRevenue = REVENUE_DATA.reduce((s, r) => s + r.revenue, 0)
  const totalExpenses = REVENUE_DATA.reduce((s, r) => s + r.expenses, 0)
  const totalProfit = REVENUE_DATA.reduce((s, r) => s + r.profit, 0)
  const margin = Math.round((totalProfit / totalRevenue) * 100)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className={cn('h-4 w-4', isAr && 'rotate-180')} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{isAr ? 'التقرير المالي' : 'Financial Report'}</h1>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'الإيرادات · النفقات · الأرباح' : 'Revenue · Expenses · Profit'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-white/[0.06] p-1">
            {(['6m', '12m', 'ytd'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs transition-colors',
                  range === r
                    ? 'bg-white/[0.08] font-medium text-white'
                    : 'text-muted-foreground hover:bg-white/[0.04]',
                )}
              >
                {r === '6m'
                  ? isAr
                    ? '٦ أشهر'
                    : '6M'
                  : r === '12m'
                    ? isAr
                      ? '١٢ شهر'
                      : '12M'
                    : isAr
                      ? 'هذا العام'
                      : 'YTD'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white">
            <Download className="h-3.5 w-3.5" />
            {isAr ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: TrendingUp,
            label: isAr ? 'إجمالي الإيرادات' : 'Total Revenue',
            value: `${totalRevenue}M`,
            color: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10',
          },
          {
            icon: TrendingDown,
            label: isAr ? 'إجمالي النفقات' : 'Total Expenses',
            value: `${totalExpenses}M`,
            color: 'text-red-400',
            iconBg: 'bg-red-500/10',
          },
          {
            icon: DollarSign,
            label: isAr ? 'صافي الربح' : 'Net Profit',
            value: `${totalProfit}M`,
            color: 'text-sky-400',
            iconBg: 'bg-sky-500/10',
          },
          {
            icon: TrendingUp,
            label: isAr ? 'هامش الربح' : 'Profit Margin',
            value: `${margin}%`,
            color: 'text-purple-400',
            iconBg: 'bg-purple-500/10',
          },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
            >
              <div className={cn('mb-3 inline-flex rounded-lg p-2', kpi.iconBg)}>
                <Icon className={cn('h-4 w-4', kpi.color)} />
              </div>
              <p className="text-muted-foreground text-xs">{kpi.label}</p>
              <p className={cn('mt-1 text-2xl font-bold', kpi.color)}>{kpi.value}</p>
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                {isAr ? 'مليون د.ع' : 'Million IQD'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue vs Expenses line */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">
            {isAr ? 'الإيرادات مقابل النفقات' : 'Revenue vs Expenses'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={REVENUE_DATA}>
              <XAxis
                dataKey={isAr ? 'monthAr' : 'monthEn'}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}M د.ع`]} />
              <Legend
                formatter={(v) =>
                  isAr
                    ? v === 'revenue'
                      ? 'الإيرادات'
                      : v === 'expenses'
                        ? 'النفقات'
                        : 'الربح'
                    : v
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#f87171"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold">
            {isAr ? 'توزيع النفقات' : 'Expense Breakdown'}
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={EXPENSE_BREAKDOWN}
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="70%"
                paddingAngle={2}
                dataKey="value"
              >
                {EXPENSE_BREAKDOWN.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(
                  v: number,
                  _: string,
                  p: { payload?: { nameAr?: string; nameEn?: string } },
                ) => [`${v}%`, isAr ? (p.payload?.nameAr ?? '') : (p.payload?.nameEn ?? '')]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {EXPENSE_BREAKDOWN.map((e) => (
              <div key={e.nameAr} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: e.color }} />
                <span className="text-muted-foreground flex-1">{isAr ? e.nameAr : e.nameEn}</span>
                <span className="font-medium">{e.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Bar */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <h3 className="mb-4 text-sm font-semibold">{isAr ? 'الربح الشهري' : 'Monthly Profit'}</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={REVENUE_DATA} barCategoryGap="30%">
            <XAxis
              dataKey={isAr ? 'monthAr' : 'monthEn'}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: number) => [`${v}M`, isAr ? 'الربح' : 'Profit']}
            />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]} fill="rgba(56,189,248,0.6)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
