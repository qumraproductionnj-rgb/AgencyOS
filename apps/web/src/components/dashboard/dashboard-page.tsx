'use client'

import { useTranslations } from 'next-intl'
import { useDashboard } from '@/hooks/use-dashboard'
import { DollarSign, FolderOpen, Clock, Users, FileText, TrendingUp, Award } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-lg border p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>}
        </div>
        <div className={`rounded-full p-2.5 ${color}`}>{icon}</div>
      </div>
    </div>
  )
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'IQD') return `${amount.toLocaleString()} د.ع`
  return `$${amount.toLocaleString()}`
}

export function DashboardPage() {
  const t = useTranslations('dashboard')
  const { data, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('loading')}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('error')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard
          title={t('revenueThisMonth')}
          value={formatCurrency(data.revenueThisMonth.iqd, 'IQD')}
          {...(data.revenueThisMonth.usd > 0
            ? { subtitle: formatCurrency(data.revenueThisMonth.usd, 'USD') }
            : {})}
          icon={<DollarSign className="h-5 w-5 text-green-700" />}
          color="bg-green-100"
        />

        <StatCard
          title={t('activeProjects')}
          value={data.activeProjects}
          icon={<FolderOpen className="h-5 w-5 text-blue-700" />}
          color="bg-blue-100"
        />

        <StatCard
          title={t('overdueTasks')}
          value={data.overdueTasks}
          icon={<Clock className="h-5 w-5 text-orange-700" />}
          color="bg-orange-100"
        />

        <StatCard
          title={t('pendingInvoices')}
          value={data.pendingInvoices}
          icon={<FileText className="h-5 w-5 text-purple-700" />}
          color="bg-purple-100"
        />

        <StatCard
          title={t('pipelineValue')}
          value={formatCurrency(data.pipelineValue.iqd, 'IQD')}
          {...(data.pipelineValue.usd > 0
            ? { subtitle: formatCurrency(data.pipelineValue.usd, 'USD') }
            : {})}
          icon={<TrendingUp className="h-5 w-5 text-cyan-700" />}
          color="bg-cyan-100"
        />

        <StatCard
          title={t('todayAttendance')}
          value={`${data.todayAttendance.present + data.todayAttendance.remote}`}
          subtitle={t('lateCount', { count: data.todayAttendance.late })}
          icon={<Users className="h-5 w-5 text-indigo-700" />}
          color="bg-indigo-100"
        />
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-5 py-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Award className="h-5 w-5 text-yellow-600" />
            {t('topPerformers')}
          </h2>
        </div>
        {data.topPerformers.length === 0 ? (
          <p className="text-muted-foreground p-6 text-center text-sm">{t('noData')}</p>
        ) : (
          <div className="divide-y">
            {data.topPerformers.map((p, i) => (
              <div key={p.userId} className="flex items-center justify-between px-5 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {i + 1}
                  </span>
                  <span className="font-medium">{p.email}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {t('completedTasks', { count: p.completedTasks })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
