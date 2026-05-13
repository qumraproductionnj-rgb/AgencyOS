'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePortalAuth } from '@/hooks/use-portal-auth'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function PortalLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('nav')
  const { logout } = usePortalAuth()
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: t('dashboard') },
    { href: '/projects', label: t('projects') },
    { href: '/files', label: 'Files' },
    { href: '/invoices', label: t('invoices') },
  ]

  const locale = pathname.startsWith('/en') ? 'en' : 'ar'
  const switchLocale = locale === 'ar' ? 'en' : 'ar'

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="font-bold">AgencyOS</span>
            <nav className="hidden items-center gap-4 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'hover:text-primary text-sm font-medium transition-colors',
                    pathname.startsWith(link.href) ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${switchLocale}`}
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              {t('language')}
            </Link>
            <button
              onClick={logout}
              className="text-muted-foreground hover:text-destructive text-sm transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  )
}
