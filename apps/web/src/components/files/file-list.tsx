'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFiles, useDeleteFile } from '@/hooks/use-files'
import type { FileRecord } from '@/hooks/use-files'
import { FileUpload } from './file-upload'
import { FilePreview } from './file-preview'

interface Props {
  entityType: string
  entityId: string
  showUpload?: boolean
}

const FILE_ICONS: Record<string, string> = {
  'image/': '🖼',
  'video/': '🎬',
  'application/pdf': '📄',
  'text/': '📝',
}

function getFileIcon(mimeType: string): string {
  for (const [prefix, icon] of Object.entries(FILE_ICONS)) {
    if (mimeType.startsWith(prefix)) return icon
  }
  return '📎'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileList({ entityType, entityId, showUpload = true }: Props) {
  const t = useTranslations('files')
  const tCommon = useTranslations('common')
  const { data: files, isLoading } = useFiles({ entityType, entityId })
  const deleteFile = useDeleteFile()
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null)

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  return (
    <div className="space-y-3">
      {showUpload && <FileUpload entityType={entityType} entityId={entityId} />}

      {files?.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400">{t('noFiles')}</p>
      )}

      <div className="space-y-1">
        {files?.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <span className="text-lg">{getFileIcon(file.mimeType)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{file.originalName}</p>
              <p className="text-xs text-gray-400">
                {formatSize(file.sizeBytes)} · {file.uploader?.email ?? ''} ·{' '}
                {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPreviewFile(file)}
                className="rounded px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                {tCommon('view')}
              </button>
              <button
                onClick={() => {
                  if (window.confirm(t('deleteConfirm'))) deleteFile.mutate(file.id)
                }}
                className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                {tCommon('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setPreviewFile(null)}
        >
          <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
