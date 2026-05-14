'use client'

import { useLocale } from 'next-intl'
import {
  BarChart2,
  Settings2,
  Users,
  Briefcase,
  FileSpreadsheet,
  FileText,
  Download,
  TrendingUp,
  Star,
  Award,
  Timer,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const REPORT_CATEGORIES = [
  {
    icon: BarChart2,
    titleAr: 'تقرير مالي شهري',
    titleEn: 'Monthly Financial Report',
    descAr: 'الإيرادات، النفقات، الأرباح والتدفق النقدي',
    descEn: 'Revenue, expenses, profit & cash flow',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'hover:shadow-emerald-500/10',
  },
  {
    icon: Settings2,
    titleAr: 'تقرير العمليات',
    titleEn: 'Operations Report',
    descAr: 'أداء المشاريع، المهام المكتملة ومعدلات الإنجاز',
    descEn: 'Project performance, completed tasks & delivery rates',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    glow: 'hover:shadow-sky-500/10',
  },
  {
    icon: Users,
    titleAr: 'تقرير HR',
    titleEn: 'HR Report',
    descAr: 'الحضور، الإجازات، الرواتب وتقييم الأداء',
    descEn: 'Attendance, leaves, payroll & performance reviews',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'hover:shadow-purple-500/10',
  },
  {
    icon: Briefcase,
    titleAr: 'تقرير المبيعات',
    titleEn: 'Sales Report',
    descAr: 'العملاء المحتملون، العقود المُبرمة والإيرادات',
    descEn: 'Leads, closed deals & revenue pipeline',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'hover:shadow-amber-500/10',
  },
]

const QUICK_STATS = [
  {
    icon: TrendingUp,
    labelAr: 'إجمالي الإيرادات YTD',
    labelEn: 'Total Revenue YTD',
    value: '45.2M',
    subAr: 'دينار عراقي',
    subEn: 'IQD',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Star,
    labelAr: 'أكثر عميل ربحية',
    labelEn: 'Most Profitable Client',
    value: 'مطعم بغداد',
    valueEn: 'Baghdad Restaurant',
    subAr: '11.5M د.ع',
    subEn: '11.5M IQD',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Award,
    labelAr: 'أعلى موظف إنتاجية',
    labelEn: 'Top Productive Employee',
    value: 'علي حسن',
    valueEn: 'Ali Hassan',
    subAr: '47 مهمة مكتملة',
    subEn: '47 tasks done',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Timer,
    labelAr: 'المشروع الأطول',
    labelEn: 'Longest Running Project',
    value: 'حملة رمضان',
    valueEn: 'Ramadan Campaign',
    subAr: '118 يوم',
    subEn: '118 days',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
]

export function ReportsClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{isAr ? 'التقارير' : 'Reports'}</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {isAr
            ? 'توليد وتصدير التقارير التشغيلية والمالية'
            : 'Generate & export operational and financial reports'}
        </p>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REPORT_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <div
              key={cat.titleAr}
              className={cn(
                'rounded-xl border bg-white/[0.02] p-5 shadow-lg transition-all hover:bg-white/[0.04]',
                cat.border,
                cat.glow,
              )}
            >
              <div className="mb-4 flex items-start gap-3">
                <div className={cn('rounded-xl p-2.5', cat.bg)}>
                  <Icon className={cn('h-5 w-5', cat.color)} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{isAr ? cat.titleAr : cat.titleEn}</div>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {isAr ? cat.descAr : cat.descEn}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={cn(
                    'flex-1 rounded-lg py-2 text-xs font-medium transition-colors',
                    cat.bg,
                    cat.color,
                    'hover:opacity-80',
                  )}
                >
                  {isAr ? 'توليد التقرير' : 'Generate Report'}
                </button>
                <button className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.08]">
                  <FileSpreadsheet className="h-3 w-3" />
                  Excel
                </button>
                <button className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.08]">
                  <FileText className="h-3 w-3" />
                  PDF
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">{isAr ? 'إحصائيات سريعة' : 'Quick Stats'}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_STATS.map((s) => {
            const Icon = s.icon
            const displayValue = s.valueEn && !isAr ? s.valueEn : s.value
            const displaySub = isAr ? s.subAr : s.subEn
            return (
              <div
                key={s.labelAr}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">{isAr ? s.labelAr : s.labelEn}</p>
                  <div className={cn('rounded-lg p-1.5', s.bg)}>
                    <Icon className={cn('h-3.5 w-3.5', s.color)} />
                  </div>
                </div>
                <div className="font-semibold">{displayValue}</div>
                <div className={cn('mt-0.5 text-xs', s.color)}>{displaySub}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Export All */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">{isAr ? 'تصدير جميع التقارير' : 'Export All Reports'}</p>
            <p className="text-muted-foreground text-xs">
              {isAr ? 'تحميل كل التقارير دفعة واحدة' : 'Download all reports in one batch'}
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.06] px-4 py-2 text-sm font-medium transition-colors hover:bg-white/[0.1]">
            <Download className="h-4 w-4" />
            {isAr ? 'تصدير الكل' : 'Export All'}
          </button>
        </div>
      </div>
    </div>
  )
}
