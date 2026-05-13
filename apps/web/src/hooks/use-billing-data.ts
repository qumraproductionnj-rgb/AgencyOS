'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface UsageData {
  plan: { key: string; nameEn: string }
  metrics: Record<string, { current: number; limit: number; percent: number }>
}

export interface InvoiceRecord {
  id: string
  source: 'stripe' | 'iqd'
  amount: number
  currency: string
  status: string
  paidAt: string | null
  hostedUrl: string | null
  pdfUrl: string | null
}

export function useUsage() {
  return useQuery({
    queryKey: ['billing-usage'],
    queryFn: () => api.get<UsageData>('/billing/usage'),
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: ['billing-invoices'],
    queryFn: () => api.get<InvoiceRecord[]>('/billing/invoices'),
  })
}
