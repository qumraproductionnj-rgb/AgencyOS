'use client'

import { useState, useMemo } from 'react'
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useTodayAll, type EmployeeToday } from '@/hooks/use-attendance'
import { cn } from '@/lib/utils'

const STATIC_ATTENDANCE: EmployeeToday[] = [
  {
    id: '1',
    employeeCode: 'EMP-001',
    fullNameAr: 'أحمد العبادي',
    department: { id: 'd1', nameAr: 'الإنتاج الإبداعي' },
    attendanceRecords: [
      {
        id: 'r1',
        status: 'PRESENT',
        checkInTime: new Date().toISOString().replace(/T.*/, 'T07:58:00.000Z'),
        checkOutTime: null,
        checkInLat: 33.3152,
        checkInLng: 44.3661,
        checkInDistanceM: 45,
        workHoursCalculated: null,
        workLocation: { id: 'wl1', name: 'المكتب الرئيسي' },
      },
    ],
  },
  {
    id: '2',
    employeeCode: 'EMP-002',
    fullNameAr: 'سارة جاسم',
    department: { id: 'd1', nameAr: 'الإنتاج الإبداعي' },
    attendanceRecords: [
      {
        id: 'r2',
        status: 'PRESENT',
        checkInTime: new Date().toISOString().replace(/T.*/, 'T08:05:00.000Z'),
        checkOutTime: null,
        checkInLat: 33.3152,
        checkInLng: 44.3661,
        checkInDistanceM: 22,
        workHoursCalculated: null,
        workLocation: { id: 'wl1', name: 'المكتب الرئيسي' },
      },
    ],
  },
  {
    id: '3',
    employeeCode: 'EMP-003',
    fullNameAr: 'محمد الحسيني',
    department: { id: 'd2', nameAr: 'المبيعات' },
    attendanceRecords: [
      {
        id: 'r3',
        status: 'LATE',
        checkInTime: new Date().toISOString().replace(/T.*/, 'T09:22:00.000Z'),
        checkOutTime: null,
        checkInLat: 33.32,
        checkInLng: 44.37,
        checkInDistanceM: 310,
        workHoursCalculated: null,
        workLocation: { id: 'wl2', name: 'موقع العميل' },
      },
    ],
  },
  {
    id: '4',
    employeeCode: 'EMP-004',
    fullNameAr: 'نور الخفاجي',
    department: { id: 'd3', nameAr: 'المالية' },
    attendanceRecords: [
      {
        id: 'r4',
        status: 'PRESENT',
        checkInTime: new Date().toISOString().replace(/T.*/, 'T07:55:00.000Z'),
        checkOutTime: null,
        checkInLat: 33.3152,
        checkInLng: 44.3661,
        checkInDistanceM: 18,
        workHoursCalculated: null,
        workLocation: { id: 'wl1', name: 'المكتب الرئيسي' },
      },
    ],
  },
  {
    id: '5',
    employeeCode: 'EMP-005',
    fullNameAr: 'علي الربيعي',
    department: { id: 'd1', nameAr: 'الإنتاج الإبداعي' },
    attendanceRecords: [
      {
        id: 'r5',
        status: 'PRESENT',
        checkInTime: new Date().toISOString().replace(/T.*/, 'T08:01:00.000Z'),
        checkOutTime: null,
        checkInLat: 33.3152,
        checkInLng: 44.3661,
        checkInDistanceM: 55,
        workHoursCalculated: null,
        workLocation: { id: 'wl1', name: 'المكتب الرئيسي' },
      },
    ],
  },
  {
    id: '6',
    employeeCode: 'EMP-006',
    fullNameAr: 'زينب الموسوي',
    department: { id: 'd4', nameAr: 'المشاريع' },
    attendanceRecords: [
      {
        id: 'r6',
        status: 'PRESENT',
        checkInTime: new Date().toISOString().replace(/T.*/, 'T08:00:00.000Z'),
        checkOutTime: null,
        checkInLat: null,
        checkInLng: null,
        checkInDistanceM: null,
        workHoursCalculated: null,
        workLocation: { id: 'wl3', name: 'عن بُعد' },
      },
    ],
  },
  {
    id: '7',
    employeeCode: 'EMP-007',
    fullNameAr: 'حسن العلي',
    department: { id: 'd5', nameAr: 'التقنية' },
    attendanceRecords: [],
  },
  {
    id: '8',
    employeeCode: 'EMP-008',
    fullNameAr: 'فاطمة الزبيدي',
    department: { id: 'd6', nameAr: 'الإدارة' },
    attendanceRecords: [],
  },
]

const STATUS_CONFIG = {
  PRESENT: {
    ar: 'حاضر',
    en: 'Present',
    style: 'bg-emerald-400/10 text-emerald-400',
    icon: CheckCircle,
  },
  LATE: {
    ar: 'متأخر',
    en: 'Late',
    style: 'bg-amber-400/10 text-amber-400',
    icon: AlertCircle,
  },
  ABSENT: {
    ar: 'غائب',
    en: 'Absent',
    style: 'bg-red-400/10 text-red-400',
    icon: XCircle,
  },
} as const

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface KpiProps {
  label: string
  value: number
  total: number
  color: string
  icon: React.ReactNode
}

function KpiCard({ label, value, total, color, icon }: KpiProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        <div className="rounded-lg bg-white/[0.06] p-2">{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <div className="mt-3 h-1.5 rounded-full bg-white/[0.06]">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-muted-foreground mt-1.5 text-xs">{pct}%</p>
    </div>
  )
}

