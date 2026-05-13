'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface ReportRange {
  from?: string
  to?: string
}

function qs(range: ReportRange): string {
  const params: Record<string, string> = {}
  if (range.from) params['from'] = range.from
  if (range.to) params['to'] = range.to
  const s = new URLSearchParams(params).toString()
  return s ? `?${s}` : ''
}

export function useFinancialReport(range: ReportRange) {
  return useQuery({
    queryKey: ['report-financial', range],
    queryFn: () => api.get(`/reports/financial${qs(range)}`),
  })
}
export function useOperationsReport(range: ReportRange) {
  return useQuery({
    queryKey: ['report-operations', range],
    queryFn: () => api.get(`/reports/operations${qs(range)}`),
  })
}
export function useHrReport(range: ReportRange) {
  return useQuery({
    queryKey: ['report-hr', range],
    queryFn: () => api.get(`/reports/hr${qs(range)}`),
  })
}
export function useSalesReport(range: ReportRange) {
  return useQuery({
    queryKey: ['report-sales', range],
    queryFn: () => api.get(`/reports/sales${qs(range)}`),
  })
}
