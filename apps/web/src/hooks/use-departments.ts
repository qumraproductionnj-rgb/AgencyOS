'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Department {
  id: string
  nameAr: string
  nameEn: string | null
  description: string | null
  managerUserId: string | null
  manager: { id: string; email: string } | null
  createdAt: string
}

interface CreateDepartmentDto {
  nameAr: string
  nameEn?: string
  description?: string
  managerUserId?: string
}

interface UpdateDepartmentDto {
  nameAr?: string
  nameEn?: string
  description?: string
  managerUserId?: string | null
}

const DEPARTMENTS_KEY = 'departments'

export function useDepartments() {
  return useQuery({
    queryKey: [DEPARTMENTS_KEY],
    queryFn: () => api.get<Department[]>('/departments'),
  })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateDepartmentDto) => api.post<Department>('/departments', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] }),
  })
}

export function useUpdateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDepartmentDto & { id: string }) =>
      api.put<Department>(`/departments/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] }),
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/departments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] }),
  })
}
