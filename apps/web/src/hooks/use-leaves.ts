'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type LeaveType =
  | 'ANNUAL'
  | 'SICK'
  | 'PERSONAL'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'UNPAID'
  | 'OTHER'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface Leave {
  id: string
  companyId: string
  employeeId: string
  leaveType: LeaveType
  status: LeaveStatus
  startDate: string
  endDate: string
  durationDays: number
  reason: string | null
  rejectionReason: string | null
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  employee: {
    id: string
    fullNameAr: string
    fullNameEn: string
    employeeCode: string
  }
}

export interface LeaveBalance {
  id: string
  companyId: string
  employeeId: string
  leaveType: LeaveType
  totalDays: number
  usedDays: number
  year: number
}

export interface CreateLeaveDto {
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason?: string
}

export interface LeavesQuery {
  view?: 'my'
  status?: LeaveStatus
  leaveType?: LeaveType
}

const LEAVES_KEY = 'leaves'

export function useLeaves(query?: LeavesQuery) {
  const params = new URLSearchParams()
  if (query?.view) params.set('view', query.view)
  if (query?.status) params.set('status', query.status)
  if (query?.leaveType) params.set('leaveType', query.leaveType)
  const qs = params.toString()

  return useQuery({
    queryKey: [LEAVES_KEY, qs],
    queryFn: () => api.get<Leave[]>(`/leaves${qs ? `?${qs}` : ''}`),
  })
}

export function useLeave(id: string) {
  return useQuery({
    queryKey: [LEAVES_KEY, id],
    queryFn: () => api.get<Leave>(`/leaves/${id}`),
    enabled: !!id,
  })
}

export function useLeaveBalance() {
  return useQuery({
    queryKey: ['leave-balance'],
    queryFn: () => api.get<LeaveBalance[]>('/leaves/balance'),
  })
}

export function useCreateLeave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateLeaveDto) => api.post<Leave>('/leaves', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEAVES_KEY] })
      qc.invalidateQueries({ queryKey: ['leave-balance'] })
    },
  })
}

export function useApproveLeave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch<Leave>(`/leaves/${id}/approve`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEAVES_KEY] }),
  })
}

export function useRejectLeave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      api.patch<Leave>(`/leaves/${id}/reject`, { rejectionReason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEAVES_KEY] }),
  })
}

export function useCancelLeave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch<Leave>(`/leaves/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEAVES_KEY] })
      qc.invalidateQueries({ queryKey: ['leave-balance'] })
    },
  })
}
