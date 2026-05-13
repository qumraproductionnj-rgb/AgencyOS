'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

export function CtaSection() {
  const t = useTranslations('home')
  const locale = useLocale()
  const signupUrl = `${locale === 'ar' ? '' : '/en'}/signup`

  return (
    <section className="bg-indigo-600 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t('ctaTitle')}
        </h2>
        <p className="mt-4 text-lg text-indigo-100">{t('ctaSubtitle')}</p>
        <Link
          href={signupUrl}
          className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-indigo-600 hover:bg-indigo-50"
        >
          {t('ctaButton')}
        </Link>
      </div>
    </section>
  )
}
