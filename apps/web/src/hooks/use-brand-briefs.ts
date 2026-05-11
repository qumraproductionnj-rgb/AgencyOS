'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface BrandBrief {
  id: string
  companyId: string
  clientId: string
  brandName: string
  brandNameEn: string | null
  client?: { id: string; name: string; nameEn: string | null }
  personas?: AudiencePersona[]
}

export interface AudiencePersona {
  id: string
  name: string
  nameEn: string | null
  ageRange: string | null
  gender: string | null
  occupation: string | null
  interests: string[]
  painPoints: string[]
  platforms: string[]
}

export function useBrandBriefs(query?: { clientId?: string }) {
  const params = new URLSearchParams()
  if (query?.clientId) params.set('clientId', query.clientId)
  const qs = params.toString()

  return useQuery({
    queryKey: ['brand-briefs', qs],
    queryFn: () => api.get<BrandBrief[]>(`/brand-briefs${qs ? `?${qs}` : ''}`),
  })
}

export function useBrandBrief(id: string) {
  return useQuery({
    queryKey: ['brand-briefs', id],
    queryFn: () => api.get<BrandBrief>(`/brand-briefs/${id}`),
    enabled: !!id,
  })
}
