'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { AdminLayout } from '@/components/admin-layout'

interface TenantDetail {
  company: {
    id: string
    name: string
    nameEn: string | null
    slug: string
    address: string | null
    phone: string | null
    website: string | null
    createdAt: string
    subscription: {
      status: string
      planId: string
      trialEndsAt: string | null
      currentPeriodEnd: string | null
      billingInterval: string | null
      plan: { key: string; nameEn: string }
    } | null
    _count: Record<string, number>
  }
  recentPayments: {
    id: string
    provider: string
    amount: string
    currency: string
    status: string
    createdAt: string
  }[]
}

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [extendDays, setExtendDays] = useState(7)
  const [actionError, setActionError] = useState('')

  const { data, isLoading } = useQuery<TenantDetail>({
    queryKey: ['platform-tenant', params.id],
    queryFn: () => apiClient(`/platform/admin/tenants/${params.id}`),
  })

  const extendTrial = useMutation({
    mutationFn: () =>
      apiClient(`/lifecycle/${params.id}/extend-trial`, {
        method: 'POST',
        body: { days: extendDays },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-tenant', params.id] }),
    onError: (err: Error) => setActionError(err.message),
  })

  const suspend = useMutation({
    mutationFn: () => apiClient(`/lifecycle/${params.id}/suspend`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-tenant', params.id] }),
    onError: (err: Error) => setActionError(err.message),
  })

  const reactivate = useMutation({
    mutationFn: () => apiClient(`/lifecycle/${params.id}/reactivate`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-tenant', params.id] }),
    onError: (err: Error) => setActionError(err.message),
  })

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="text-muted-foreground">Loading...</div>
      </AdminLayout>
    )
  }

  const c = data.company
  const sub = c.subscription

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{c.nameEn ?? c.name}</h1>
        <p className="text-muted-foreground text-sm">{c.slug}</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Field label="Status" value={sub?.status ?? 'NO_SUB'} />
        <Field label="Plan" value={sub?.plan.nameEn ?? '—'} />
        <Field label="Billing" value={sub?.billingInterval ?? '—'} />
        <Field
          label="Trial ends"
          value={sub?.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : '—'}
        />
        <Field
          label="Period ends"
          value={sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '—'}
        />
        <Field label="Joined" value={new Date(c.createdAt).toLocaleDateString()} />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {Object.entries(c._count).map(([k, v]) => (
          <div key={k} className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs uppercase">{k}</p>
            <p className="font-mono text-2xl font-bold">{v as number}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-3 font-semibold">Manual Actions</h2>
        {actionError && <p className="text-destructive mb-2 text-sm">{actionError}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={1}
            max={90}
            value={extendDays}
            onChange={(e) => setExtendDays(parseInt(e.target.value, 10) || 7)}
            className="border-input bg-background h-9 w-20 rounded-md border px-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setActionError('')
              extendTrial.mutate()
            }}
            disabled={extendTrial.isPending}
            className="h-9 rounded-md bg-blue-600 px-3 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Extend trial (days)
          </button>
          <button
            type="button"
            onClick={() => {
              setActionError('')
              suspend.mutate()
            }}
            disabled={suspend.isPending}
            className="h-9 rounded-md bg-red-600 px-3 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            Suspend
          </button>
          <button
            type="button"
            onClick={() => {
              setActionError('')
              reactivate.mutate()
            }}
            disabled={reactivate.isPending}
            className="h-9 rounded-md bg-green-600 px-3 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            Reactivate
          </button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Recent Payments</h2>
        </div>
        <div className="divide-y">
          {data.recentPayments.length === 0 && (
            <p className="text-muted-foreground p-4 text-sm">No payment intents yet.</p>
          )}
          {data.recentPayments.map((p: TenantDetail['recentPayments'][number]) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">
                  {Number(p.amount).toLocaleString()} {p.currency}
                </p>
                <p className="text-muted-foreground text-xs">
                  {p.provider} · {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="bg-muted rounded-full px-2 py-0.5 text-xs">{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs uppercase">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}
