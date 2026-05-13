'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PortalLayout } from '@/components/portal-layout'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'

interface FileAnnotation {
  id: string
  annotationType: string
  content: string
  timestampSeconds: number | null
  createdAt: string
}

interface PortalFile {
  id: string
  originalName: string
  mimeType: string
  clientReviewStatus: string | null
  createdAt: string
  annotations: FileAnnotation[]
}

export default function FilesPage() {
  const t = useTranslations('files')
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<PortalFile | null>(null)
  const [newAnnotation, setNewAnnotation] = useState('')
  const [revisionFeedback, setRevisionFeedback] = useState('')
  const [showRevisionModal, setShowRevisionModal] = useState(false)

  const { data: files, isLoading } = useQuery<PortalFile[]>({
    queryKey: ['portal-files'],
    queryFn: () => apiClient('/portal/files?status=pending_review'),
  })

  const approveMutation = useMutation({
    mutationFn: (fileId: string) =>
      apiClient(`/portal/files/${fileId}/approve`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-files'] })
      setSelectedFile(null)
    },
  })

  const annotationMutation = useMutation({
    mutationFn: ({ fileId, content }: { fileId: string; content: string }) =>
      apiClient(`/portal/files/${fileId}/annotations`, {
        method: 'POST',
        body: { annotationType: 'text', content },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-files'] })
      setNewAnnotation('')
    },
  })

  const revisionMutation = useMutation({
    mutationFn: ({ fileId, feedback }: { fileId: string; feedback: string }) =>
      apiClient(`/portal/files/${fileId}/request-revision`, {
        method: 'POST',
        body: { feedback },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-files'] })
      setShowRevisionModal(false)
      setRevisionFeedback('')
      setSelectedFile(null)
    },
  })

  const isImage = (mime: string) => mime.startsWith('image/')
  const isVideo = (mime: string) => mime.startsWith('video/')
  const isPdf = (mime: string) => mime === 'application/pdf'

  return (
    <PortalLayout>
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && files?.length === 0 && <p className="text-muted-foreground">{t('noFiles')}</p>}

      <div className="grid gap-4">
        {files?.map((file) => (
          <div key={file.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{file.originalName}</span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-xs',
                    isImage(file.mimeType)
                      ? 'bg-purple-100 text-purple-700'
                      : isVideo(file.mimeType)
                        ? 'bg-orange-100 text-orange-700'
                        : isPdf(file.mimeType)
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {file.mimeType.split('/')[1]?.toUpperCase() ?? file.mimeType}
                </span>
                {file.clientReviewStatus === 'approved' && (
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                    {t('approved')}
                  </span>
                )}
                {file.clientReviewStatus === 'revision_requested' && (
                  <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                    {t('revisionRequested')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                  className="text-primary text-sm hover:underline"
                >
                  {t('annotations')} ({file.annotations.length})
                </button>
                {file.clientReviewStatus !== 'approved' && (
                  <>
                    <button
                      onClick={() => approveMutation.mutate(file.id)}
                      disabled={approveMutation.isPending}
                      className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {t('approve')}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(file)
                        setShowRevisionModal(true)
                      }}
                      className="rounded bg-yellow-600 px-3 py-1 text-xs text-white hover:bg-yellow-700"
                    >
                      {t('requestRevision')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedFile?.id === file.id && (
              <div className="mt-4 space-y-3 border-t pt-3">
                {file.annotations.map((ann) => (
                  <div key={ann.id} className="bg-muted/30 rounded p-2 text-sm">
                    {ann.timestampSeconds !== null && (
                      <span className="text-primary mr-2 font-mono text-xs">
                        [{Math.floor(ann.timestampSeconds / 60)}:
                        {(ann.timestampSeconds % 60).toString().padStart(2, '0')}]
                      </span>
                    )}
                    {ann.content}
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                    placeholder={t('addAnnotation')}
                    className="border-input bg-background h-9 flex-1 rounded-md border px-3 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newAnnotation.trim()) {
                        annotationMutation.mutate({
                          fileId: file.id,
                          content: newAnnotation.trim(),
                        })
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newAnnotation.trim()) {
                        annotationMutation.mutate({
                          fileId: file.id,
                          content: newAnnotation.trim(),
                        })
                      }
                    }}
                    className="bg-primary text-primary-foreground rounded px-3 py-1 text-sm"
                  >
                    {t('addAnnotation')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showRevisionModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background w-full max-w-md rounded-lg p-6">
            <h3 className="mb-2 font-semibold">{t('feedbackTitle')}</h3>
            <textarea
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              placeholder={t('feedbackPlaceholder')}
              rows={4}
              className="border-input bg-background w-full rounded-md border p-3 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRevisionModal(false)
                  setRevisionFeedback('')
                }}
                className="rounded border px-3 py-1.5 text-sm"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (revisionFeedback.trim()) {
                    revisionMutation.mutate({
                      fileId: selectedFile.id,
                      feedback: revisionFeedback.trim(),
                    })
                  }
                }}
                disabled={revisionMutation.isPending || !revisionFeedback.trim()}
                className="rounded bg-yellow-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                {t('submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
