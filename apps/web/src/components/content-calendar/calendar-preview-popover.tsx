'use client'

import { useState, useRef, useEffect } from 'react'
import type { CalendarPiece } from '@/hooks/use-calendar'

const TYPE_BADGES: Record<string, string> = {
  VIDEO_LONG: 'bg-purple-100 text-purple-800',
  REEL: 'bg-pink-100 text-pink-800',
  STORY: 'bg-blue-100 text-blue-800',
  STATIC_DESIGN: 'bg-green-100 text-green-800',
  CAROUSEL: 'bg-orange-100 text-orange-800',
  GIF: 'bg-yellow-100 text-yellow-800',
  PODCAST: 'bg-indigo-100 text-indigo-800',
  BLOG_POST: 'bg-teal-100 text-teal-800',
}

const STAGE_BADGES: Record<string, string> = {
  IDEA: 'bg-gray-100 text-gray-600',
  IN_WRITING: 'bg-yellow-100 text-yellow-800',
  IN_DESIGN: 'bg-blue-100 text-blue-800',
  IN_PRODUCTION: 'bg-purple-100 text-purple-800',
  INTERNAL_REVIEW: 'bg-orange-100 text-orange-800',
  CLIENT_REVIEW: 'bg-amber-100 text-amber-800',
  REVISION: 'bg-red-100 text-red-800',
  APPROVED: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-teal-100 text-teal-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
}

export function CalendarPreviewPopover({
  piece,
  onEdit,
  children,
}: {
  piece: CalendarPiece
  onEdit?: (id: string) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const typeBadge = TYPE_BADGES[piece.type] ?? 'bg-gray-100 text-gray-600'
  const stageBadge = STAGE_BADGES[piece.stage] ?? 'bg-gray-100 text-gray-600'
  const clientName = piece.client?.nameEn ?? piece.client?.name ?? ''

  return (
    <div ref={ref} className="relative inline-block">
      <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        {children}
      </div>
      {open && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border bg-white p-3 shadow-lg">
          <div className="space-y-2">
            <p className="text-sm font-medium leading-tight">{piece.title}</p>
            <div className="flex flex-wrap gap-1">
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${typeBadge}`}>
                {piece.type}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${stageBadge}`}>
                {piece.stage}
              </span>
            </div>
            <p className="text-xs text-gray-500">{clientName}</p>
            {piece.pillar && (
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: piece.pillar.color ?? '#ccc' }}
                />
                <span className="text-xs text-gray-500">{piece.pillar.nameAr}</span>
              </div>
            )}
            {piece.platforms.length > 0 && (
              <p className="text-xs text-gray-400">{piece.platforms.join(', ')}</p>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(piece.id)}
                className="w-full rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                Open Editor
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
