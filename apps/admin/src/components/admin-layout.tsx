'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAdminAuth()
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tenants', label: 'Tenants' },
    { href: '/admins', label: 'Admins' },
  ]

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="font-bold">AgencyOS Admin</span>
            <nav className="hidden items-center gap-4 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'hover:text-primary text-sm font-medium transition-colors',
                    pathname.includes(link.href) ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-muted-foreground hover:text-primary text-sm"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="px-4 py-6">{children}</main>
    </div>
  )
}
