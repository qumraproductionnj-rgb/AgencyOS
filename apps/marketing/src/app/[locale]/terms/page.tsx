'use client'

import { useTranslations } from 'next-intl'

const SECTIONS = ['service', 'payments', 'responsibilities', 'limitations', 'termination']

export default function TermsPage() {
  const t = useTranslations('terms')

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-500">{t('lastUpdated')}</p>
        <p className="mt-6 text-gray-600">{t('intro')}</p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <div key={s}>
              <h2 className="text-xl font-semibold text-gray-900">{t(`sections.${s}`)}</h2>
              <p className="mt-2 text-gray-600">{t(`sections.${s}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
