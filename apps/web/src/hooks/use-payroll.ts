'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type PayrollRunStatus = 'DRAFT' | 'FINALIZED' | 'PAID'

export interface PayrollEntry {
  id: string
  employeeId: string
  baseSalary: number
  additions: number
  deductions: number
  netAmount: number
  attendanceDays: number
  lateDays: number
  absentDays: number
  notes: string | null
  employee: {
    id: string
    fullNameAr: string
    fullNameEn: string
    employeeCode: string
  }
}

export interface PayrollRun {
  id: string
  month: number
  year: number
  status: PayrollRunStatus
  totalAmount: number
  currency: string
  finalizedAt: string | null
  processedAt: string | null
  createdAt: string
  entries: PayrollEntry[]
}

export interface GeneratePayrollDto {
  month: number
  year?: number
}

export interface UpdateEntryDto {
  additions?: number
  deductions?: number
  notes?: string
}

const PAYROLL_KEY = 'payroll'

export function usePayrollRuns(year?: number) {
  const params = year ? `?year=${year}` : ''
  return useQuery({
    queryKey: [PAYROLL_KEY, year ?? 'all'],
    queryFn: () => api.get<PayrollRun[]>(`/payroll${params}`),
  })
}

export function usePayrollRun(id: string) {
  return useQuery({
    queryKey: [PAYROLL_KEY, id],
    queryFn: () => api.get<PayrollRun>(`/payroll/${id}`),
    enabled: !!id,
  })
}

export function useGeneratePayroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GeneratePayrollDto) => api.post<PayrollRun>('/payroll/generate', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAYROLL_KEY] }),
  })
}

export function useFinalizePayroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch<PayrollRun>(`/payroll/${id}/finalize`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAYROLL_KEY] }),
  })
}

export function useMarkPayrollPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch<PayrollRun>(`/payroll/${id}/mark-paid`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAYROLL_KEY] }),
  })
}

export function useUpdatePayrollEntry(runId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ entryId, ...body }: UpdateEntryDto & { entryId: string }) =>
      api.patch<PayrollEntry>(`/payroll/entries/${entryId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAYROLL_KEY, runId] })
      qc.invalidateQueries({ queryKey: [PAYROLL_KEY] })
    },
  })
}
