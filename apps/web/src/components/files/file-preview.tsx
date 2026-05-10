'use client'

import { useEffect, useState } from 'react'
import { useGetDownloadUrl } from '@/hooks/use-files'
import type { FileRecord } from '@/hooks/use-files'

interface Props {
  file: FileRecord
  onClose?: () => void
}

export function FilePreview({ file, onClose }: Props) {
  const getUrl = useGetDownloadUrl()
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getUrl
      .mutateAsync(file.id)
      .then((res) => {
        if (!cancelled) setUrl(res.url)
      })
      .catch(() => {
        /* ignore */
      })
    return () => {
      cancelled = true
    }
  }, [file.id, getUrl])

  if (!url) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-gray-400">
        Loading preview...
      </div>
    )
  }

  const isImage = file.mimeType.startsWith('image/')
  const isVideo = file.mimeType.startsWith('video/')
  const isPdf = file.mimeType === 'application/pdf'

  return (
    <div className="relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <div className="flex items-center justify-center rounded-md bg-gray-100 p-2">
        {isImage ? (
          <img src={url} alt={file.originalName} className="max-h-96 rounded object-contain" />
        ) : isVideo ? (
          <video src={url} controls className="max-h-96 rounded" />
        ) : isPdf ? (
          <iframe src={url} className="h-96 w-full rounded" title={file.originalName} />
        ) : (
          <div className="flex flex-col items-center gap-2 p-8 text-gray-500">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">{file.originalName}</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
