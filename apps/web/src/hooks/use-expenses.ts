'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Expense {
  id: string
  employeeId: string
  category: string
  amount: number
  currency: string
  description: string
  receiptUrl: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED'
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  expenseDate: string
  createdAt: string
  employee: { id: string; fullNameAr: string; fullNameEn?: string | null }
  approver?: { id: string; email: string } | null
}

export interface CreateExpenseDto {
  employeeId: string
  projectId?: string
  category: string
  amount: number
  currency?: string
  description: string
  receiptUrl?: string
  expenseDate: string
}

export interface UpdateExpenseDto {
  category?: string
  amount?: number
  currency?: string
  description?: string
  receiptUrl?: string
  expenseDate?: string
}

const EXPENSES_KEY = 'expenses'

export function useExpenses(query?: { search?: string; status?: string; category?: string }) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.status) params.set('status', query.status)
  if (query?.category) params.set('category', query.category)
  const qs = params.toString()

  return useQuery({
    queryKey: [EXPENSES_KEY, qs],
    queryFn: () => api.get<Expense[]>(`/expenses${qs ? `?${qs}` : ''}`),
  })
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: [EXPENSES_KEY, id],
    queryFn: () => api.get<Expense>(`/expenses/${id}`),
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateExpenseDto) => api.post<Expense>('/expenses', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateExpenseDto & { id: string }) =>
      api.put<Expense>(`/expenses/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
  })
}

export function useApproveExpense() {
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
      api.patch<Expense>(`/expenses/${id}/status`, {
        status,
        ...(rejectionReason ? { rejectionReason } : {}),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/expenses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
  })
}

export function useEmployeesList() {
  return useQuery({
    queryKey: ['employees-list'],
    queryFn: () =>
      api.get<{ id: string; fullNameAr: string; fullNameEn?: string | null }[]>('/employees'),
  })
}
