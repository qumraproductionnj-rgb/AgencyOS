'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface ContentPlan {
  id: string
  companyId: string
  clientId: string
  campaignId: string | null
  month: number
  year: number
  title: string | null
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'ACTIVE' | 'COMPLETED'
  monthlyObjectives: { metric: string; target: number; current?: number }[] | null
  pillarDistribution: { pillarId: string; targetCount: number }[] | null
  contentTypeDistribution: Record<string, number> | null
  totalPiecesPlanned: number | null
  totalPiecesPublished: number | null
  clientApprovedAt: string | null
  clientApprovedBy: string | null
  createdAt: string
  updatedAt: string
  client?: { id: string; name: string; nameEn: string | null }
  campaign?: { id: string; name: string }
  pieces?: ContentPiece[]
}

export interface ContentPiece {
  id: string
  contentPlanId: string
  title: string
  type:
    | 'VIDEO_LONG'
    | 'REEL'
    | 'STORY'
    | 'STATIC_DESIGN'
    | 'CAROUSEL'
    | 'GIF'
    | 'PODCAST'
    | 'BLOG_POST'
  pillarId: string | null
  bigIdea: string | null
  platforms: string[]
  scheduledDay: number | null
  status: string
}

export interface AiIdea {
  index: number
  title: string
  type: ContentPiece['type']
  pillarId: string | null
  bigIdea: string
  platforms: string[]
}

export interface CreateContentPlanDto {
  clientId: string
  campaignId?: string
  month: number
  year: number
  title?: string
}

export interface UpdateContentPlanDto {
  title?: string
  campaignId?: string | null
  monthlyObjectives?: { metric: string; target: number; current?: number }[]
  pillarDistribution?: { pillarId: string; targetCount: number }[]
  contentTypeDistribution?: Record<string, number>
}

export interface ContentPlansQuery {
  clientId?: string
  month?: string
  year?: string
  status?: string
}

const PLANS_KEY = 'content-plans'

export function useContentPlans(query?: ContentPlansQuery) {
  const params = new URLSearchParams()
  if (query?.clientId) params.set('clientId', query.clientId)
  if (query?.month) params.set('month', query.month)
  if (query?.year) params.set('year', query.year)
  if (query?.status) params.set('status', query.status)
  const qs = params.toString()

  return useQuery({
    queryKey: [PLANS_KEY, qs],
    queryFn: () => api.get<ContentPlan[]>(`/content-plans${qs ? `?${qs}` : ''}`),
  })
}

export function useContentPlan(id: string) {
  return useQuery({
    queryKey: [PLANS_KEY, id],
    queryFn: () => api.get<ContentPlan>(`/content-plans/${id}`),
    enabled: !!id,
  })
}

export function useCreateContentPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateContentPlanDto) => api.post<ContentPlan>('/content-plans', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLANS_KEY] }),
  })
}

export function useUpdateContentPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateContentPlanDto & { id: string }) =>
      api.put<ContentPlan>(`/content-plans/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLANS_KEY] }),
  })
}

export function useUpdateContentPlanStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<ContentPlan>(`/content-plans/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLANS_KEY] }),
  })
}

export function useDeleteContentPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/content-plans/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLANS_KEY] }),
  })
}

export function useGenerateIdeas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, direction, count }: { id: string; direction?: string; count?: number }) =>
      api.post<{ ideas: AiIdea[]; generationId: string }>(`/content-plans/${id}/generate-ideas`, {
        ...(direction ? { direction } : {}),
        ...(count ? { count } : {}),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLANS_KEY] }),
  })
}

export function useFinalizePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      pieces,
    }: {
      id: string
      pieces: {
        title: string
        type: string
        pillarId?: string
        bigIdea?: string
        platforms: string[]
        scheduledDay: number
      }[]
    }) => api.post<ContentPiece[]>(`/content-plans/${id}/finalize`, { pieces }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLANS_KEY] }),
  })
}
