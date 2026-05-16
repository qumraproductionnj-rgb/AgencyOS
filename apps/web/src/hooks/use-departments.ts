'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Department {
  id: string
  nameAr: string
  nameEn: string | null
  description: string | null
  managerUserId: string | null
  manager: { id: string; email: string } | null
  parentId: string | null
  icon: string | null
  color: string | null
  createdAt: string
  _count?: { employees: number; children?: number }
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[]
}

interface CreateDepartmentDto {
  nameAr: string
  nameEn?: string
  description?: string
  managerUserId?: string
  parentId?: string
  icon?: string
  color?: string
}

interface UpdateDepartmentDto {
  nameAr?: string
  nameEn?: string
  description?: string
  managerUserId?: string | null
  parentId?: string | null
  icon?: string | null
  color?: string | null
}

export type OrgStructureType = 'FLAT' | 'HIERARCHICAL' | 'HYBRID'

export interface OrgStructure {
  id: string
  orgStructureType: OrgStructureType
}

const DEPARTMENTS_KEY = 'departments'
const DEPARTMENTS_TREE_KEY = 'departments-tree'
const ORG_STRUCTURE_KEY = 'org-structure'

export function useDepartments() {
  return useQuery({
    queryKey: [DEPARTMENTS_KEY],
    queryFn: () => api.get<Department[]>('/departments'),
  })
}

export function useDepartmentTree() {
  return useQuery({
    queryKey: [DEPARTMENTS_TREE_KEY],
    queryFn: () => api.get<DepartmentTreeNode[]>('/departments/tree'),
  })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateDepartmentDto) => api.post<Department>('/departments', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] })
      qc.invalidateQueries({ queryKey: [DEPARTMENTS_TREE_KEY] })
    },
  })
}

export function useUpdateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDepartmentDto & { id: string }) =>
      api.put<Department>(`/departments/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] })
      qc.invalidateQueries({ queryKey: [DEPARTMENTS_TREE_KEY] })
    },
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/departments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] })
      qc.invalidateQueries({ queryKey: [DEPARTMENTS_TREE_KEY] })
    },
  })
}

export function useOrgStructure() {
  return useQuery({
    queryKey: [ORG_STRUCTURE_KEY],
    queryFn: () => api.get<OrgStructure>('/departments/org-structure/current'),
  })
}

export function useSetOrgStructure() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (type: OrgStructureType) =>
      api.patch<OrgStructure>('/departments/org-structure/current', { type }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORG_STRUCTURE_KEY] }),
  })
}
