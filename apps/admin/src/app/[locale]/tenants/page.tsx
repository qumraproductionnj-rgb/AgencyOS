'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { AdminLayout } from '@/components/admin-layout'

interface Tenant {
  id: string
  name: string
  nameEn: string | null
  slug: string
  createdAt: string
  subscription: {
    status: string
    plan: { key: string; nameEn: string }
  } | null
  _count: { users: number; projects: number; clients: number }
}

interface TenantsResponse {
  items: Tenant[]
  nextCursor: string | null
}

const STATUSES = ['', 'TRIAL', 'ACTIVE', 'PAST_DUE', 'READ_ONLY', 'SUSPENDED', 'CANCELLED']

export default function TenantsListPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const { data, isLoading } = useQuery<TenantsResponse>({
    queryKey: ['platform-tenants', search, status],
    queryFn: () =>
      apiClient(
        `/platform/admin/tenants?${new URLSearchParams({
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        }).toString()}`,
      ),
  })

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold">Tenants</h1>

      <div className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Search by name, slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-input bg-background h-10 flex-1 rounded-md border px-3 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium">Company</th>
                <th className="p-3 text-left font-medium">Plan</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Users</th>
                <th className="p-3 text-left font-medium">Projects</th>
                <th className="p-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data?.items ?? []).map((t: Tenant) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="p-3">
                    <Link href={`/tenants/${t.id}`} className="font-medium hover:underline">
                      {t.nameEn ?? t.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">{t.slug}</p>
                  </td>
                  <td className="p-3">{t.subscription?.plan.nameEn ?? '—'}</td>
                  <td className="p-3">
                    <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                      {t.subscription?.status ?? 'NO_SUB'}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{t._count.users}</td>
                  <td className="p-3 font-mono">{t._count.projects}</td>
                  <td className="text-muted-foreground p-3">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted-foreground p-6 text-center">
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
