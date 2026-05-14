'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { Users, Building2, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1'

interface Stats {
  totalCompanies: number
  activeCompanies: number
  totalUsers: number
  betaInvitesSent: number
  betaInvitesAccepted: number
  signupsByDay: { date: string; count: number }[]
}

const MOCK_STATS: Stats = {
  totalCompanies: 3,
  activeCompanies: 2,
  totalUsers: 12,
  betaInvitesSent: 8,
  betaInvitesAccepted: 3,
  signupsByDay: [
    { date: '05-09', count: 1 },
    { date: '05-10', count: 0 },
    { date: '05-11', count: 2 },
    { date: '05-12', count: 0 },
    { date: '05-13', count: 1 },
    { date: '05-14', count: 0 },
    { date: '05-15', count: 2 },
  ],
}

export default function AdminPage() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [stats, setStats] = useState<Stats>(MOCK_STATS)

  useEffect(() => {
    fetch(`${API}/platform-admin/stats`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.totalCompanies !== undefined) setStats(d)
      })
      .catch(() => {
        /* best-effort */
      })
  }, [])

  const kpis = [
    {
      icon: Building2,
      label: isAr ? 'إجمالي الشركات' : 'Total Companies',
      value: stats.totalCompanies,
      color: 'text-sky-400',
    },
    {
      icon: Activity,
      label: isAr ? 'شركات نشطة' : 'Active Companies',
      value: stats.activeCompanies,
      color: 'text-emerald-400',
    },
    {
      icon: Users,
      label: isAr ? 'إجمالي المستخدمين' : 'Total Users',
      value: stats.totalUsers,
      color: 'text-purple-400',
    },
    {
      icon: TrendingUp,
      label: isAr ? 'دعوات Beta' : 'Beta Invites',
      value: `${stats.betaInvitesAccepted}/${stats.betaInvitesSent}`,
      color: 'text-amber-400',
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{isAr ? 'لوحة الإدارة العامة' : 'Platform Admin'}</h1>
        <Link
          href={`/${locale}/admin/beta`}
          className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          {isAr ? 'إدارة Beta →' : 'Beta Management →'}
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-white/50">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Signups chart */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold text-white/70">
          {isAr ? 'التسجيلات آخر 7 أيام' : 'Signups Last 7 Days'}
        </h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={stats.signupsByDay}>
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#111',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ fill: '#a78bfa', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Beta funnel */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold text-white/70">
          {isAr ? 'قمع Beta' : 'Beta Funnel'}
        </h2>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart
            data={[
              { name: isAr ? 'مرسلة' : 'Sent', value: stats.betaInvitesSent },
              { name: isAr ? 'مقبولة' : 'Accepted', value: stats.betaInvitesAccepted },
              { name: isAr ? 'نشطة' : 'Active', value: stats.activeCompanies },
            ]}
            layout="vertical"
          >
            <XAxis
              type="number"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: '#111',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
