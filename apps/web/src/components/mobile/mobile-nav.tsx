'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { LayoutGrid, FolderKanban, Clock, FileText, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  {
    href: '/dashboard',
    icon: LayoutGrid,
    labelAr: 'الرئيسية',
    labelEn: 'Home',
  },
  {
    href: '/projects',
    icon: FolderKanban,
    labelAr: 'المشاريع',
    labelEn: 'Projects',
  },
  {
    href: '/attendance',
    icon: Clock,
    labelAr: 'الحضور',
    labelEn: 'Attendance',
  },
  {
    href: '/invoices',
    icon: FileText,
    labelAr: 'الفواتير',
    labelEn: 'Invoices',
  },
  {
    href: '/settings',
    icon: MoreHorizontal,
    labelAr: 'المزيد',
    labelEn: 'More',
  },
]

export function MobileNav() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const pathname = usePathname()

  return (
    <nav
      className="mobile-nav fixed bottom-0 left-0 right-0 z-50 hidden border-t border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {tabs.map(({ href, icon: Icon, labelAr, labelEn }) => {
          const fullHref = `/${locale}${href}`
          const isActive = pathname.includes(href)
          return (
            <Link
              key={href}
              href={fullHref}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-sky-400' : 'text-white/40',
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-sky-400" />
                )}
              </div>
              <span>{isAr ? labelAr : labelEn}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
