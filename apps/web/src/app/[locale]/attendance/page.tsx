'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useTodayAll } from '@/hooks/use-attendance'
import { useDepartments } from '@/hooks/use-departments'

export default function AttendanceDashboardPage() {
  const t = useTranslations('attendanceDashboard')
  const tCommon = useTranslations('common')
  const { data: departments } = useDepartments()
  const [deptFilter, setDeptFilter] = useState('')
  const [monthOffset, setMonthOffset] = useState(0)
  const { data: employees, isLoading } = useTodayAll(deptFilter || undefined)

  const now = new Date()
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthLabel = targetMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
  const firstDay = targetMonth.getDay()

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { present: 0, late: 0, absent: 0, onLeave: 0 }
    employees?.forEach((emp) => {
      const rec = emp.attendanceRecords?.[0]
      if (rec?.status === 'PRESENT') {
        counts['present'] = (counts['present'] ?? 0) + 1
        return
      }
      if (rec?.status === 'LATE') {
        counts['late'] = (counts['late'] ?? 0) + 1
        return
      }
      if (rec?.status === 'ABSENT' || !rec) {
        counts['absent'] = (counts['absent'] ?? 0) + 1
        return
      }
    })
    return counts
  }, [employees])

  if (isLoading) return <p className="text-muted-foreground p-8">{tCommon('loading')}</p>

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50">
            {t('exportExcel')}
          </button>
          <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50">
            {t('exportPdf')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label={t('present')}
          count={statusCounts['present'] ?? 0}
          color="bg-green-100 text-green-800"
        />
        <StatCard
          label={t('late')}
          count={statusCounts['late'] ?? 0}
          color="bg-yellow-100 text-yellow-800"
        />
        <StatCard
          label={t('absent')}
          count={statusCounts['absent'] ?? 0}
          color="bg-red-100 text-red-800"
        />
        <StatCard
          label={t('onLeave')}
          count={statusCounts['onLeave'] ?? 0}
          color="bg-blue-100 text-blue-800"
        />
      </div>

      <div className="flex gap-3">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('allDepartments')}</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nameAr}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">{t('employee')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('code')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('department')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('checkIn')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('checkOut')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('hours')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees?.map((emp) => {
              const rec = emp.attendanceRecords?.[0]
              const statusColor = !rec
                ? 'bg-red-100 text-red-800'
                : rec.status === 'PRESENT'
                  ? 'bg-green-100 text-green-800'
                  : rec.status === 'LATE'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
              return (
                <tr key={emp.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{emp.fullNameAr}</td>
                  <td className="px-4 py-3 font-mono text-xs">{emp.employeeCode}</td>
                  <td className="text-muted-foreground px-4 py-3">
                    {emp.department?.nameAr || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                      {rec?.status || t('absent')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {rec ? new Date(rec.checkInTime).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {rec?.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {rec?.workHoursCalculated ? `${rec.workHoursCalculated.toFixed(1)}h` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{t('monthlyView')}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMonthOffset((p) => p - 1)}
              className="rounded-md border px-2 py-1 text-xs"
            >
              &larr;
            </button>
            <span className="px-2 text-sm font-medium">{monthLabel}</span>
            <button
              onClick={() => setMonthOffset((p) => p + 1)}
              disabled={monthOffset >= 0}
              className="rounded-md border px-2 py-1 text-xs disabled:opacity-30"
            >
              &rarr;
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-muted-foreground py-1 font-medium">
              {d}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isToday = day === now.getDate() && monthOffset === 0
            return (
              <div
                key={day}
                className={`rounded py-1 text-xs ${isToday ? 'bg-blue-100 font-bold' : 'hover:bg-gray-50'}`}
              >
                {day}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{count}</p>
    </div>
  )
}
