'use client'

import { useTranslations } from 'next-intl'
import { CtaSection } from '@/components/cta'

const FEATURES = [
  'projectManagement',
  'attendanceHr',
  'financial',
  'contentStudio',
  'crmSales',
  'equipmentExhibitions',
  'integrations',
  'multiTenant',
]

export default function FeaturesPage() {
  const t = useTranslations('features')

  return (
    <>
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2">
            {FEATURES.map((feat) => (
              <div key={feat} className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900">{t(`${feat}`)}</h3>
                <p className="mt-3 text-gray-600">{t(`${feat}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  )
}
