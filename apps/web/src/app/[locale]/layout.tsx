import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { routing } from '../../i18n/routing'
import { AppShell } from '../../components/app-shell'
import { Providers } from '../../components/providers'
import { ErrorBoundary } from '../../components/error-boundary'
import '../../globals.css'

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | VISION OS',
    default: 'VISION OS — نظام إدارة الوكالات الإبداعية',
  },
  description: 'نظام تشغيل متكامل لوكالات التسويق والإنتاج الإبداعي',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VISION OS',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const fontClass = locale === 'ar' ? plexArabic.className : GeistSans.className

  return (
    <html
      lang={locale}
      dir={dir}
      className={`dark ${GeistSans.variable} ${plexArabic.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className={`bg-bg-primary text-foreground min-h-screen antialiased ${fontClass}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <ErrorBoundary>
              <AppShell>{children}</AppShell>
            </ErrorBoundary>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
