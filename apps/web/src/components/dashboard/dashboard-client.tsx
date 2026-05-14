'use client'

import Link from 'next/link'
import {
  TrendingUp,
  FolderKanban,
  Users,
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
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

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

const ACTIVITY = [
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
    text: 'أحمد العبادي طلب مراجعة',
    textEn: 'Ahmed Al-Abbadi requested review',
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
    text: 'سارة جاسم سجّلت حضور GPS',
    textEn: 'Sara Jasim checked in via GPS',
    time: '5 ساعات',
    timeEn: '5h ago',
    color: 'text-emerald-400',
  },
  {
    icon: TrendingUp,
    text: 'مشروع الزلال وصل 92%',
    textEn: 'Al-Zalal project reached 92%',
    time: 'أمس',
    timeEn: 'Yesterday',
    color: 'text-amber-400',
  },
]

const QUICK_ACTIONS = [
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

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  trend?: string
  trendUp?: boolean
}

function KpiCard({ icon, label, value, sub, trend, trendUp }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground truncate text-xs font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          <p className="text-muted-foreground mt-1 text-xs">{sub}</p>
        </div>
        <div className="ms-3 shrink-0 rounded-lg bg-white/[0.06] p-2.5">{icon}</div>
      </div>
      {trend && (
        <div
          className={cn(
            'mt-3 flex items-center gap-1 text-xs font-medium',
            trendUp ? 'text-emerald-400' : 'text-red-400',
          )}
        >
          <ArrowUpRight className={cn('h-3 w-3', !trendUp && 'rotate-90')} />
          {trend}
        </div>
      )}
    </div>
  )
}

export function DashboardClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <div className="space-y-6 p-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<TrendingUp className="h-5 w-5 text-sky-400" />}
          label={isAr ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
          value="45.2M د.ع"
          sub={isAr ? 'شهر أبريل 2026' : 'April 2026'}
          trend={isAr ? '+12.5% مقارنة بالشهر الماضي' : '+12.5% vs last month'}
          trendUp
        />
        <KpiCard
          icon={<FolderKanban className="h-5 w-5 text-purple-400" />}
          label={isAr ? 'المشاريع النشطة' : 'Active Projects'}
          value="6"
          sub={isAr ? 'مشروع قيد التنفيذ' : 'In progress'}
          trend={isAr ? '+2 هذا الأسبوع' : '+2 this week'}
          trendUp
        />
        <KpiCard
          icon={<Users className="h-5 w-5 text-emerald-400" />}
          label={isAr ? 'الموظفون' : 'Employees'}
          value="7/8"
          sub={isAr ? 'حاضر اليوم (86%)' : 'Present today (86%)'}
        />
        <KpiCard
          icon={<Briefcase className="h-5 w-5 text-amber-400" />}
          label={isAr ? 'العملاء النشطون' : 'Active Clients'}
          value="5"
          sub={isAr ? '94% معدل الاحتفاظ' : '94% retention rate'}
          trend={isAr ? 'أعلى من الشهر الماضي' : 'Higher than last month'}
          trendUp
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue Bar Chart */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {isAr ? 'الإيرادات — آخر 6 أشهر' : 'Revenue — Last 6 Months'}
            </h3>
            <span className="text-muted-foreground text-xs">{isAr ? 'مليون د.ع' : 'M IQD'}</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REVENUE_DATA} barCategoryGap="30%">
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
                formatter={(v: number) => [`${v}M د.ع`, isAr ? 'الإيرادات' : 'Revenue']}
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

        {/* Project Status Donut */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold">
            {isAr ? 'حالة المشاريع' : 'Project Status'}
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={STATUS_DATA}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {STATUS_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,10,10,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 12,
                }}
                formatter={(
                  v: number,
                  _: string,
                  p: { payload?: { name?: string; nameEn?: string } },
                ) => [v, isAr ? (p.payload?.name ?? '') : (p.payload?.nameEn ?? '')]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {STATUS_DATA.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground flex-1">{isAr ? s.name : s.nameEn}</span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">
            {isAr ? 'آخر النشاطات' : 'Recent Activity'}
          </h3>
          <div className="space-y-3">
            {ACTIVITY.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-white/[0.06] p-1.5">
                    <Icon className={cn('h-3.5 w-3.5', item.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{isAr ? item.text : item.textEn}</p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {isAr ? item.time : item.timeEn}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold">{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg bg-gradient-to-b p-3 text-center transition-all duration-200',
                    'border border-white/[0.06] hover:border-white/[0.12]',
                    action.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium leading-tight">
                    {isAr ? action.label : action.labelEn}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
