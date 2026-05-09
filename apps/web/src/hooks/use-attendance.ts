'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface TodayRecord {
  id: string
  status: string
  checkInTime: string
  checkOutTime: string | null
  checkInLat: number | null
  checkInLng: number | null
  checkInDistanceM: number | null
  workHoursCalculated: number | null
  workLocation: { id: string; name: string } | null
}

export interface EmployeeToday {
  id: string
  employeeCode: string
  fullNameAr: string
  department: { id: string; nameAr: string } | null
  attendanceRecords: TodayRecord[]
}

const KEY = 'attendance'

export function useToday() {
  return useQuery({
    queryKey: [KEY, 'today'],
    queryFn: () => api.get<TodayRecord | null>('/attendance/today'),
  })
}

export function useTodayAll(departmentId?: string) {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  return useQuery({
    queryKey: [KEY, 'today-all', departmentId],
    queryFn: () => api.get<EmployeeToday[]>(`/attendance/today/all${params}`),
  })
}

export function useCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { latitude: number; longitude: number }) =>
      api.post('/attendance/check-in', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}

export function useCheckOut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body?: { latitude?: number; longitude?: number }) =>
      api.post('/attendance/check-out', body ?? {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}
