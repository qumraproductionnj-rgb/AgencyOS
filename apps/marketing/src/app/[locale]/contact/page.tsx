'use client'

import { useTranslations } from 'next-intl'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { CtaSection } from '@/components/cta'

export default function ContactPage() {
  const t = useTranslations('contact')
  const [sent, setSent] = useState(false)

  return (
    <>
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="mx-auto mt-12 max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-center gap-2 text-gray-600">
            <Mail className="h-5 w-5 text-indigo-600" />
            <a href="mailto:hello@agencyos.app" className="hover:text-indigo-600">
              {t('email')}
            </a>
          </div>
          <p className="mb-8 text-center text-sm text-gray-500">{t('response')}</p>

          {sent ? (
            <div className="rounded-lg bg-green-50 p-6 text-center text-green-700">
              {t('form.success')}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('form.name')}</label>
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('form.email')}</label>
                <input
                  required
                  type="email"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('form.message')}
                </label>
                <textarea
                  required
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                {t('form.submit')}
              </button>
            </form>
          )}
        </div>
      </section>
      <CtaSection />
    </>
  )
}
