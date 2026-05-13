'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { AdminLayout } from '@/components/admin-layout'

interface PlatformStats {
  totalTenants: number
  activeUsersLast30d: number
  paidSubscriptions: number
  mrrCents: number
  mrrUsd: number
  churnRatePct: number
  churnedLast30d: number
  statusBreakdown: Record<string, number>
}

const STATUS_TONE: Record<string, string> = {
  TRIAL: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAST_DUE: 'bg-amber-100 text-amber-700',
  READ_ONLY: 'bg-orange-100 text-orange-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
  EXPIRED: 'bg-gray-100 text-gray-700',
  ANONYMIZED: 'bg-gray-200 text-gray-500',
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<PlatformStats>({
    queryKey: ['platform-stats'],
    queryFn: () => apiClient('/platform/admin/stats'),
  })

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold">Platform Overview</h1>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total tenants" value={data?.totalTenants ?? 0} />
            <StatCard label="MRR (USD)" value={`$${data?.mrrUsd ?? 0}`} />
            <StatCard label="Active users (30d)" value={data?.activeUsersLast30d ?? 0} />
            <StatCard
              label="Churn (30d)"
              value={`${data?.churnRatePct ?? 0}%`}
              subtitle={`${data?.churnedLast30d ?? 0} lost`}
            />
          </div>

          <div className="rounded-lg border">
            <div className="border-b p-4">
              <h2 className="font-semibold">Subscription Status Breakdown</h2>
            </div>
            <div className="divide-y">
              {Object.entries(data?.statusBreakdown ?? {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${STATUS_TONE[status] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {status}
                  </span>
                  <span className="font-mono text-sm">{count as number}</span>
                </div>
              ))}
              {Object.keys(data?.statusBreakdown ?? {}).length === 0 && (
                <p className="text-muted-foreground p-4 text-sm">No subscriptions yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link href="/tenants" className="text-primary text-sm hover:underline">
              View all tenants →
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string
  value: string | number
  subtitle?: string
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>}
    </div>
  )
}
