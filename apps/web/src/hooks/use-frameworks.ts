'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface FrameworkField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'color' | 'rating'
  placeholder?: string
  options?: string[]
  required?: boolean
  maxLength?: number
  description?: string
  max?: number
}

export interface Framework {
  id: string
  code: string
  nameAr: string | null
  nameEn: string | null
  description: string | null
  category: string | null
  bestForContentTypes: string[]
  fieldsSchema: FrameworkField[] | null
  isGlobal: boolean
}

export interface FrameworkQuery {
  category?: string | undefined
  contentType?: string | undefined
  objective?: string | undefined
  search?: string | undefined
}

export interface FrameworkFormValues {
  frameworkCode: string
  fieldValues: Record<string, string>
}

const FRAMEWORKS_KEY = 'frameworks'

export function useFrameworks(query?: FrameworkQuery) {
  const params = new URLSearchParams()
  if (query?.category) params.set('category', query.category)
  if (query?.contentType) params.set('contentType', query.contentType)
  if (query?.objective) params.set('objective', query.objective)
  if (query?.search) params.set('search', query.search)
  const qs = params.toString()

  return useQuery({
    queryKey: [FRAMEWORKS_KEY, qs],
    queryFn: () => api.get<Framework[]>(`/frameworks${qs ? `?${qs}` : ''}`),
  })
}

export function useFramework(code: string) {
  return useQuery({
    queryKey: [FRAMEWORKS_KEY, code],
    queryFn: () => api.get<Framework>(`/frameworks/${code}`),
    enabled: !!code,
  })
}

export function useFrameworkRecommendations(contentType?: string, objective?: string) {
  const params = new URLSearchParams()
  if (contentType) params.set('contentType', contentType)
  if (objective) params.set('objective', objective)
  const qs = params.toString()

  return useQuery({
    queryKey: [FRAMEWORKS_KEY, 'recommend', qs],
    queryFn: () => api.get<Framework[]>(`/frameworks/recommend${qs ? `?${qs}` : ''}`),
    enabled: !!contentType,
  })
}

export function useApplyFramework() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pieceId, data }: { pieceId: string; data: FrameworkFormValues }) =>
      api.put(`/content-pieces/${pieceId}`, {
        frameworkUsed: data.frameworkCode,
        frameworkData: data.fieldValues,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content-pieces'] })
    },
  })
}
