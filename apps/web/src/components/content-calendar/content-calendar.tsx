'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCalendar, useUpdateScheduledDate } from '@/hooks/use-calendar'
import { useClients, type Client } from '@/hooks/use-clients'
import { CalendarMonthView } from './calendar-month-view'
import { CalendarWeekView } from './calendar-week-view'

const STAGE_OPTIONS = [
  '',
  'IDEA',
  'IN_WRITING',
  'IN_DESIGN',
  'IN_PRODUCTION',
  'INTERNAL_REVIEW',
  'CLIENT_REVIEW',
  'REVISION',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
]
const PLATFORM_OPTIONS = [
  'instagram',
  'facebook',
  'tiktok',
  'twitter',
  'linkedin',
  'youtube',
  'snapchat',
  'website',
  'other',
]

export function ContentCalendar() {
  const t = useTranslations()
  const router = useRouter()

  const now = new Date()
  const [view, setView] = useState<'month' | 'week'>('month')
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [filterClient, setFilterClient] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterStage, setFilterStage] = useState('')

  const { data: calendar, isLoading } = useCalendar(currentMonth, currentYear)
  const { data: clients } = useClients()
  const updateScheduledDate = useUpdateScheduledDate()

  const weekDays = t('calendar.weekDays').split(',')

  const piecesByDay = useMemo(() => {
    if (!calendar?.pieces) return {}
    const filtered = calendar.pieces.filter((p) => {
      if (filterClient && p.clientId !== filterClient) return false
      if (filterStage && p.stage !== filterStage) return false
      if (
        filterPlatform &&
        !p.platforms.some((pl) => pl.toLowerCase() === filterPlatform.toLowerCase())
      )
        return false
      return true
    })
    const grouped: Record<number, typeof filtered> = {}
    for (const piece of filtered) {
      if (!piece.scheduledAt) continue
      const day = new Date(piece.scheduledAt).getDate()
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(piece)
    }
    return grouped
  }, [calendar?.pieces, filterClient, filterStage, filterPlatform])

  const firstDayOfWeek = useMemo(
    () => new Date(currentYear, currentMonth - 1, 1).getDay(),
    [currentMonth, currentYear],
  )

  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth, 0).getDate(),
    [currentMonth, currentYear],
  )

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }, [currentMonth])

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }, [currentMonth])

  const handleToday = useCallback(() => {
    setCurrentMonth(now.getMonth() + 1)
    setCurrentYear(now.getFullYear())
  }, [now])

  const handleDropPiece = useCallback(
    (pieceId: string, day: number) => {
      const scheduledAt = new Date(currentYear, currentMonth - 1, day).toISOString()
      updateScheduledDate.mutate({ id: pieceId, scheduledAt })
    },
    [currentMonth, currentYear, updateScheduledDate],
  )

  const handleEditPiece = useCallback(
    (id: string) => {
      router.push(`/content-pieces/${id}`)
    },
    [router],
  )

  const monthLabel = t(`calendar.months.${currentMonth}`)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('calendar.title')}</h1>
          <p className="text-sm text-gray-500">{t('calendar.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            &larr;
          </button>
          <button
            onClick={handleToday}
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
          >
            {t('calendar.today')}
          </button>
          <span className="min-w-28 text-center text-base font-semibold">
            {monthLabel} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            &rarr;
          </button>
          <div className="ml-4 flex rounded-md border text-sm">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 ${view === 'month' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
            >
              {t('calendar.monthView')}
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 ${view === 'week' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
            >
              {t('calendar.weekView')}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="">{t('calendar.allClients')}</option>
          {(clients as Client[])?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn || c.name}
            </option>
          ))}
        </select>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="">{t('calendar.allStages')}</option>
          {STAGE_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="">{t('calendar.allPlatforms')}</option>
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <div className="flex items-center text-sm text-gray-500">
          {calendar?.pieces?.length !== undefined && (
            <span>
              {
                calendar.pieces.filter((p) => {
                  if (filterClient && p.clientId !== filterClient) return false
                  if (filterStage && p.stage !== filterStage) return false
                  if (
                    filterPlatform &&
                    !p.platforms.some((pl) => pl.toLowerCase() === filterPlatform.toLowerCase())
                  )
                    return false
                  return true
                }).length
              }{' '}
              {t('calendar.pieces')}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          {t('common.loading')}
        </div>
      ) : !calendar ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          {t('common.noData')}
        </div>
      ) : view === 'month' ? (
        <CalendarMonthView
          year={currentYear}
          month={currentMonth}
          daysInMonth={daysInMonth}
          firstDayOfWeek={firstDayOfWeek}
          piecesByDay={piecesByDay}
          weekDays={weekDays}
          onDropPiece={handleDropPiece}
          onEditPiece={handleEditPiece}
          t={(key) => t(`calendar.${key}`)}
        />
      ) : (
        <CalendarWeekView
          year={currentYear}
          month={currentMonth}
          daysInMonth={daysInMonth}
          firstDayOfWeek={firstDayOfWeek}
          piecesByDay={piecesByDay}
          weekDays={weekDays}
          onDropPiece={handleDropPiece}
          onEditPiece={handleEditPiece}
        />
      )}
    </div>
  )
}
