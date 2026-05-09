'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface WorkLocation {
  id: string
  name: string
  address: string | null
  latitude: number
  longitude: number
  radiusMeters: number
  isActive: boolean
  createdAt: string
  _count?: { workLocationEmployees: number }
  workLocationEmployees?: {
    employee: { id: string; fullNameAr: string; employeeCode: string }
  }[]
}

const KEY = 'work-locations'

export function useWorkLocations() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get<WorkLocation[]>('/work-locations'),
  })
}

export function useWorkLocation(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<WorkLocation>(`/work-locations/${id}`),
    enabled: !!id,
  })
}

export function useCreateWorkLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<WorkLocation>('/work-locations', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateWorkLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: Record<string, unknown> & { id: string }) =>
      api.put<WorkLocation>(`/work-locations/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteWorkLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/work-locations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useAssignEmployees() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, employeeIds }: { id: string; employeeIds: string[] }) =>
      api.post<WorkLocation>(`/work-locations/${id}/employees`, { employeeIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
