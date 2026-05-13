'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface TelegramStatus {
  linked: boolean
  linkedAt: string | null
  chatId: string | null
}

interface LinkResponse {
  token: string
  botUsername: string
  deepLink: string
  expiresInSeconds: number
}

const TELEGRAM_KEY = 'telegram'

export function useTelegramStatus() {
  return useQuery({
    queryKey: [TELEGRAM_KEY, 'status'],
    queryFn: () => api.get<TelegramStatus>('/telegram/status'),
  })
}

export function useGenerateTelegramLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<LinkResponse>('/telegram/link'),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TELEGRAM_KEY] }),
  })
}

export function useUnlinkTelegram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.del('/telegram/unlink'),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TELEGRAM_KEY] }),
  })
}
