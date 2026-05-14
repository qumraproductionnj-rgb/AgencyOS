'use client'

import Link from 'next/link'
import {
  TrendingUp,
  Briefcase,
  FilePlus,
  FileText,
  Receipt,
  Sparkles,
  UserPlus,
  BarChart2,
  CheckCircle,
  Star,
  ArrowUpRight,
  X,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { WidgetId } from './types'

const REVENUE_DATA = [
  { month: 'ديس', monthEn: 'Dec', value: 32 },
  { month: 'يناير', monthEn: 'Jan', value: 28 },
  { month: 'فبراير', monthEn: 'Feb', value: 41 },
  { month: 'مارس', monthEn: 'Mar', value: 38 },
  { month: 'أبريل', monthEn: 'Apr', value: 45.2 },
  { month: 'مايو', monthEn: 'May', value: 52 },
]

const STATUS_DATA = [
  { name: 'نشط', nameEn: 'Active', value: 4, color: '#38bdf8' },
  { name: 'مراجعة', nameEn: 'Review', value: 1, color: '#a78bfa' },
  { name: 'مكتمل', nameEn: 'Done', value: 1, color: '#34d399' },
]

const ACTIVITY_ITEMS = [
  {
    icon: Receipt,
    text: 'فاتورة INV-2026-145 اعتُمدت',
    textEn: 'Invoice INV-2026-145 approved',
    time: '14 دقيقة',
    timeEn: '14m ago',
    color: 'text-green-400',
  },
  {
    icon: Star,
    text: 'أحمد طلب مراجعة',
    textEn: 'Ahmed requested review',
    time: '1 ساعة',
    timeEn: '1h ago',
    color: 'text-purple-400',
  },
  {
    icon: Briefcase,
    text: 'عميل جديد "مطعم بغداد"',
    textEn: 'New client "Baghdad Restaurant"',
    time: '3 ساعات',
    timeEn: '3h ago',
    color: 'text-sky-400',
  },
  {
    icon: CheckCircle,
    text: 'سارة سجّلت حضور GPS',
    textEn: 'Sara checked in via GPS',
    time: '5 ساعات',
    timeEn: '5h ago',
    color: 'text-emerald-400',
  },
  {
    icon: TrendingUp,
    text: 'مشروع الزلال وصل 92%',
    textEn: 'Al-Zalal project 92%',
    time: 'أمس',
    timeEn: 'Yesterday',
    color: 'text-amber-400',
  },
]

const QUICK_ACTIONS_DATA = [
  {
    href: '/projects',
    icon: FilePlus,
    label: 'مشروع جديد',
    labelEn: 'New Project',
    color: 'from-sky-500/20 to-sky-500/5 hover:from-sky-500/30',
  },
  {
    href: '/quotations',
    icon: FileText,
    label: 'عرض سعر',
    labelEn: 'Quotation',
    color: 'from-purple-500/20 to-purple-500/5 hover:from-purple-500/30',
  },
  {
    href: '/invoices',
    icon: Receipt,
    label: 'فاتورة',
    labelEn: 'Invoice',
    color: 'from-emerald-500/20 to-emerald-500/5 hover:from-emerald-500/30',
  },
  {
    href: '/ai-tools',
    icon: Sparkles,
    label: 'AI Tool',
    labelEn: 'AI Tool',
    color: 'from-amber-500/20 to-amber-500/5 hover:from-amber-500/30',
  },
  {
    href: '/employees',
    icon: UserPlus,
    label: 'دعوة موظف',
    labelEn: 'Invite Employee',
    color: 'from-pink-500/20 to-pink-500/5 hover:from-pink-500/30',
  },
  {
    href: '/reports',
    icon: BarChart2,
    label: 'تقرير شهري',
    labelEn: 'Monthly Report',
    color: 'from-cyan-500/20 to-cyan-500/5 hover:from-cyan-500/30',
  },
]

const TEAM_LOAD = [
  { nameAr: 'أحمد', nameEn: 'Ahmed', pct: 92, color: 'bg-red-400' },
  { nameAr: 'علي', nameEn: 'Ali', pct: 88, color: 'bg-red-400' },
  { nameAr: 'سارة', nameEn: 'Sara', pct: 74, color: 'bg-amber-400' },
  { nameAr: 'زينب', nameEn: 'Zainab', pct: 58, color: 'bg-amber-400' },
  { nameAr: 'محمد', nameEn: 'Mohammed', pct: 45, color: 'bg-emerald-400' },
]

const AI_INSIGHTS = [
  {
    ar: '💡 أحمد مرهق — انقل مهمتين إلى زينب لتوازن أفضل',
    en: '💡 Ahmed is overloaded — move 2 tasks to Zainab for better balance',
  },
  {
    ar: '📈 الإيرادات ارتفعت 15% — أكثر عميل مُدرّ هو الشمري',
    en: '📈 Revenue up 15% — top client is Shammari',
  },
  { ar: '⚠️ 3 فواتير تتجاوز مدتها 30 يومًا بدون دفع', en: '⚠️ 3 invoices are 30+ days overdue' },
]

interface WidgetRendererProps {
  id: WidgetId
  isAr: boolean
  editMode: boolean
  onRemove: (id: WidgetId) => void
}

export function WidgetRenderer({ id, isAr, editMode, onRemove }: WidgetRendererProps) {
  const tooltipStyle = {
    background: 'rgba(10,10,10,0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 12,
  }

  const renderContent = () => {
    switch (id) {
      case 'kpi-revenue':
        return (
          <div className="flex h-full flex-col justify-between">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">
              {isAr ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
            </p>
            <div>
              <p className="text-2xl font-bold">45.2M</p>
              <p className="text-muted-foreground text-xs">
                {isAr ? 'د.ع — أبريل 2026' : 'IQD — April 2026'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              {isAr ? '+12.5% مقارنة بالشهر الماضي' : '+12.5% vs last month'}
            </div>
          </div>
        )
      case 'kpi-projects':
        return (
          <div className="flex h-full flex-col justify-between">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">
              {isAr ? 'المشاريع النشطة' : 'Active Projects'}
            </p>
            <div>
              <p className="text-2xl font-bold">6</p>
              <p className="text-muted-foreground text-xs">
                {isAr ? 'قيد التنفيذ' : 'In progress'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              {isAr ? '+2 هذا الأسبوع' : '+2 this week'}
            </div>
          </div>
        )
      case 'kpi-employees':
        return (
          <div className="flex h-full flex-col justify-between">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">
              {isAr ? 'الموظفون' : 'Employees'}
            </p>
            <div>
              <p className="text-2xl font-bold">7/8</p>
              <p className="text-muted-foreground text-xs">
                {isAr ? 'حاضر اليوم (86%)' : 'Present today (86%)'}
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[86%] rounded-full bg-emerald-400" />
            </div>
          </div>
        )
      case 'kpi-clients':
        return (
          <div className="flex h-full flex-col justify-between">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">
              {isAr ? 'العملاء النشطون' : 'Active Clients'}
            </p>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-muted-foreground text-xs">
                {isAr ? '94% معدل الاحتفاظ' : '94% retention'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              {isAr ? 'أعلى من الشهر الماضي' : 'Higher than last month'}
            </div>
          </div>
        )
      case 'chart-revenue':
        return (
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold">
                {isAr ? 'الإيرادات — آخر 6 أشهر' : 'Revenue — Last 6 Months'}
              </p>
              <span className="text-muted-foreground text-xs">{isAr ? 'مليون د.ع' : 'M IQD'}</span>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA} barCategoryGap="30%">
                  <XAxis
                    dataKey={isAr ? 'month' : 'monthEn'}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    formatter={(v: number) => [`${v}M`, isAr ? 'الإيرادات' : 'Revenue']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      case 'chart-projects':
        return (
          <div className="flex h-full flex-col">
            <p className="mb-2 text-xs font-semibold">
              {isAr ? 'حالة المشاريع' : 'Project Status'}
            </p>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={STATUS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="65%"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {STATUS_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(
                      v: number,
                      _: string,
                      p: { payload?: { name?: string; nameEn?: string } },
                    ) => [v, isAr ? (p.payload?.name ?? '') : (p.payload?.nameEn ?? '')]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {STATUS_DATA.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="text-muted-foreground flex-1">{isAr ? s.name : s.nameEn}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'activity':
        return (
          <div className="flex h-full flex-col">
            <p className="mb-3 text-xs font-semibold">
              {isAr ? 'آخر النشاطات' : 'Recent Activity'}
            </p>
            <div className="flex-1 space-y-2 overflow-hidden">
              {ACTIVITY_ITEMS.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="mt-0.5 rounded-md bg-white/[0.06] p-1.5">
                      <Icon className={cn('h-3 w-3', item.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs">{isAr ? item.text : item.textEn}</p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-[10px]">
                      {isAr ? item.time : item.timeEn}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      case 'quick-actions':
        return (
          <div className="flex h-full flex-col">
            <p className="mb-3 text-xs font-semibold">{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</p>
            <div className="grid flex-1 grid-cols-2 content-start gap-2">
              {QUICK_ACTIONS_DATA.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border border-white/[0.06] bg-gradient-to-b p-2 text-center transition-all hover:border-white/[0.12]',
                      action.color,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-medium leading-tight">
                      {isAr ? action.label : action.labelEn}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      case 'team-load':
        return (
          <div className="flex h-full flex-col">
            <p className="mb-3 text-xs font-semibold">{isAr ? 'حمل الفريق' : 'Team Workload'}</p>
            <div className="flex-1 space-y-2.5">
              {TEAM_LOAD.map((m) => (
                <div key={m.nameAr}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span>{isAr ? m.nameAr : m.nameEn}</span>
                    <span className={cn('font-semibold', m.color.replace('bg-', 'text-'))}>
                      {m.pct}%
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={cn('h-full rounded-full', m.color)}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'ai-insight':
        return (
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <p className="text-xs font-semibold text-purple-300">
                {isAr ? 'تحليل AI' : 'AI Insights'}
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center space-y-2 py-2">
              {AI_INSIGHTS.map((item, i) => (
                <p key={i} className="text-[11px] leading-relaxed text-white/70">
                  {isAr ? item.ar : item.en}
                </p>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
      {editMode && (
        <button
          onClick={() => onRemove(id)}
          className="absolute end-2 top-2 z-10 rounded-md bg-red-500/20 p-1 text-red-400 transition-colors hover:bg-red-500/30"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {renderContent()}
    </div>
  )
}
