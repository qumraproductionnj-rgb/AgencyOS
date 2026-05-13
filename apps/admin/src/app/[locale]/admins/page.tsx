'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { AdminLayout } from '@/components/admin-layout'

interface PlatformAdmin {
  id: string
  email: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

export default function AdminsListPage() {
  const { data, isLoading } = useQuery<PlatformAdmin[]>({
    queryKey: ['platform-admins'],
    queryFn: () => apiClient('/platform/admin/admins'),
  })

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold">Platform Admins</h1>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Last login</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data ?? []).map((a: PlatformAdmin) => (
                <tr key={a.id}>
                  <td className="p-3 font-medium">{a.email}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {a.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="text-muted-foreground p-3">
                    {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="text-muted-foreground p-3">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted-foreground p-6 text-center">
                    No platform admins yet
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
