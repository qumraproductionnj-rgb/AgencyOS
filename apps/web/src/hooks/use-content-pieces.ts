'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface ContentPieceDetail {
  id: string
  companyId: string
  contentPlanId: string
  clientId: string
  pillarId: string | null
  projectId: string | null
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
  platforms: string[]
  bigIdea: string | null
  frameworkUsed: string | null
  frameworkData: Record<string, unknown> | null
  components: Record<string, unknown> | null
  captionAr: string | null
  captionEn: string | null
  hashtags: string[]
  ctaText: string | null
  ctaLink: string | null
  linkedAssets: string[]
  inspirationRefs: unknown[] | null
  stage: string
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  plan: { id: string; month: number; year: number; title: string | null }
  client: { id: string; name: string; nameEn: string | null }
  pillar: { id: string; nameAr: string; nameEn: string | null; color: string | null } | null
  project: { id: string; name: string } | null
  revisions: ContentRevision[]
}

export interface ContentRevision {
  id: string
  contentPieceId: string
  roundNumber: number
  feedbackText: string | null
  feedbackAnnotations: unknown[] | null
  attachedFiles: string[]
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  createdAt: string
  requester: {
    id: string
    email: string
    employee: { fullNameAr: string; fullNameEn: string | null } | null
  }
  resolver: {
    id: string
    email: string
    employee: { fullNameAr: string; fullNameEn: string | null } | null
  } | null
}

export interface UpdateContentPieceDto {
  title?: string
  bigIdea?: string | null
  frameworkUsed?: string | null
  frameworkData?: Record<string, unknown> | null
  components?: Record<string, unknown> | null
  captionAr?: string | null
  captionEn?: string | null
  hashtags?: string[]
  ctaText?: string | null
  ctaLink?: string | null
  linkedAssets?: string[]
  inspirationRefs?: unknown[] | null
  scheduledAt?: string | null
  platforms?: string[]
}

export interface CreateRevisionDto {
  roundNumber: number
  feedbackText?: string
  feedbackAnnotations?: unknown[] | null
  attachedFiles?: string[]
}

const PIECE_KEY = 'content-pieces'
const REVISIONS_KEY = 'content-revisions'

export function useContentPiece(id: string) {
  return useQuery({
    queryKey: [PIECE_KEY, id],
    queryFn: () => api.get<ContentPieceDetail>(`/content-pieces/${id}`),
    enabled: !!id,
  })
}

export function useUpdateContentPiece() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateContentPieceDto & { id: string }) =>
      api.put<ContentPieceDetail>(`/content-pieces/${id}`, body),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: [PIECE_KEY, data.id] }),
  })
}

export function useUpdateContentPieceStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.patch<ContentPieceDetail>(`/content-pieces/${id}/stage`, { stage }),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: [PIECE_KEY, data.id] }),
  })
}

export function useContentRevisions(pieceId: string) {
  return useQuery({
    queryKey: [REVISIONS_KEY, pieceId],
    queryFn: () => api.get<ContentRevision[]>(`/content-pieces/${pieceId}/revisions`),
    enabled: !!pieceId,
  })
}

export function useCreateContentRevision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pieceId, ...body }: CreateRevisionDto & { pieceId: string }) =>
      api.post<ContentRevision>(`/content-pieces/${pieceId}/revisions`, body),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: [REVISIONS_KEY, data.contentPieceId] }),
  })
}

export function useUpdateContentRevision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      pieceId,
      revisionId,
      ...body
    }: {
      pieceId: string
      revisionId: string
      feedbackText?: string
      feedbackAnnotations?: unknown[] | null
      status?: string
    }) => api.put<ContentRevision>(`/content-pieces/${pieceId}/revisions/${revisionId}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [REVISIONS_KEY] }),
  })
}
