'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Employee {
  id: string
  userId: string
  employeeCode: string
  fullNameAr: string
  fullNameEn: string | null
  email: string
  phone: string | null
  position: string | null
  departmentId: string | null
  department: { id: string; nameAr: string; nameEn: string | null } | null
  employmentType: string
  status: string
  startDate: string
  createdAt: string
}

export interface EmployeeDetail extends Employee {
  nationalId: string | null
  salaryAmount: number
  salaryCurrency: string
  salaryType: string
  scheduledStartTime: string
  scheduledEndTime: string
  weeklyOffDays: string[]
  endDate: string | null
  notesInternal: string | null
  user: { emailVerifiedAt: string | null; isActive: boolean }
}

interface EmployeeFilters {
  departmentId?: string | undefined
  status?: string | undefined
  search?: string | undefined
}

const EMPLOYEES_KEY = 'employees'

export function useEmployees(filters?: EmployeeFilters) {
  const params = new URLSearchParams()
  if (filters?.departmentId) params.set('departmentId', filters.departmentId)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.search) params.set('search', filters.search)
  const qs = params.toString()
  return useQuery({
    queryKey: [EMPLOYEES_KEY, qs],
    queryFn: () => api.get<Employee[]>(`/employees${qs ? `?${qs}` : ''}`),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, id],
    queryFn: () => api.get<Employee>(`/employees/${id}`),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<Employee>('/employees', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  })
}

export function useUpdateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: Record<string, unknown> & { id: string }) =>
      api.put<Employee>(`/employees/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  })
}

export function useDeleteEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/employees/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  })
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (body: { token: string; password: string }) =>
      api.post<{ status: string }>('/employees/accept-invite', body),
  })
}
