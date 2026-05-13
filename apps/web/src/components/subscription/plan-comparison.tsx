'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, X, Loader2 } from 'lucide-react'
import {
  useSubscriptionPlans,
  useCurrentSubscription,
  type SubscriptionPlan,
} from '@/hooks/use-subscription'
import {
  useStartCheckout,
  useChangeBillingPlan,
  type PlanKey,
  type BillingInterval,
} from '@/hooks/use-billing'
import { LocalPaymentModal } from './local-payment-modal'

type Currency = 'USD' | 'IQD'

const PAID_KEYS: PlanKey[] = ['starter', 'professional', 'agency']

const FEATURE_ROWS: { key: string; label: string }[] = [
  { key: 'crm', label: 'CRM' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'ai', label: 'AI Tools' },
  { key: 'contentStudio', label: 'Content Studio' },
  { key: 'clientPortal', label: 'Client Portal' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'exhibitions', label: 'Exhibitions' },
  { key: 'whiteLabel', label: 'White Label' },
]

function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'IQD') {
    return `${(amount / 1000).toLocaleString()}k IQD`
  }
  return `$${(amount / 100).toFixed(0)}`
}

export function PlanComparison() {
  const t = useTranslations('billing')
  const [interval, setInterval] = useState<BillingInterval>('month')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [localPaymentPlan, setLocalPaymentPlan] = useState<PlanKey | null>(null)
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans()
  const { data: current } = useCurrentSubscription()
  const checkout = useStartCheckout()
  const changePlan = useChangeBillingPlan()

  if (plansLoading || !plans) {
    return <div className="h-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
  }

  const currentResponse = current as
    | { plan: SubscriptionPlan; subscription: { stripeSubscriptionId: string | null } | null }
    | undefined
  const hasActiveStripeSub = !!currentResponse?.subscription?.stripeSubscriptionId
  const currentPlanKey = currentResponse?.plan?.key

  const paidPlans = plans.filter((p) => PAID_KEYS.includes(p.key as PlanKey))

  async function handleSubscribe(planKey: PlanKey) {
    if (currency === 'IQD') {
      setLocalPaymentPlan(planKey)
      return
    }
    if (hasActiveStripeSub) {
      await changePlan.mutateAsync({ planKey, interval })
      return
    }
    const res = await checkout.mutateAsync({ planKey, interval })
    window.location.assign(res.checkoutUrl)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('compareTitle')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 text-sm ${currency === 'USD' ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}
            >
              USD
            </button>
            <button
              type="button"
              onClick={() => setCurrency('IQD')}
              className={`px-3 py-1.5 text-sm ${currency === 'IQD' ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}
            >
              IQD
            </button>
          </div>
          <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setInterval('month')}
              className={`px-3 py-1.5 text-sm ${
                interval === 'month' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('monthly')}
            </button>
            <button
              type="button"
              onClick={() => setInterval('year')}
              className={`px-3 py-1.5 text-sm ${
                interval === 'year' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('yearly')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {paidPlans.map((plan) => {
          const isCurrent = plan.key === currentPlanKey
          const planRecord = plan as unknown as Record<
            string,
            number | string | Record<string, boolean>
          >
          const usdPrice = interval === 'year' ? plan.priceYearly : plan.priceMonthly
          const iqdPrice =
            (planRecord[interval === 'year' ? 'priceYearlyIqd' : 'priceMonthlyIqd'] as
              | number
              | string
              | undefined) ?? 0
          const price = currency === 'IQD' ? Number(iqdPrice) : usdPrice
          const features = plan.features
          const busy = checkout.isPending || changePlan.isPending
          return (
            <div
              key={plan.key}
              className={`rounded-lg border p-5 ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {plan.nameEn}
                </h3>
                {isCurrent && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    {t('current')}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(price, currency)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  /{interval === 'year' ? t('year') : t('month')}
                </span>
              </div>

              <ul className="mt-4 space-y-2 text-sm">
                {FEATURE_ROWS.map((row) => {
                  const has = features[row.key] === true
                  return (
                    <li key={row.key} className="flex items-center gap-2">
                      {has ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={has ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                        {row.label}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <button
                type="button"
                disabled={isCurrent || busy}
                onClick={() => handleSubscribe(plan.key as PlanKey)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCurrent ? t('currentPlan') : hasActiveStripeSub ? t('switchTo') : t('subscribe')}
              </button>
            </div>
          )
        })}
      </div>

      {(checkout.isError || changePlan.isError) && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          {(checkout.error as Error | null)?.message ?? (changePlan.error as Error | null)?.message}
        </p>
      )}

      {localPaymentPlan && (
        <LocalPaymentModal
          planKey={localPaymentPlan}
          interval={interval}
          onClose={() => setLocalPaymentPlan(null)}
        />
      )}
    </div>
  )
}
