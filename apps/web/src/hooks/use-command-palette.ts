import { useEffect } from 'react'
import { useCommandPaletteStore } from '@/stores/command-palette-store'

export function useCommandPalette() {
  const { open, close, toggle } = useCommandPaletteStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape') {
        close()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle, close])

  return { open, close }
}
