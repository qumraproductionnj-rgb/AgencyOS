'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark')

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark')
      }}
      className={cn(
        'border-border inline-flex h-9 w-9 items-center justify-center rounded-md border',
        'hover:bg-accent transition-colors',
      )}
    >
      {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
