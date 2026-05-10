'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  currency: string
  total: number
}

export interface Payment {
  id: string
  amount: number
  currency: string
  method: string
  referenceNo: string | null
  paidAt: string
  notes: string | null
  createdAt: string
}

export interface Invoice {
  id: string
  companyId: string
  clientId: string
  number: string
  status: 'DRAFT' | 'SENT' | 'OVERDUE' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  type: string
  items: InvoiceItem[]
  subtotal: number
  discountPercent: number | null
  discountAmount: number | null
  taxPercent: number | null
  taxAmount: number | null
  total: number
  paidAmount: number
  balanceDue: number
  currency: string
  dueDate: string
  notes: string | null
  pdfUrl: string | null
  createdAt: string
  client: { id: string; name: string; nameEn?: string | null }
  quotation?: { id: string; number: string } | null
  payments?: Payment[]
}

export interface CreateInvoiceDto {
  clientId: string
  projectId?: string
  quotationId?: string
  items: InvoiceItem[]
  currency?: string
  discountPercent?: number
  discountAmount?: number
  taxPercent?: number
  dueDate: string
  notes?: string
  type?: string
}

export interface UpdateInvoiceDto {
  items?: InvoiceItem[]
  currency?: string
  discountPercent?: number
  discountAmount?: number
  taxPercent?: number
  dueDate?: string
  notes?: string
}

export interface RecordPaymentDto {
  amount: number
  currency: string
  method: string
  referenceNo?: string
  paidAt: string
  notes?: string
}

const INVOICES_KEY = 'invoices'

export function useInvoices(query?: { search?: string; status?: string }) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.status) params.set('status', query.status)
  const qs = params.toString()

  return useQuery({
    queryKey: [INVOICES_KEY, qs],
    queryFn: () => api.get<Invoice[]>(`/invoices${qs ? `?${qs}` : ''}`),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [INVOICES_KEY, id],
    queryFn: () => api.get<Invoice>(`/invoices/${id}`),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateInvoiceDto) => api.post<Invoice>('/invoices', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateInvoiceDto & { id: string }) =>
      api.put<Invoice>(`/invoices/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  })
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Invoice>(`/invoices/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  })
}

export function useSendInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch<Invoice>(`/invoices/${id}/send`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: RecordPaymentDto & { id: string }) =>
      api.post<Payment>(`/invoices/${id}/payments`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/invoices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  })
}

export function useClientsList() {
  return useQuery({
    queryKey: ['clients-list'],
    queryFn: () => api.get<{ id: string; name: string; nameEn?: string | null }[]>('/clients'),
  })
}
