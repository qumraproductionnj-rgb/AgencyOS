'use client'

import { useTranslations } from 'next-intl'
import { CtaSection } from '@/components/cta'

const VALUES = ['quality', 'bilingual', 'localFirst', 'security']

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <>
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">{t('mission')}</h2>
          <p className="mt-4 text-gray-600">{t('missionDesc')}</p>
          <h2 className="mt-12 text-2xl font-bold text-gray-900">{t('story')}</h2>
          <p className="mt-4 text-gray-600">{t('storyDesc')}</p>
          <h2 className="mt-12 text-2xl font-bold text-gray-900">{t('valuesTitle')}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v} className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t(`values.${v}`)}</h3>
                <p className="mt-2 text-gray-600">{t(`values.${v}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  )
}
