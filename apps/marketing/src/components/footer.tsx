'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

export function Footer() {
  const t = useTranslations()
  const locale = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-lg font-bold text-indigo-600">AgencyOS</span>
            <p className="mt-2 text-sm text-gray-500">{t('site.description')}</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">{t('footer.product')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href={`/${locale}/features`} className="hover:text-gray-900">
                  {t('nav.features')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/pricing`} className="hover:text-gray-900">
                  {t('nav.pricing')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">{t('footer.company')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-gray-900">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-gray-900">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-gray-900">
                  {t('privacy.title')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-gray-900">
                  {t('terms.title')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          &copy; {year} AgencyOS. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
