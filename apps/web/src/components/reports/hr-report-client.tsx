'use client'

import { useLocale } from 'next-intl'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

const EMPLOYEES = [
  {
    nameAr: 'أحمد العبادي',
    nameEn: 'Ahmed Al-Abbadi',
    role: 'Creative Director',
    present: 20,
    late: 1,
    absent: 1,
    hours: 188,
  },
  {
    nameAr: 'سارة جاسم',
    nameEn: 'Sara Jasim',
    role: 'Graphic Designer',
    present: 21,
    late: 0,
    absent: 1,
    hours: 176,
  },
  {
    nameAr: 'محمد الحسيني',
    nameEn: 'Mohammed Al-Husseini',
    role: 'Sales Manager',
    present: 19,
    late: 2,
    absent: 1,
    hours: 162,
  },
  {
    nameAr: 'علي الربيعي',
    nameEn: 'Ali Al-Rubai',
    role: 'Videographer',
    present: 22,
    late: 0,
    absent: 0,
    hours: 196,
  },
  {
    nameAr: 'زينب الموسوي',
    nameEn: 'Zainab Al-Mosawi',
    role: 'Coordinator',
    present: 20,
    late: 1,
    absent: 2,
    hours: 170,
  },
]

const HOURS_DATA = [
  { nameAr: 'أحمد', nameEn: 'Ahmed', hours: 188 },
  { nameAr: 'سارة', nameEn: 'Sara', hours: 176 },
  { nameAr: 'محمد', nameEn: 'Mohammed', hours: 162 },
  { nameAr: 'علي', nameEn: 'Ali', hours: 196 },
  { nameAr: 'زينب', nameEn: 'Zainab', hours: 170 },
]

// Attendance heatmap data (22 working days × 5 employees)
const HEATMAP_DAYS = Array.from({ length: 22 }, (_, i) => i + 1)
const HEATMAP_DATA: Record<string, Record<number, 'present' | 'late' | 'absent'>> = {
  أحمد: { 3: 'late', 15: 'absent' },
  سارة: { 8: 'absent' },
  محمد: { 5: 'late', 12: 'late', 20: 'absent' },
  علي: {},
  زينب: { 7: 'late', 16: 'absent', 21: 'absent' },
}

const TOOLTIP_STYLE = {
  background: 'rgba(10,10,10,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
}

function heatCell(status: 'present' | 'late' | 'absent' | undefined) {
  if (status === 'absent') return 'bg-red-400/70'
  if (status === 'late') return 'bg-amber-400/70'
  return 'bg-emerald-400/30'
}

export function HrReportClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const totalPresent = EMPLOYEES.reduce((s, e) => s + e.present, 0)
  const totalLate = EMPLOYEES.reduce((s, e) => s + e.late, 0)
  const totalAbsent = EMPLOYEES.reduce((s, e) => s + e.absent, 0)

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
            <h1 className="text-xl font-bold">{isAr ? 'تقرير الموارد البشرية' : 'HR Report'}</h1>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'الحضور · الساعات · الإجازات' : 'Attendance · Hours · Leaves'}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white">
          <Download className="h-3.5 w-3.5" />
          {isAr ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: isAr ? 'أيام حضور' : 'Present Days',
            value: totalPresent,
            color: 'text-emerald-400',
          },
          { label: isAr ? 'تأخيرات' : 'Late', value: totalLate, color: 'text-amber-400' },
          { label: isAr ? 'غياب' : 'Absent', value: totalAbsent, color: 'text-red-400' },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center"
          >
            <p className="text-muted-foreground text-xs">{k.label}</p>
            <p className={cn('mt-2 text-3xl font-bold', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Attendance Heatmap */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {isAr ? 'خريطة الحضور — مايو ٢٠٢٦' : 'Attendance Heatmap — May 2026'}
          </h3>
          <div className="flex items-center gap-3 text-[10px] text-white/40">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-400/30" />
              {isAr ? 'حاضر' : 'Present'}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-amber-400/70" />
              {isAr ? 'متأخر' : 'Late'}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-red-400/70" />
              {isAr ? 'غائب' : 'Absent'}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {EMPLOYEES.map((emp) => {
              const key = emp.nameAr.split(' ')[0] ?? emp.nameAr
              const dayData = HEATMAP_DATA[key] ?? {}
              return (
                <div key={emp.nameAr} className="mb-1.5 flex items-center gap-2">
                  <div className="w-20 shrink-0 text-end text-xs text-white/60">
                    {isAr ? emp.nameAr.split(' ')[0] : emp.nameEn.split(' ')[0]}
                  </div>
                  <div className="flex gap-0.5">
                    {HEATMAP_DAYS.map((d) => (
                      <div
                        key={d}
                        title={`Day ${d}`}
                        className={cn('h-5 w-5 rounded-sm', heatCell(dayData[d]))}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
            <div className="ms-[88px] mt-1 flex gap-0.5">
              {HEATMAP_DAYS.map((d) => (
                <div
                  key={d}
                  className="flex h-4 w-5 items-center justify-center text-[8px] text-white/20"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hours Bar */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <h3 className="mb-4 text-sm font-semibold">
          {isAr ? 'ساعات العمل الشهرية' : 'Monthly Work Hours'}
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={HOURS_DATA} barCategoryGap="30%">
            <XAxis
              dataKey={isAr ? 'nameAr' : 'nameEn'}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[140, 210]}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: number) => [`${v}h`, isAr ? 'ساعة' : 'Hours']}
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="rgba(167,139,250,0.7)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Employee table */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03]">
        <div className="border-b border-white/[0.06] px-5 py-3">
          <h3 className="text-sm font-semibold">{isAr ? 'تفاصيل الموظفين' : 'Employee Details'}</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {EMPLOYEES.map((emp) => (
            <div key={emp.nameAr} className="grid grid-cols-5 gap-4 px-5 py-3 text-sm">
              <div className="col-span-2">
                <p className="font-medium">{isAr ? emp.nameAr : emp.nameEn}</p>
                <p className="text-muted-foreground text-xs">{emp.role}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-emerald-400">{emp.present}</p>
                <p className="text-muted-foreground text-[10px]">{isAr ? 'حضور' : 'Present'}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-amber-400">{emp.late}</p>
                <p className="text-muted-foreground text-[10px]">{isAr ? 'تأخير' : 'Late'}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-sky-400">{emp.hours}h</p>
                <p className="text-muted-foreground text-[10px]">{isAr ? 'ساعة' : 'Hours'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
