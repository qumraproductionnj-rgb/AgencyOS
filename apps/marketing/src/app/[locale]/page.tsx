'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { ArrowRight, CheckCircle, BarChart3, Users, Globe, Star, ChevronDown } from 'lucide-react'
import { CtaSection } from '@/components/cta'

const FEATURES = [
  { key: 'projects', icon: BarChart3 },
  { key: 'attendance', icon: Users },
  { key: 'finance', icon: Globe },
  { key: 'content', icon: CheckCircle },
  { key: 'crm', icon: Users },
  { key: 'reports', icon: BarChart3 },
]

const TESTIMONIALS = [
  {
    nameAr: 'أحمد الحسيني',
    nameEn: 'Ahmed Al-Husseini',
    companyAr: 'وكالة نبض للإبداع',
    companyEn: 'Pulse Creative Agency',
    textAr: 'Vision OS غيّر طريقة إدارتنا للمشاريع. وفّرنا 10 ساعات أسبوعياً على التقارير وحدها.',
    textEn:
      'Vision OS transformed how we manage projects. We saved 10 hours per week on reports alone.',
    rating: 5,
  },
  {
    nameAr: 'سارة المحمد',
    nameEn: 'Sara Al-Mohammed',
    companyAr: 'ستوديو رؤية',
    companyEn: 'Vision Studio',
    textAr: 'أخيراً نظام يفهم السوق العراقي. الفواتير بالدينار والعربية الكاملة. ممتاز!',
    textEn:
      'Finally a system that understands the Iraqi market. IQD invoices and full Arabic. Excellent!',
    rating: 5,
  },
  {
    nameAr: 'كريم ناصر',
    nameEn: 'Kareem Nasser',
    companyAr: 'ميديا ماكس',
    companyEn: 'Media Max',
    textAr: 'فريقنا من 15 شخص الآن يعمل بتنسيق مثالي. تسجيل الحضور بـ GPS حلّ مشكلة كبيرة.',
    textEn:
      'Our 15-person team now works in perfect sync. GPS attendance solved a major problem for us.',
    rating: 5,
  },
]

const FAQ_ITEMS = [
  {
    qAr: 'هل يدعم اللغة العربية كاملاً؟',
    qEn: 'Does it fully support Arabic?',
    aAr: 'نعم، النظام مبني أساساً للعربية مع دعم RTL كامل وخطوط عربية احترافية.',
    aEn: 'Yes, the system is built primarily for Arabic with full RTL support and professional Arabic fonts.',
  },
  {
    qAr: 'هل يعمل على الجوال؟',
    qEn: 'Does it work on mobile?',
    aAr: 'نعم، يعمل كـ PWA على الجوال مع تطبيق Desktop لـ Windows/Mac.',
    aEn: 'Yes, works as a PWA on mobile with a Desktop app for Windows/Mac.',
  },
  {
    qAr: 'كيف يختلف عن Excel؟',
    qEn: 'How is it different from Excel?',
    aAr: 'Excel يدار يدوياً بدون تتبع حضور أو GPS أو AI أو Client Portal أو تقارير تلقائية.',
    aEn: 'Excel is manual with no GPS attendance, AI, Client Portal, or automatic reports.',
  },
  {
    qAr: 'هل بياناتي آمنة؟',
    qEn: 'Is my data safe?',
    aAr: 'نعم، تشفير كامل، خوادم في أوروبا، نسخ احتياطية يومية، وكل شركة معزولة تماماً.',
    aEn: 'Yes, full encryption, European servers, daily backups, and complete company isolation.',
  },
  {
    qAr: 'هل هناك عقد أو التزام؟',
    qEn: 'Is there a contract or commitment?',
    aAr: 'لا، الاشتراك شهري يمكن إلغاؤه في أي وقت بدون رسوم إضافية.',
    aEn: 'No, monthly subscription cancelable at any time with no extra fees.',
  },
  {
    qAr: 'هل يدعم الدينار العراقي؟',
    qEn: 'Does it support Iraqi Dinar?',
    aAr: 'نعم، يدعم IQD و USD مع تنسيق الأرقام العربية والغربية.',
    aEn: 'Yes, supports IQD and USD with both Arabic and Western number formatting.',
  },
  {
    qAr: 'كم موظفاً يمكنني إضافة؟',
    qEn: 'How many employees can I add?',
    aAr: 'Starter: 3 موظفين، Pro: 15، Agency: غير محدود.',
    aEn: 'Starter: 3 employees, Pro: 15, Agency: unlimited.',
  },
  {
    qAr: 'هل يوجد دعم فني عربي؟',
    qEn: 'Is there Arabic technical support?',
    aAr: 'نعم، دعم عبر واتساب باللغة العربية من الساعة 9 صباحاً حتى 9 مساءً.',
    aEn: 'Yes, WhatsApp support in Arabic from 9am to 9pm.',
  },
]

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const signupUrl = `${locale === 'ar' ? '' : '/en'}/signup`
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {isAr ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-gray-700">
                  &ldquo;{isAr ? t.textAr : t.textEn}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {isAr ? t.nameAr : t.nameEn}
                  </p>
                  <p className="text-xs text-gray-400">{isAr ? t.companyAr : t.companyEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {isAr ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-start"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-gray-900">{isAr ? item.qAr : item.qEn}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-gray-600">
                    {isAr ? item.aAr : item.aEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
