'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface ContentPillar {
  id: string
  companyId: string
  clientId: string
  nameAr: string
  nameEn: string | null
  description: string | null
  percentageTarget: number
  exampleTopics: string[]
  recommendedFormats: string[]
  color: string | null
  icon: string | null
  createdAt: string
}

export function useContentPillars(query?: { clientId?: string }) {
  const params = new URLSearchParams()
  if (query?.clientId) params.set('clientId', query.clientId)
  const qs = params.toString()

  return useQuery({
    queryKey: ['content-pillars', qs],
    queryFn: () => api.get<ContentPillar[]>(`/content-pillars${qs ? `?${qs}` : ''}`),
  })
}

export function useContentPillar(id: string) {
  return useQuery({
    queryKey: ['content-pillars', id],
    queryFn: () => api.get<ContentPillar>(`/content-pillars/${id}`),
    enabled: !!id,
  })
}
