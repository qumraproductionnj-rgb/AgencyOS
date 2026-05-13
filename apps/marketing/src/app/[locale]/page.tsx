'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { ArrowRight, CheckCircle, BarChart3, Users, Globe } from 'lucide-react'
import { CtaSection } from '@/components/cta'

const FEATURES = [
  { key: 'projects', icon: BarChart3 },
  { key: 'attendance', icon: Users },
  { key: 'finance', icon: Globe },
  { key: 'content', icon: CheckCircle },
  { key: 'crm', icon: Users },
  { key: 'reports', icon: BarChart3 },
]

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()
  const signupUrl = `${locale === 'ar' ? '' : '/en'}/signup`

  return (
    <>
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
            {t('heroSubtitle')}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href={signupUrl}
              className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700"
            >
              {t('heroCta')}
              <ArrowRight className="ml-2 inline h-5 w-5" />
            </Link>
            <Link
              href={`/${locale}/features`}
              className="rounded-lg border border-gray-300 px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t('heroSecondary')}
            </Link>
          </div>
          <div className="mt-12 flex justify-center gap-8 text-sm text-gray-500">
            <span>{t('stats.agencies')}</span>
            <span>{t('stats.countries')}</span>
            <span>{t('stats.uptime')}</span>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">{t('featuresTitle')}</h2>
            <p className="mt-4 text-lg text-gray-600">{t('featuresSubtitle')}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              return (
                <div key={feat.key} className="rounded-xl bg-white p-6 shadow-sm">
                  <Icon className="h-8 w-8 text-indigo-600" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {t(`featuresList.${feat.key}`)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{t(`featuresList.${feat.key}Desc`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
