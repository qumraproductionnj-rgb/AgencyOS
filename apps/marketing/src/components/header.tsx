'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { key: 'home', href: '/' },
  { key: 'features', href: '/features' },
  { key: 'pricing', href: '/pricing' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
]

export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const signupUrl = `${locale === 'ar' ? '' : '/en'}/signup`

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-600">AgencyOS</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={signupUrl}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t('signUp')}
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="p-2 md:hidden">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href={signupUrl}
            className="mt-3 block rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white"
            onClick={() => setOpen(false)}
          >
            {t('signUp')}
          </Link>
        </div>
      )}
    </header>
  )
}
