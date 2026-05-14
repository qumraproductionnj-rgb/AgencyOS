'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

const PROJECTS = [
  {
    nameAr: 'حملة رمضان',
    nameEn: 'Ramadan Campaign',
    progress: 92,
    status: 'active',
    tasksTotal: 24,
    tasksDone: 22,
  },
  {
    nameAr: 'هوية الزلال',
    nameEn: 'Al-Zalal Identity',
    progress: 68,
    status: 'active',
    tasksTotal: 18,
    tasksDone: 12,
  },
  {
    nameAr: 'موقع الشمري',
    nameEn: 'Shammari Website',
    progress: 45,
    status: 'review',
    tasksTotal: 30,
    tasksDone: 13,
  },
  {
    nameAr: 'فيديو النعيمي',
    nameEn: 'Al-Naaimi Video',
    progress: 100,
    status: 'done',
    tasksTotal: 15,
    tasksDone: 15,
  },
  {
    nameAr: 'تصميم الرافدين',
    nameEn: 'Rafidain Design',
    progress: 30,
    status: 'active',
    tasksTotal: 20,
    tasksDone: 6,
  },
]

const TASK_COMPLETION = [
  { weekAr: 'الأسبوع ١', weekEn: 'Week 1', done: 12, pending: 4 },
  { weekAr: 'الأسبوع ٢', weekEn: 'Week 2', done: 18, pending: 6 },
  { weekAr: 'الأسبوع ٣', weekEn: 'Week 3', done: 15, pending: 3 },
  { weekAr: 'الأسبوع ٤', weekEn: 'Week 4', done: 22, pending: 5 },
]

const STATUS_COLORS = {
  active: { bg: 'bg-sky-400/10', text: 'text-sky-400', ar: 'نشط', en: 'Active' },
  review: { bg: 'bg-amber-400/10', text: 'text-amber-400', ar: 'مراجعة', en: 'Review' },
  done: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', ar: 'مكتمل', en: 'Done' },
}

const TOOLTIP_STYLE = {
  background: 'rgba(10,10,10,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
}

export function OperationsReportClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')

  const filtered =
    filter === 'all'
      ? PROJECTS
      : PROJECTS.filter((p) => p.status === (filter === 'done' ? 'done' : 'active'))
  const avgCompletion = Math.round(PROJECTS.reduce((s, p) => s + p.progress, 0) / PROJECTS.length)

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
            <h1 className="text-xl font-bold">{isAr ? 'تقرير العمليات' : 'Operations Report'}</h1>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'المشاريع · المهام · الإنجاز' : 'Projects · Tasks · Completion'}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white">
          <Download className="h-3.5 w-3.5" />
          {isAr ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: isAr ? 'إجمالي المشاريع' : 'Total Projects',
            value: PROJECTS.length,
            color: 'text-sky-400',
          },
          {
            label: isAr ? 'مكتملة' : 'Completed',
            value: PROJECTS.filter((p) => p.status === 'done').length,
            color: 'text-emerald-400',
          },
          {
            label: isAr ? 'متوسط الإنجاز' : 'Avg Completion',
            value: `${avgCompletion}%`,
            color: 'text-purple-400',
          },
          {
            label: isAr ? 'إجمالي المهام' : 'Total Tasks',
            value: PROJECTS.reduce((s, p) => s + p.tasksTotal, 0),
            color: 'text-amber-400',
          },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-muted-foreground text-xs">{k.label}</p>
            <p className={cn('mt-2 text-2xl font-bold', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Task completion chart */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <h3 className="mb-4 text-sm font-semibold">
          {isAr ? 'إنجاز المهام الأسبوعي' : 'Weekly Task Completion'}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={TASK_COMPLETION} barCategoryGap="30%">
            <XAxis
              dataKey={isAr ? 'weekAr' : 'weekEn'}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar
              dataKey="done"
              name={isAr ? 'مكتملة' : 'Done'}
              stackId="a"
              fill="rgba(52,211,153,0.7)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="pending"
              name={isAr ? 'معلقة' : 'Pending'}
              stackId="a"
              fill="rgba(251,191,36,0.5)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Project list */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <h3 className="text-sm font-semibold">{isAr ? 'المشاريع' : 'Projects'}</h3>
          <div className="flex gap-1 rounded-lg border border-white/[0.06] p-1">
            {(['all', 'active', 'done'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs transition-colors',
                  filter === f
                    ? 'bg-white/[0.08] text-white'
                    : 'text-muted-foreground hover:bg-white/[0.04]',
                )}
              >
                {f === 'all'
                  ? isAr
                    ? 'الكل'
                    : 'All'
                  : f === 'active'
                    ? isAr
                      ? 'نشط'
                      : 'Active'
                    : isAr
                      ? 'مكتمل'
                      : 'Done'}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {filtered.map((p) => {
            const sc = STATUS_COLORS[p.status as keyof typeof STATUS_COLORS]
            return (
              <div key={p.nameAr} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{isAr ? p.nameAr : p.nameEn}</span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                        sc.bg,
                        sc.text,
                      )}
                    >
                      {isAr ? sc.ar : sc.en}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        p.progress === 100
                          ? 'bg-emerald-400'
                          : p.progress > 60
                            ? 'bg-sky-400'
                            : 'bg-amber-400',
                      )}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-sm font-semibold">{p.progress}%</p>
                  <p className="text-muted-foreground text-xs">
                    {p.tasksDone}/{p.tasksTotal} {isAr ? 'مهمة' : 'tasks'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
