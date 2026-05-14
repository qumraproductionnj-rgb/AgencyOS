'use client'

import { useLocale } from 'next-intl'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'

const PIPELINE = [
  { nameAr: 'عميل محتمل', nameEn: 'Prospects', value: 42, color: '#38bdf8' },
  { nameAr: 'تواصل', nameEn: 'Contacted', value: 28, color: '#818cf8' },
  { nameAr: 'عرض سعر', nameEn: 'Proposal', value: 15, color: '#a78bfa' },
  { nameAr: 'تفاوض', nameEn: 'Negotiation', value: 8, color: '#c084fc' },
  { nameAr: 'فاز', nameEn: 'Won', value: 5, color: '#34d399' },
]

const WIN_LOSS = [
  { monthAr: 'يناير', monthEn: 'Jan', won: 3, lost: 2 },
  { monthAr: 'فبراير', monthEn: 'Feb', won: 4, lost: 1 },
  { monthAr: 'مارس', monthEn: 'Mar', won: 2, lost: 3 },
  { monthAr: 'أبريل', monthEn: 'Apr', won: 5, lost: 2 },
  { monthAr: 'مايو', monthEn: 'May', won: 5, lost: 1 },
]

const TOP_SOURCES = [
  { nameAr: 'إنستجرام', nameEn: 'Instagram', value: 38 },
  { nameAr: 'إحالة', nameEn: 'Referral', value: 29 },
  { nameAr: 'موقع', nameEn: 'Website', value: 18 },
  { nameAr: 'معرض', nameEn: 'Exhibition', value: 10 },
  { nameAr: 'أخرى', nameEn: 'Other', value: 5 },
]

const TOOLTIP_STYLE = {
  background: 'rgba(10,10,10,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
}

export function SalesReportClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const totalWon = WIN_LOSS.reduce((s, r) => s + r.won, 0)
  const totalLost = WIN_LOSS.reduce((s, r) => s + r.lost, 0)
  const winRate = Math.round((totalWon / (totalWon + totalLost)) * 100)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className={cn('h-4 w-4', isAr && 'rotate-180')} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{isAr ? 'تقرير المبيعات' : 'Sales Report'}</h1>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'خط الأنابيب · الفوز · الخسارة' : 'Pipeline · Win · Loss'}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white">
          <Download className="h-3.5 w-3.5" />
          {isAr ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: isAr ? 'عملاء محتملون' : 'Total Leads', value: 42, color: 'text-sky-400' },
          { label: isAr ? 'فاز' : 'Won', value: totalWon, color: 'text-emerald-400' },
          { label: isAr ? 'خسر' : 'Lost', value: totalLost, color: 'text-red-400' },
          {
            label: isAr ? 'معدل الفوز' : 'Win Rate',
            value: `${winRate}%`,
            color: 'text-purple-400',
          },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-muted-foreground text-xs">{k.label}</p>
            <p className={cn('mt-2 text-2xl font-bold', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pipeline funnel */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold">{isAr ? 'قمع المبيعات' : 'Sales Funnel'}</h3>
          <div className="space-y-2">
            {PIPELINE.map((stage) => (
              <div key={stage.nameAr}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{isAr ? stage.nameAr : stage.nameEn}</span>
                  <span className="font-semibold" style={{ color: stage.color }}>
                    {stage.value}
                  </span>
                </div>
                <div className="h-5 overflow-hidden rounded-md bg-white/[0.04]">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{
                      width: `${(stage.value / PIPELINE[0]!.value) * 100}%`,
                      backgroundColor: stage.color + '80',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Win/Loss by month */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold">
            {isAr ? 'الفوز والخسارة شهريًا' : 'Win/Loss by Month'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WIN_LOSS} barCategoryGap="30%">
              <XAxis
                dataKey={isAr ? 'monthAr' : 'monthEn'}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey="won"
                name={isAr ? 'فاز' : 'Won'}
                fill="rgba(52,211,153,0.7)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="lost"
                name={isAr ? 'خسر' : 'Lost'}
                fill="rgba(248,113,113,0.6)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top sources */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <h3 className="mb-4 text-sm font-semibold">{isAr ? 'مصادر العملاء' : 'Lead Sources'}</h3>
        <div className="space-y-3">
          {TOP_SOURCES.map((s, i) => (
            <div key={s.nameAr} className="flex items-center gap-3">
              <span className="w-4 text-xs text-white/30">{i + 1}</span>
              <span className="w-20 shrink-0 text-sm">{isAr ? s.nameAr : s.nameEn}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 transition-all"
                  style={{ width: `${s.value}%` }}
                />
              </div>
              <span className="w-8 text-end text-xs font-semibold text-white/70">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
