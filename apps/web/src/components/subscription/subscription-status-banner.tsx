'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { AlertTriangle, Lock, Ban } from 'lucide-react'
import { useCurrentSubscription, type Subscription } from '@/hooks/use-subscription'

const BANNERS: Record<
  string,
  { icon: typeof AlertTriangle; tone: string; titleKey: string; bodyKey: string }
> = {
  TRIAL: {
    icon: AlertTriangle,
    tone: 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
    titleKey: 'trialBannerTitle',
    bodyKey: 'trialBannerBody',
  },
  PAST_DUE: {
    icon: AlertTriangle,
    tone: 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    titleKey: 'pastDueBannerTitle',
    bodyKey: 'pastDueBannerBody',
  },
  READ_ONLY: {
    icon: Lock,
    tone: 'bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-200',
    titleKey: 'readOnlyBannerTitle',
    bodyKey: 'readOnlyBannerBody',
  },
  SUSPENDED: {
    icon: Ban,
    tone: 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200',
    titleKey: 'suspendedBannerTitle',
    bodyKey: 'suspendedBannerBody',
  },
}

export function SubscriptionStatusBanner() {
  const t = useTranslations('billing')
  const locale = useLocale()
  const { data } = useCurrentSubscription()
  const response = data as { subscription: Subscription | null } | undefined
  const sub = response?.subscription
  if (!sub) return null

  const banner = BANNERS[sub.status]
  if (!banner) return null

  // For TRIAL, only show within 3 days of expiry.
  if (sub.status === 'TRIAL' && sub.trialEndsAt) {
    const daysLeft = Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000)
    if (daysLeft > 3) return null
  }

  const Icon = banner.icon
  return (
    <div className={`flex items-start gap-3 rounded-md px-4 py-3 ${banner.tone}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{t(banner.titleKey)}</p>
        <p className="mt-0.5 text-sm">{t(banner.bodyKey)}</p>
      </div>
      {sub.status !== 'SUSPENDED' && (
        <Link
          href={`/${locale}/settings/billing`}
          className="ml-3 shrink-0 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100"
        >
          {t('manageSubscription')}
        </Link>
      )}
    </div>
  )
}