export function AttendanceClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [monthOffset, setMonthOffset] = useState(0)

  const { data: apiData } = useTodayAll()
  const employees = apiData ?? STATIC_ATTENDANCE

  const { presentCount, lateCount, absentCount } = useMemo(() => {
    let present = 0
    let late = 0
    let absent = 0
    employees.forEach((emp) => {
      const rec = emp.attendanceRecords?.[0]
      if (rec?.status === 'PRESENT') present++
      else if (rec?.status === 'LATE') late++
      else absent++
    })
    return { presentCount: present, lateCount: late, absentCount: absent }
  }, [employees])

  const total = employees.length

  const now = new Date()
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthLabel = targetMonth.toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  })
  const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = targetMonth.getDay()

  const dayNames = isAr
    ? ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'الحضور والغياب' : 'Attendance'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {new Date().toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">{isAr ? 'مباشر' : 'Live'}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label={isAr ? 'حاضر' : 'Present'}
          value={presentCount}
          total={total}
          color="bg-emerald-400"
          icon={<CheckCircle className="h-4 w-4 text-emerald-400" />}
        />
        <KpiCard
          label={isAr ? 'متأخر' : 'Late'}
          value={lateCount}
          total={total}
          color="bg-amber-400"
          icon={<AlertCircle className="h-4 w-4 text-amber-400" />}
        />
        <KpiCard
          label={isAr ? 'غائب' : 'Absent'}
          value={absentCount}
          total={total}
          color="bg-red-400"
          icon={<XCircle className="h-4 w-4 text-red-400" />}
        />
        <KpiCard
          label={isAr ? 'الإجمالي' : 'Total'}
          value={total}
          total={total}
          color="bg-sky-400"
          icon={<Users className="h-4 w-4 text-sky-400" />}
        />
      </div>

      {/* Check-ins Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="border-b border-white/[0.06] px-5 py-3.5">
          <h3 className="text-sm font-semibold">
            {isAr ? 'سجل الحضور اليومي' : "Today's Check-ins"}
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                {isAr ? 'الموظف' : 'Employee'}
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider sm:table-cell">
                {isAr ? 'القسم' : 'Dept'}
              </th>
              <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                {isAr ? 'الحالة' : 'Status'}
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                {isAr ? 'تسجيل الدخول' : 'Check-in'}
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider lg:table-cell">
                {isAr ? 'الموقع' : 'Location'}
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider lg:table-cell">
                GPS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {employees.map((emp) => {
              const rec = emp.attendanceRecords?.[0]
              const statusKey = rec?.status ?? 'ABSENT'
              const cfg =
                STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.ABSENT
              const StatusIcon = cfg.icon
              const isGpsOk = rec?.checkInDistanceM != null && rec.checkInDistanceM <= 200
              const isGpsOver = rec?.checkInDistanceM != null && rec.checkInDistanceM > 200

              return (
                <tr key={emp.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5">
                    <div className="font-medium">{emp.fullNameAr}</div>
                    <div className="text-muted-foreground font-mono text-[11px]">
                      {emp.employeeCode}
                    </div>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3.5 text-sm sm:table-cell">
                    {emp.department?.nameAr ?? '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                        cfg.style,
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {isAr ? cfg.ar : cfg.en}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    {rec ? (
                      <span className="font-mono text-sm">{formatTime(rec.checkInTime)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3.5 lg:table-cell">
                    {rec?.workLocation ? (
                      <span className="inline-flex items-center gap-1 text-xs text-white/60">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {rec.workLocation.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3.5 lg:table-cell">
                    {rec?.checkInDistanceM != null ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                          isGpsOk && 'bg-emerald-400/10 text-emerald-400',
                          isGpsOver && 'bg-red-400/10 text-red-400',
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {rec.checkInDistanceM}m
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Monthly Calendar Heatmap */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{isAr ? 'عرض شهري' : 'Monthly View'}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthOffset((p) => p - 1)}
              className="rounded-md border border-white/[0.06] px-2.5 py-1 text-xs transition-colors hover:bg-white/[0.06]"
            >
              ←
            </button>
            <span className="min-w-[120px] text-center text-sm font-medium">{monthLabel}</span>
            <button
              onClick={() => setMonthOffset((p) => p + 1)}
              disabled={monthOffset >= 0}
              className="rounded-md border border-white/[0.06] px-2.5 py-1 text-xs transition-colors hover:bg-white/[0.06] disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {dayNames.map((d) => (
            <div key={d} className="text-muted-foreground py-1.5 font-semibold">
              {d}
            </div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isToday = day === now.getDate() && monthOffset === 0
            const isPast =
              !isToday && (monthOffset < 0 || (monthOffset === 0 && day < now.getDate()))
            return (
              <div
                key={day}
                className={cn(
                  'rounded-md py-2 text-xs font-medium transition-colors',
                  isToday && 'bg-sky-400/20 text-sky-300 ring-1 ring-sky-400/30',
                  isPast && 'bg-emerald-400/[0.07] text-emerald-400/60 hover:bg-emerald-400/10',
                  !isToday && !isPast && 'text-white/20',
                )}
              >
                {day}
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400/20" />
            {isAr ? 'حاضر' : 'Present'}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-400/20 ring-1 ring-sky-400/30" />
            {isAr ? 'اليوم' : 'Today'}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-white/[0.04]" />
            {isAr ? 'قادم' : 'Upcoming'}
          </div>
        </div>
      </div>
    </div>
  )
}
