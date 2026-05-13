'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ExternalLink, Loader2, AlertTriangle } from 'lucide-react'
import { useCurrentSubscription, type Subscription } from '@/hooks/use-subscription'
import { useOpenBillingPortal, useCancelBilling } from '@/hooks/use-billing'

export function BillingActions() {
  const t = useTranslations('billing')
  const { data } = useCurrentSubscription()
  const portal = useOpenBillingPortal()
  const cancel = useCancelBilling()
  const [confirmCancel, setConfirmCancel] = useState(false)

  const response = data as { subscription: Subscription | null } | undefined
  const subscription = response?.subscription
  const hasActive = !!subscription?.stripeSubscriptionId
  const willCancel = subscription?.cancelAtPeriodEnd === true

  async function handlePortal() {
    const res = await portal.mutateAsync()
    window.location.assign(res.url)
  }

  async function handleCancel() {
    await cancel.mutateAsync(true)
    setConfirmCancel(false)
  }

  if (!hasActive) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('manageTitle')}</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('manageDescription')}</p>

      {willCancel && subscription?.currentPeriodEnd && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {t('willCancelOn')}: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePortal}
          disabled={portal.isPending}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {portal.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          {t('managePaymentMethods')}
        </button>

        {!willCancel && !confirmCancel && (
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            className="rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            {t('cancelSubscription')}
          </button>
        )}

        {confirmCancel && !willCancel && (
          <div className="flex w-full items-center gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950/40">
            <span className="flex-1 text-sm text-red-700 dark:text-red-300">
              {t('cancelConfirm')}
            </span>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancel.isPending}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {cancel.isPending ? (
                <Loader2 className="inline h-4 w-4 animate-spin" />
              ) : (
                t('cancelConfirmYes')
              )}
            </button>
            <button
              type="button"
              onClick={() => setConfirmCancel(false)}
              className="rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
            >
              {t('cancelConfirmNo')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
