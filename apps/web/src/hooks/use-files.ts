'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const BASE = '/api/v1'

export interface FileRecord {
  id: string
  originalName: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  entityType: string
  entityId: string
  uploadedBy: string
  isVisibleToClient: boolean
  createdAt: string
  uploader?: { id: string; email: string }
}

export type UploadResponse = FileRecord

const FILES_KEY = 'files'

async function uploadFile(
  file: File,
  entityType: string,
  entityId: string,
  isVisibleToClient = false,
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('entityType', entityType)
  formData.append('entityId', entityId)
  formData.append('isVisibleToClient', String(isVisibleToClient))

  const res = await fetch(`${BASE}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Upload failed: ${res.status}`)
  }
  return res.json()
}

function getToken(): string {
  if (typeof window === 'undefined') return ''
  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    if (cookie.startsWith('access_token=')) {
      return cookie.slice('access_token='.length)
    }
  }
  return ''
}

export function useFiles(query?: { entityType?: string; entityId?: string; search?: string }) {
  const params = new URLSearchParams()
  if (query?.entityType) params.set('entityType', query.entityType)
  if (query?.entityId) params.set('entityId', query.entityId)
  if (query?.search) params.set('search', query.search)
  const qs = params.toString()

  return useQuery({
    queryKey: [FILES_KEY, qs],
    queryFn: () => api.get<FileRecord[]>(`/files${qs ? `?${qs}` : ''}`),
  })
}

export function useFile(id: string) {
  return useQuery({
    queryKey: [FILES_KEY, id],
    queryFn: () => api.get<FileRecord>(`/files/${id}`),
    enabled: !!id,
  })
}

export function useUploadFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      file,
      entityType,
      entityId,
      isVisibleToClient,
    }: {
      file: File
      entityType: string
      entityId: string
      isVisibleToClient?: boolean
    }) => uploadFile(file, entityType, entityId, isVisibleToClient),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FILES_KEY] }),
  })
}

export function useGetDownloadUrl() {
  return useMutation({
    mutationFn: (id: string) => api.get<{ url: string }>(`/files/${id}/download`),
  })
}

export function useUpdateFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isVisibleToClient }: { id: string; isVisibleToClient?: boolean }) =>
      api.patch<FileRecord>(`/files/${id}`, {
        ...(isVisibleToClient !== undefined ? { isVisibleToClient } : {}),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FILES_KEY] }),
  })
}

export function useDeleteFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/files/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FILES_KEY] }),
  })
}
