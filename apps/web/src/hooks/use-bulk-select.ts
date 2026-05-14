import { useState, useCallback } from 'react'

export function useBulkSelect() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      if (allSelected) return new Set()
      return new Set(ids)
    })
  }, [])

  const clearAll = useCallback(() => setSelectedIds(new Set()), [])

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])

  const isAllSelected = useCallback(
    (ids: string[]) => ids.length > 0 && ids.every((id) => selectedIds.has(id)),
    [selectedIds],
  )

  return {
    selectedIds,
    toggleOne,
    toggleAll,
    clearAll,
    isSelected,
    isAllSelected,
    count: selectedIds.size,
  }
}
