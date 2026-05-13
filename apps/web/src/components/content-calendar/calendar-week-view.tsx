'use client'

import { useMemo } from 'react'
import type { CalendarPiece } from '@/hooks/use-calendar'
import { CalendarPreviewPopover } from './calendar-preview-popover'

const TYPE_DOT_COLORS: Record<string, string> = {
  VIDEO_LONG: 'bg-purple-500',
  REEL: 'bg-pink-500',
  STORY: 'bg-blue-500',
  STATIC_DESIGN: 'bg-green-500',
  CAROUSEL: 'bg-orange-500',
  GIF: 'bg-yellow-500',
  PODCAST: 'bg-indigo-500',
  BLOG_POST: 'bg-teal-500',
}

export function CalendarWeekView({
  year,
  month,
  daysInMonth,
  firstDayOfWeek,
  piecesByDay,
  weekDays,
  onDropPiece,
  onEditPiece,
}: {
  year: number
  month: number
  daysInMonth: number
  firstDayOfWeek: number
  piecesByDay: Record<number, CalendarPiece[]>
  weekDays: string[]
  onDropPiece: (pieceId: string, day: number) => void
  onEditPiece: (id: string) => void
}) {
  const weeks = useMemo(() => {
    const result: number[][] = []
    let currentWeek: number[] = []
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(0)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(0)
      result.push(currentWeek)
    }
    return result
  }, [daysInMonth, firstDayOfWeek])

  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    e.dataTransfer.setData('text/plain', pieceId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault()
    const pieceId = e.dataTransfer.getData('text/plain')
    if (pieceId && day > 0) onDropPiece(pieceId, day)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const isToday = (day: number) => {
    const now = new Date()
    return day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear()
  }

  return (
    <div className="space-y-4">
      {weeks.map((week, wi) => (
        <div key={wi} className="rounded-lg border">
          <div className="grid grid-cols-7 border-b bg-gray-50 text-center text-xs font-medium text-gray-500">
            {weekDays.map((d) => (
              <div key={d} className="border-l px-2 py-2 last:border-l-0">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {week.map((day) => {
              if (day === 0)
                return (
                  <div
                    key={`empty-${wi}-${Math.random()}`}
                    className="min-h-40 border-b border-r bg-gray-50/50 p-1"
                  />
                )
              const dayPieces = piecesByDay[day] ?? []
              const today = isToday(day)
              return (
                <div
                  key={day}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day)}
                  className={`min-h-40 border-b border-r p-1 ${today ? 'bg-blue-50/50' : ''}`}
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
                  <div className="space-y-1">
                    {dayPieces.map((piece) => (
                      <CalendarPreviewPopover key={piece.id} piece={piece} onEdit={onEditPiece}>
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, piece.id)}
                          className="flex cursor-grab items-center gap-1.5 rounded bg-white px-1.5 py-1 text-xs shadow-sm ring-1 ring-gray-200 active:cursor-grabbing"
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${TYPE_DOT_COLORS[piece.type] ?? 'bg-gray-400'}`}
                          />
                          <span className="truncate">{piece.title}</span>
                        </div>
                      </CalendarPreviewPopover>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
