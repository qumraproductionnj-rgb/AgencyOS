'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Check } from 'lucide-react'

const PLANS = [
  {
    key: 'starter',
    users: 5,
    storage: '10 GB',
    ai: 0,
    features: ['coreModules'],
    ctaKey: 'getStarted',
    featured: false,
    href: '/signup',
  },
  {
    key: 'professional',
    users: 20,
    storage: '100 GB',
    ai: 50,
    features: ['coreModules', 'clientPortal'],
    ctaKey: 'getStarted',
    featured: true,
    href: '/signup',
  },
  {
    key: 'agency',
    users: null,
    storage: '1 TB',
    ai: null,
    features: ['allModules', 'clientPortal', 'whiteLabel', 'customDomain', 'prioritySupport'],
    ctaKey: 'getStarted',
    featured: false,
    href: '/signup',
  },
  {
    key: 'enterprise',
    users: null,
    storage: null,
    ai: null,
    features: ['allModules', 'whiteLabel', 'customDomain', 'prioritySupport', 'customIntegrations'],
    ctaKey: 'contactUs',
    featured: false,
    href: '/contact',
  },
]

export default function PricingPage() {
  const t = useTranslations('pricing')
  const locale = useLocale()

  return (
    <>
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-xl border p-6 ${plan.featured ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-200'}`}
            >
              {plan.featured && (
                <span className="mb-3 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{t(plan.key)}</h3>
              <p className="mt-1 text-sm text-gray-500">{t(`${plan.key}Desc`)}</p>
              <p className="mt-4 text-3xl font-bold text-gray-900">
                {plan.key === 'enterprise' ? '—' : '$99'}
                <span className="text-sm font-normal text-gray-500">{t('monthly')}</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {plan.users !== null && (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" /> {plan.users} {t('features.users')}
                  </li>
                )}
                {plan.storage !== null && (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" /> {plan.storage}{' '}
                    {t('features.storage')}
                  </li>
                )}
                {plan.ai !== null && (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" /> {plan.ai}{' '}
                    {t('features.aiGenerations')}
                  </li>
                )}
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" /> {t(`features.${f}`)}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}${plan.href}`}
                className={`mt-6 block rounded-lg px-4 py-2 text-center text-sm font-semibold ${
                  plan.featured
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t(plan.ctaKey)}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">{t('faq.title')}</h2>
          <div className="mt-8 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <details key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">
                  {t(`faq.q${i}`)}
                </summary>
                <p className="mt-2 text-gray-600">{t(`faq.a${i}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
