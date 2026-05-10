'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useUploadFile } from '@/hooks/use-files'

interface Props {
  entityType: string
  entityId: string
  onUploaded?: () => void
}

export function FileUpload({ entityType, entityId, onUploaded }: Props) {
  const t = useTranslations('files')
  const uploadFile = useUploadFile()
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('tooLarge'))
        return
      }
      await uploadFile.mutateAsync({ file, entityType, entityId })
      onUploaded?.()
    },
    [uploadFile, entityType, entityId, onUploaded, t],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-md border-2 border-dashed p-8 text-center transition-colors ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input type="file" id="file-upload" onChange={handleChange} className="hidden" />
      <label htmlFor="file-upload" className="cursor-pointer">
        <svg
          className="mx-auto mb-2 h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {uploadFile.isPending ? (
          <p className="text-sm text-blue-600">{t('uploading')}</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">{t('dragDrop')}</p>
            <p className="mt-1 text-xs text-gray-400">{t('maxSize')}</p>
          </>
        )}
      </label>
    </div>
  )
}
