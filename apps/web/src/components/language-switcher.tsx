'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const LOCALES = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
] as const

export function LanguageSwitcher() {
  const currentLocale = useLocale()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-2">
      {LOCALES.map((loc) => (
        <Link
          key={loc.code}
          href={pathname}
          locale={loc.code}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            currentLocale === loc.code
              ? 'bg-primary text-primary-foreground'
              : 'border-border hover:bg-accent border',
          )}
        >
          {loc.label}
        </Link>
      ))}
    </div>
  )
}
