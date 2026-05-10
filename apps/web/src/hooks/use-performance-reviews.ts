'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Kpi {
  name: string
  score: number
  weight?: number
  comment?: string
}

export interface PerformanceReview {
  id: string
  employeeId: string
  reviewerId: string
  reviewDate: string
  overallScore: number
  kpis: Kpi[]
  strengths: string | null
  improvements: string | null
  notes: string | null
  createdAt: string
  employee: {
    id: string
    fullNameAr: string
    fullNameEn: string
    employeeCode: string
    position?: string | null
  }
  reviewer: {
    id: string
    email: string
  }
}

export interface CreatePerformanceReviewDto {
  employeeId: string
  reviewDate: string
  kpis: Kpi[]
  strengths?: string
  improvements?: string
  notes?: string
}

export interface UpdatePerformanceReviewDto {
  reviewDate?: string
  kpis?: Kpi[]
  strengths?: string
  improvements?: string
  notes?: string
}

const REVIEWS_KEY = 'performance-reviews'

export function usePerformanceReviews(employeeId?: string) {
  const params = employeeId ? `?employeeId=${employeeId}` : ''
  return useQuery({
    queryKey: [REVIEWS_KEY, employeeId ?? 'all'],
    queryFn: () => api.get<PerformanceReview[]>(`/performance-reviews${params}`),
  })
}

export function usePerformanceReview(id: string) {
  return useQuery({
    queryKey: [REVIEWS_KEY, id],
    queryFn: () => api.get<PerformanceReview>(`/performance-reviews/${id}`),
    enabled: !!id,
  })
}

export function useCreatePerformanceReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePerformanceReviewDto) =>
      api.post<PerformanceReview>('/performance-reviews', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [REVIEWS_KEY] }),
  })
}

export function useUpdatePerformanceReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdatePerformanceReviewDto & { id: string }) =>
      api.put<PerformanceReview>(`/performance-reviews/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [REVIEWS_KEY] }),
  })
}

export function useDeletePerformanceReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/performance-reviews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [REVIEWS_KEY] }),
  })
}
