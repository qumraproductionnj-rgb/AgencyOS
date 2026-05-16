import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import '../globals.css'

interface Props {
  children: ReactNode
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'site' })
  const isAr = locale === 'ar'
  const title = isAr
    ? 'Vision OS — نظام إدارة الوكالات الإبداعية'
    : 'Vision OS — Creative Agency Management System'
  const description = isAr
    ? 'أدر وكالتك الإبداعية بذكاء. موظفون، مشاريع، فواتير، 20 أداة AI. مصمم للسوق العربي.'
    : 'Manage your creative agency smartly. Employees, projects, invoices, 20 AI tools. Built for the Arab market.'
  return {
    title: { default: title, template: `%s | Vision OS` },
    description,
    keywords: isAr
      ? ['إدارة وكالة', 'نظام إدارة', 'وكالة إبداعية', 'Vision OS', 'العراق', 'فواتير', 'مشاريع']
      : ['agency management', 'creative agency', 'Vision OS', 'Iraq', 'invoices', 'projects'],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isAr ? 'ar_IQ' : 'en_US',
      siteName: 'Vision OS',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Vision OS' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `https://agencyos.app/${locale}`,
      languages: { ar: 'https://agencyos.app/ar', en: 'https://agencyos.app/en' },
    },
  }
  void t
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  const messages = await getMessages()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
