'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { UpdateContentPieceDto } from './use-content-pieces'

export interface CalendarPiece {
  id: string
  title: string
  type: string
  stage: string
  platforms: string[]
  scheduledAt: string | null
  clientId: string
  client: { id: string; name: string; nameEn: string | null }
  pillar: { id: string; nameAr: string; color: string | null } | null
  plan: { id: string; title: string | null }
}

export interface CalendarData {
  month: number
  year: number
  totalPieces: number
  days: Record<number, CalendarPiece[]>
  pieces: CalendarPiece[]
}

const CALENDAR_KEY = 'content-calendar'

export function useCalendar(month?: number, year?: number) {
  const now = new Date()
  const targetMonth = month ?? now.getMonth() + 1
  const targetYear = year ?? now.getFullYear()

  return useQuery({
    queryKey: [CALENDAR_KEY, targetMonth, targetYear],
    queryFn: () =>
      api.get<CalendarData>(`/integrations/calendar?month=${targetMonth}&year=${targetYear}`),
  })
}

export function useUpdateScheduledDate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string | null }) =>
      api.put(`/content-pieces/${id}`, { scheduledAt } as UpdateContentPieceDto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CALENDAR_KEY] }),
  })
}
