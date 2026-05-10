'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'

export interface LeadDeal {
  id: string
  name: string
  value: number | null
  currency: string | null
  stage: string
}

export interface Lead {
  id: string
  companyId: string
  name: string
  companyName: string | null
  email: string | null
  phone: string | null
  source: string | null
  status: LeadStatus
  assignedTo: string | null
  notes: string | null
  convertedAt: string | null
  convertedToClientId: string | null
  convertedToDealId: string | null
  createdAt: string
  updatedAt: string
  assignee: { id: string; email: string } | null
  deals: LeadDeal[]
}

export interface CreateLeadDto {
  name: string
  companyName?: string
  email?: string
  phone?: string
  source?: string
  notes?: string
}

export interface UpdateLeadDto {
  name?: string
  companyName?: string
  email?: string
  phone?: string
  source?: string
  notes?: string
  assignedTo?: string | null
}

export interface LeadsQuery {
  search?: string
  status?: LeadStatus
}

const LEADS_KEY = 'leads'

export function useLeads(query?: LeadsQuery) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.status) params.set('status', query.status)
  const qs = params.toString()

  return useQuery({
    queryKey: [LEADS_KEY, qs],
    queryFn: () => api.get<Lead[]>(`/leads${qs ? `?${qs}` : ''}`),
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: [LEADS_KEY, id],
    queryFn: () => api.get<Lead>(`/leads/${id}`),
    enabled: !!id,
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateLeadDto) => api.post<Lead>('/leads', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
  })
}

export function useUpdateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateLeadDto & { id: string }) =>
      api.put<Lead>(`/leads/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
  })
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      api.patch<Lead>(`/leads/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
  })
}
