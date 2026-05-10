'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Campaign {
  id: string
  clientId: string
  name: string
  nameEn: string | null
  description: string | null
  budget: number
  currency: string
  startDate: string
  endDate: string
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  client: { id: string; name: string; nameEn: string | null }
  _count?: { projects: number }
  projects?: { id: string; name: string; stage: string; createdAt: string }[]
}

export interface CreateCampaignDto {
  clientId: string
  name: string
  nameEn?: string
  description?: string
  budget?: number
  currency?: string
  startDate: string
  endDate: string
}

export interface UpdateCampaignDto {
  name?: string
  nameEn?: string
  description?: string
  budget?: number
  currency?: string
  startDate?: string
  endDate?: string
}

const CAMPAIGNS_KEY = 'campaigns'

export function useCampaigns(query?: { search?: string; status?: string; clientId?: string }) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.status) params.set('status', query.status)
  if (query?.clientId) params.set('clientId', query.clientId)
  const qs = params.toString()

  return useQuery({
    queryKey: [CAMPAIGNS_KEY, qs],
    queryFn: () => api.get<Campaign[]>(`/campaigns${qs ? `?${qs}` : ''}`),
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, id],
    queryFn: () => api.get<Campaign>(`/campaigns/${id}`),
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCampaignDto) => api.post<Campaign>('/campaigns', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] }),
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateCampaignDto & { id: string }) =>
      api.put<Campaign>(`/campaigns/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] }),
  })
}

export function useUpdateCampaignStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Campaign>(`/campaigns/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] }),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/campaigns/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] }),
  })
}

export function useClientsList() {
  return useQuery({
    queryKey: ['clients-list'],
    queryFn: () => api.get<{ id: string; name: string; nameEn?: string | null }[]>('/clients'),
  })
}
