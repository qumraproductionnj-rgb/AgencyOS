'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Loader2 } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { useSearch } from '@/hooks/use-search'
const TYPE_ROUTES: Record<string, string> = {
  client: '/clients',
  project: '/projects',
  task: '/tasks',
  lead: '/leads',
  invoice: '/invoices',
  employee: '/employees',
  file: '/files',
  campaign: '/campaigns',
}

const TYPE_LABELS: Record<string, string> = {
  client: 'Clients',
  project: 'Projects',
  task: 'Tasks',
  lead: 'Leads',
  invoice: 'Invoices',
  employee: 'Employees',
  file: 'Files',
  campaign: 'Campaigns',
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('search')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { data, isFetching } = useSearch(query)

  const grouped = data?.results.reduce(
    (acc, r) => {
      const group = r.type
      if (!acc[group]) acc[group] = []
      acc[group].push(r)
      return acc
    },
    {} as Record<string, typeof data.results>,
  )

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [open])

  const handleSelect = useCallback(
    (type: string, id: string) => {
      const route = TYPE_ROUTES[type]
      if (route) {
        router.push(`${route}?id=${id}`)
      }
      onClose()
    },
    [router, onClose],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-lg border bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="flex-1 text-sm outline-none"
          />
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          <kbd className="hidden rounded border px-1.5 text-[10px] text-gray-400 sm:inline">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.length < 2 ? (
            <p className="p-6 text-center text-sm text-gray-400">{t('minChars')}</p>
          ) : !data || data.total === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">{t('noResults')}</p>
          ) : (
            Object.entries(grouped ?? {}).map(([type, items]) => (
              <div key={type}>
                <div className="bg-gray-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {TYPE_LABELS[type] ?? type}
                </div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.type, item.id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition-colors hover:bg-blue-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{item.title}</p>
                      {item.subtitle && (
                        <p className="truncate text-xs text-gray-500">{item.subtitle}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function SearchTrigger() {
  const t = useTranslations('search')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">{t('search')}</span>
        <kbd className="rounded border px-1 text-[10px]">Ctrl+K</kbd>
      </button>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
