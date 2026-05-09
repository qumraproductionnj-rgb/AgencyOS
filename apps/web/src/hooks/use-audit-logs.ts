'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface AuditLog {
  id: string
  action: string
  entityType: string | null
  entityId: string | null
  userId: string | null
  user: { id: string; email: string } | null
  ipAddress: string | null
  userAgent: string | null
  changes: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

interface AuditLogResponse {
  items: AuditLog[]
  nextCursor: string | null
}

const KEY = 'audit-logs'

export function useAuditLogs(filters?: { entityType?: string; limit?: number }) {
  const params = new URLSearchParams()
  if (filters?.entityType) params.set('entityType', filters.entityType)
  if (filters?.limit) params.set('limit', String(filters.limit))
  const qs = params.toString()
  return useQuery({
    queryKey: [KEY, qs],
    queryFn: () => api.get<AuditLogResponse>(`/audit-logs${qs ? `?${qs}` : ''}`),
  })
}
