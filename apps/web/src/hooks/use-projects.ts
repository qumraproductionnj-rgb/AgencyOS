'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Project {
  id: string
  clientId: string
  campaignId: string | null
  name: string
  nameEn: string | null
  description: string | null
  stage: 'BRIEF' | 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED'
  budget: number
  currency: string
  startDate: string
  deadline: string
  completedAt: string | null
  createdAt: string
  client: { id: string; name: string; nameEn: string | null }
  campaign?: { id: string; name: string } | null
  _count?: { tasks: number; revisions: number }
  tasks?: {
    id: string
    title: string
    status: string
    assignee?: { id: string; email: string } | null
  }[]
  revisions?: {
    id: string
    revisionNumber: number
    notes: string | null
    createdAt: string
    requestor?: { id: string; email: string }
  }[]
}

export interface CreateProjectDto {
  clientId: string
  campaignId?: string
  name: string
  nameEn?: string
  description?: string
  budget?: number
  currency?: string
  startDate: string
  deadline: string
}

export interface UpdateProjectDto {
  name?: string
  nameEn?: string
  description?: string
  budget?: number
  currency?: string
  startDate?: string
  deadline?: string
}

const PROJECTS_KEY = 'projects'

export function useProjects(query?: { search?: string; stage?: string; clientId?: string }) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.stage) params.set('stage', query.stage)
  if (query?.clientId) params.set('clientId', query.clientId)
  const qs = params.toString()

  return useQuery({
    queryKey: [PROJECTS_KEY, qs],
    queryFn: () => api.get<Project[]>(`/projects${qs ? `?${qs}` : ''}`),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: [PROJECTS_KEY, id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectDto) => api.post<Project>('/projects', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateProjectDto & { id: string }) =>
      api.put<Project>(`/projects/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  })
}

export function useUpdateProjectStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.patch<Project>(`/projects/${id}/stage`, { stage }),
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: [PROJECTS_KEY] })
      const previous = qc.getQueriesData<Project[]>({ queryKey: [PROJECTS_KEY] })
      qc.setQueriesData<Project[]>(
        { queryKey: [PROJECTS_KEY] },
        (old) =>
          old?.map((p) => (p.id === id ? { ...p, stage: stage as Project['stage'] } : p)) ?? old,
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) => qc.setQueryData(key, data))
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  })
}

export function useAddRevision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.post<{ revision: { revisionNumber: number }; remaining: number; limit: number }>(
        `/projects/${id}/revisions`,
        { ...(notes ? { notes } : {}) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  })
}

export function useClientsList() {
  return useQuery({
    queryKey: ['clients-list'],
    queryFn: () => api.get<{ id: string; name: string; nameEn?: string | null }[]>('/clients'),
  })
}

export function useCampaignsList() {
  return useQuery({
    queryKey: ['campaigns-list'],
    queryFn: () => api.get<{ id: string; name: string }[]>('/campaigns'),
  })
}
