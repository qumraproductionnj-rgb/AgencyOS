'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PortalLayout } from '@/components/portal-layout'

interface DashboardData {
  projectsCount: number
  pendingReviewCount: number
  projects: { id: string; name: string; stage: string; deadline: string }[]
  pendingFiles: { id: string; originalName: string; mimeType: string; createdAt: string }[]
  invoices: {
    id: string
    number: string
    total: number
    currency: string
    status: string
    dueDate: string
  }[]
  contentPieces: { id: string; title: string; type: string; stage: string }[]
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['portal-dashboard'],
    queryFn: () => apiClient('/portal/dashboard'),
  })

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="text-muted-foreground flex h-64 items-center justify-center">
          Loading...
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">{t('projectsCount')}</p>
          <p className="mt-1 text-3xl font-bold">{data?.projectsCount ?? 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">{t('pendingReview')}</p>
          <p className="mt-1 text-3xl font-bold">{data?.pendingReviewCount ?? 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">{t('pendingContent')}</p>
          <p className="mt-1 text-3xl font-bold">{data?.contentPieces.length ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border">
          <div className="border-b p-4">
            <h2 className="font-semibold">{t('projectsCount')}</h2>
          </div>
          <div className="divide-y">
            {data?.projects.length === 0 && (
              <p className="text-muted-foreground p-4 text-sm">{t('noProjects')}</p>
            )}
            {data?.projects.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/projects`}
                className="hover:bg-muted/50 flex items-center justify-between p-4 transition-colors"
              >
                <span className="text-sm font-medium">{p.name}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    p.stage === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700',
                  )}
                >
                  {p.stage}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b p-4">
            <h2 className="font-semibold">{t('recentInvoices')}</h2>
          </div>
          <div className="divide-y">
            {data?.invoices.length === 0 && (
              <p className="text-muted-foreground p-4 text-sm">{t('noInvoices')}</p>
            )}
            {data?.invoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{inv.number}</p>
                  <p className="text-muted-foreground text-xs">
                    {inv.currency} {Number(inv.total).toLocaleString()}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    inv.status === 'PAID'
                      ? 'bg-green-100 text-green-700'
                      : inv.status === 'OVERDUE'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700',
                  )}
                >
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
