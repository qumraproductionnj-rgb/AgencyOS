'use client'

import { useCallback } from 'react'
import type { CalendarPiece } from '@/hooks/use-calendar'
import { CalendarPreviewPopover } from './calendar-preview-popover'

const TYPE_COLORS: Record<string, string> = {
  VIDEO_LONG: 'bg-purple-200 text-purple-900 border-purple-300',
  REEL: 'bg-pink-200 text-pink-900 border-pink-300',
  STORY: 'bg-blue-200 text-blue-900 border-blue-300',
  STATIC_DESIGN: 'bg-green-200 text-green-900 border-green-300',
  CAROUSEL: 'bg-orange-200 text-orange-900 border-orange-300',
  GIF: 'bg-yellow-200 text-yellow-900 border-yellow-300',
  PODCAST: 'bg-indigo-200 text-indigo-900 border-indigo-300',
  BLOG_POST: 'bg-teal-200 text-teal-900 border-teal-300',
}

export function CalendarMonthView({
  year,
  month,
  daysInMonth,
  firstDayOfWeek,
  piecesByDay,
  weekDays,
  onDropPiece,
  onEditPiece,
  t,
}: {
  year: number
  month: number
  daysInMonth: number
  firstDayOfWeek: number
  piecesByDay: Record<number, CalendarPiece[]>
  weekDays: string[]
  onDropPiece: (pieceId: string, day: number) => void
  onEditPiece: (id: string) => void
  t: (key: string) => string
}) {
  const handleDragStart = useCallback((e: React.DragEvent, pieceId: string) => {
    e.dataTransfer.setData('text/plain', pieceId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, day: number) => {
      e.preventDefault()
      const pieceId = e.dataTransfer.getData('text/plain')
      if (pieceId) onDropPiece(pieceId, day)
    },
    [onDropPiece],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const isToday = (day: number) => {
    const now = new Date()
    return day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear()
  }

  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-7 border-b bg-gray-50 text-center text-xs font-medium text-gray-500">
        {weekDays.map((d) => (
          <div key={d} className="border-l px-2 py-3 last:border-l-0">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-28 border-b border-r bg-gray-50/50 p-1" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1
          const dayPieces = piecesByDay[day] ?? []
          const today = isToday(day)
          return (
            <div
              key={day}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              className={`min-h-28 border-b border-r p-1 transition-colors ${today ? 'bg-blue-50/50' : ''} ${dayPieces.length > 0 ? '' : ''}`}
            >
              <div
                className={`mb-1 text-right text-xs font-medium ${today ? 'text-blue-600' : 'text-gray-500'}`}
              >
                {today ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    {day}
                  </span>
                ) : (
                  day
                )}
              </div>
              <div className="space-y-0.5">
                {dayPieces.slice(0, 4).map((piece) => (
                  <CalendarPreviewPopover key={piece.id} piece={piece} onEdit={onEditPiece}>
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, piece.id)}
                      className={`cursor-grab truncate rounded border px-1 py-0.5 text-xs active:cursor-grabbing ${TYPE_COLORS[piece.type] ?? 'bg-gray-100 text-gray-800'}`}
                      title={piece.title}
                    >
                      {piece.title}
                    </div>
                  </CalendarPreviewPopover>
                ))}
                {dayPieces.length > 4 && (
                  <div className="text-xs text-gray-400">
                    +{dayPieces.length - 4} {t('more')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
