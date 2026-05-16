'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useCommandPaletteStore } from '@/stores/command-palette-store'
import { useShortcutsHelpStore } from '@/stores/shortcuts-help-store'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const locale = useLocale()
  const { toggle: togglePalette } = useCommandPaletteStore()
  const { open: openHelp } = useShortcutsHelpStore()

  useEffect(() => {
    let gPressed = false
    let gTimer: ReturnType<typeof setTimeout> | null = null

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      const isEditing =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement).isContentEditable

      // ? → show shortcuts help (only when not editing)
      if (!isEditing && e.key === '?') {
        e.preventDefault()
        openHelp()
        return
      }

      // ESC → close modals (handled by individual components)

      // ⌘K / Ctrl+K → command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        togglePalette()
        return
      }

      // ⌘B → toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('toggle-sidebar'))
        return
      }

      // G+letter navigation (only when not editing)
      if (!isEditing && e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        gPressed = true
        if (gTimer) clearTimeout(gTimer)
        gTimer = setTimeout(() => {
          gPressed = false
        }, 1000)
        return
      }

      if (gPressed && !isEditing) {
        gPressed = false
        if (gTimer) {
          clearTimeout(gTimer)
          gTimer = null
        }
        const nav: Record<string, string> = {
          d: `/${locale}/dashboard`,
          p: `/${locale}/projects`,
          t: `/${locale}/tasks`,
          i: `/${locale}/invoices`,
          c: `/${locale}/clients`,
          e: `/${locale}/employees`,
          s: `/${locale}/content-studio`,
          l: `/${locale}/leads`,
        }
        const dest = nav[e.key.toLowerCase()]
        if (dest) {
          e.preventDefault()
          router.push(dest)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [router, locale, togglePalette, openHelp])
}
