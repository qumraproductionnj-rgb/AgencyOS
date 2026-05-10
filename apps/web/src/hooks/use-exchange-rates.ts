'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface ExchangeRate {
  id: string
  fromCurrency: string
  toCurrency: string
  rate: number
  isManual: boolean
  validFrom: string
  validTo: string | null
  createdAt: string
}

export interface SetRateDto {
  fromCurrency: string
  toCurrency: string
  rate: number
  validFrom?: string
}

const RATES_KEY = 'exchange-rates'

export function useExchangeRates(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString()

  return useQuery({
    queryKey: [RATES_KEY, qs],
    queryFn: () => api.get<ExchangeRate[]>(`/exchange-rates${qs ? `?${qs}` : ''}`),
  })
}

export function useCurrentRate(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString()

  return useQuery({
    queryKey: [RATES_KEY, 'current', qs],
    queryFn: () =>
      api.get<{ fromCurrency: string; toCurrency: string; rate: number | null }>(
        `/exchange-rates/current${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function useSetRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SetRateDto) => api.post<ExchangeRate>('/exchange-rates', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RATES_KEY] }),
  })
}

export function useUpdateRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) =>
      api.patch<ExchangeRate>(`/exchange-rates/${id}`, { rate }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RATES_KEY] }),
  })
}

export function useDeleteRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/exchange-rates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RATES_KEY] }),
  })
}
