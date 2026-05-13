'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Exhibition {
  id: string
  name: string
  locationAddress: string | null
  city: string | null
  country: string | null
  startDate: string
  endDate: string
  organizingClientId: string | null
  managerId: string | null
  status: string
  manager?: { employee: { fullNameAr: string; fullNameEn: string } | null } | null
  booths?: ExhibitionBooth[]
  financials?: ExhibitionFinancial[]
  settlement?: ExhibitionSettlement | null
  _count?: { booths: number; financials: number }
}

export interface ExhibitionBooth {
  id: string
  exhibitionId: string
  brandName: string
  brandLogoUrl: string | null
  boothNumber: string | null
  boothSize: string | null
  clientCompanyId: string | null
  designStatus: string
  setupStatus: string
  dailyVisitorsCount: unknown
  notes: string | null
  inventory?: BoothInventory[]
  _count?: { inventory: number }
}

export interface BoothInventory {
  id: string
  boothId: string
  itemName: string
  category: string
  quantitySent: number
  quantityConsumed: number
  quantityReturned: number
  quantityDamaged: number
  unitCost: number | null
  currency: string | null
  totalCost: number | null
  notes: string | null
}

export interface ExhibitionFinancial {
  id: string
  exhibitionId: string
  type: string
  category: string
  description: string | null
  amount: number
  currency: string
  transactionDate: string
  receiptUrl: string | null
  recorder?: { employee: { fullNameAr: string } | null } | null
}

export interface ExhibitionSettlement {
  id: string
  exhibitionId: string
  totalIncomeIqd: number
  totalIncomeUsd: number
  totalExpenseIqd: number
  totalExpenseUsd: number
  netProfitIqd: number
  netProfitUsd: number
  clientOutstanding: unknown
  settledAt: string
  settledBy: string | null
}

interface PaginatedExhibitions {
  items: Exhibition[]
  nextCursor: string | null
}

const KEY = 'exhibitions'

export function useExhibitions(params?: {
  status?: string
  search?: string
  limit?: number
  cursor?: string
}) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.search) qs.set('search', params.search)
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.cursor) qs.set('cursor', params.cursor)
  const query = qs.toString()

  return useQuery({
    queryKey: [KEY, 'list', query],
    queryFn: () => api.get<PaginatedExhibitions>(`/exhibitions${query ? `?${query}` : ''}`),
  })
}

export function useExhibition(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Exhibition>(`/exhibitions/${id}`),
    enabled: !!id,
  })
}

export function useCreateExhibition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Exhibition>('/exhibitions', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateExhibition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.put<Exhibition>(`/exhibitions/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateExhibitionStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Exhibition>(`/exhibitions/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteExhibition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/exhibitions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

// ---- Booths ----

export function useBooths(exhibitionId: string) {
  return useQuery({
    queryKey: [KEY, 'booths', exhibitionId],
    queryFn: () => api.get<ExhibitionBooth[]>(`/exhibitions/${exhibitionId}/booths`),
    enabled: !!exhibitionId,
  })
}

export function useCreateBooth() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ exhibitionId, data }: { exhibitionId: string; data: Record<string, unknown> }) =>
      api.post<ExhibitionBooth>(`/exhibitions/${exhibitionId}/booths`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'booths'] }),
  })
}

export function useUpdateBooth() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      exhibitionId,
      boothId,
      data,
    }: {
      exhibitionId: string
      boothId: string
      data: Record<string, unknown>
    }) => api.put<ExhibitionBooth>(`/exhibitions/${exhibitionId}/booths/${boothId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'booths'] }),
  })
}

export function useDeleteBooth() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ exhibitionId, boothId }: { exhibitionId: string; boothId: string }) =>
      api.del(`/exhibitions/${exhibitionId}/booths/${boothId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'booths'] }),
  })
}

// ---- Inventory ----

export function useInventory(exhibitionId: string, boothId: string) {
  return useQuery({
    queryKey: [KEY, 'inventory', boothId],
    queryFn: () =>
      api.get<BoothInventory[]>(`/exhibitions/${exhibitionId}/booths/${boothId}/inventory`),
    enabled: !!exhibitionId && !!boothId,
  })
}

export function useCreateInventory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      exhibitionId,
      boothId,
      data,
    }: {
      exhibitionId: string
      boothId: string
      data: Record<string, unknown>
    }) =>
      api.post<BoothInventory>(`/exhibitions/${exhibitionId}/booths/${boothId}/inventory`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'inventory'] }),
  })
}

export function useUpdateInventory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      exhibitionId,
      boothId,
      inventoryId,
      data,
    }: {
      exhibitionId: string
      boothId: string
      inventoryId: string
      data: Record<string, unknown>
    }) =>
      api.put<BoothInventory>(
        `/exhibitions/${exhibitionId}/booths/${boothId}/inventory/${inventoryId}`,
        data,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'inventory'] }),
  })
}

export function useDeleteInventory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      exhibitionId,
      boothId,
      inventoryId,
    }: {
      exhibitionId: string
      boothId: string
      inventoryId: string
    }) => api.del(`/exhibitions/${exhibitionId}/booths/${boothId}/inventory/${inventoryId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'inventory'] }),
  })
}

// ---- Financials ----

export function useFinancials(exhibitionId: string) {
  return useQuery({
    queryKey: [KEY, 'financials', exhibitionId],
    queryFn: () => api.get<ExhibitionFinancial[]>(`/exhibitions/${exhibitionId}/financials`),
    enabled: !!exhibitionId,
  })
}

export function useCreateFinancial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ exhibitionId, data }: { exhibitionId: string; data: Record<string, unknown> }) =>
      api.post<ExhibitionFinancial>(`/exhibitions/${exhibitionId}/financials`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'financials'] }),
  })
}

export function useUpdateFinancial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      exhibitionId,
      financialId,
      data,
    }: {
      exhibitionId: string
      financialId: string
      data: Record<string, unknown>
    }) =>
      api.put<ExhibitionFinancial>(`/exhibitions/${exhibitionId}/financials/${financialId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'financials'] }),
  })
}

export function useDeleteFinancial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ exhibitionId, financialId }: { exhibitionId: string; financialId: string }) =>
      api.del(`/exhibitions/${exhibitionId}/financials/${financialId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'financials'] }),
  })
}

// ---- Settlement ----

export function useSettlement(exhibitionId: string) {
  return useQuery({
    queryKey: [KEY, 'settlement', exhibitionId],
    queryFn: () =>
      api.get<{ settlement: ExhibitionSettlement | null; summary: Record<string, unknown> | null }>(
        `/exhibitions/${exhibitionId}/settlement`,
      ),
    enabled: !!exhibitionId,
  })
}

export function useCreateSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (exhibitionId: string) =>
      api.post<ExhibitionSettlement>(`/exhibitions/${exhibitionId}/settle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
