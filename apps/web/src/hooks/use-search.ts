'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface SearchResult {
  type: string
  id: string
  title: string
  subtitle: string
  data: Record<string, unknown>
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
}

const SEARCH_KEY = 'search'

export function useSearch(query: string) {
  return useQuery({
    queryKey: [SEARCH_KEY, query],
    queryFn: () => api.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
  })
}
