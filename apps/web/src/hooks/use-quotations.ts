'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface QuotationItem {
  description: string
  quantity: number
  unitPrice: number
  currency: string
  total: number
}

export interface Quotation {
  id: string
  companyId: string
  clientId: string
  dealId: string | null
  number: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  items: QuotationItem[]
  subtotal: number
  discountPercent: number | null
  discountAmount: number | null
  taxPercent: number | null
  taxAmount: number | null
  total: number
  currency: string
  notes: string | null
  validUntil: string | null
  sentAt: string | null
  acceptedAt: string | null
  createdAt: string
  client: { id: string; name: string; nameEn?: string | null }
  deal?: { id: string; name: string } | null
}

export interface CreateQuotationDto {
  clientId: string
  dealId?: string
  items: QuotationItem[]
  currency?: string
  discountPercent?: number
  discountAmount?: number
  taxPercent?: number
  validUntil?: string
  notes?: string
}

export interface UpdateQuotationDto {
  items?: QuotationItem[]
  currency?: string
  discountPercent?: number
  discountAmount?: number
  taxPercent?: number
  validUntil?: string
  notes?: string
}

export interface QuotationsQuery {
  search?: string
  status?: string
}

const QUOTATIONS_KEY = 'quotations'

export function useQuotations(query?: QuotationsQuery) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.status) params.set('status', query.status)
  const qs = params.toString()

  return useQuery({
    queryKey: [QUOTATIONS_KEY, qs],
    queryFn: () => api.get<Quotation[]>(`/quotations${qs ? `?${qs}` : ''}`),
  })
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: [QUOTATIONS_KEY, id],
    queryFn: () => api.get<Quotation>(`/quotations/${id}`),
    enabled: !!id,
  })
}

export function useCreateQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateQuotationDto) => api.post<Quotation>('/quotations', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUOTATIONS_KEY] }),
  })
}

export function useUpdateQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateQuotationDto & { id: string }) =>
      api.put<Quotation>(`/quotations/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUOTATIONS_KEY] }),
  })
}

export function useUpdateQuotationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string
      status: string
      rejectionReason?: string
    }) =>
      api.patch<Quotation>(`/quotations/${id}/status`, {
        status,
        ...(rejectionReason ? { rejectionReason } : {}),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUOTATIONS_KEY] }),
  })
}

export function useDeleteQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/quotations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUOTATIONS_KEY] }),
  })
}

export function useClientsList() {
  return useQuery({
    queryKey: ['clients-list'],
    queryFn: () => api.get<{ id: string; name: string; nameEn?: string | null }[]>('/clients'),
  })
}
