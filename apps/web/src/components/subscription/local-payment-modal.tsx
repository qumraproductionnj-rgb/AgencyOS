'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Loader2, X, Building2, QrCode, Banknote } from 'lucide-react'
import {
  useLocalGateways,
  useCreateLocalCheckout,
  type LocalGatewayCode,
} from '@/hooks/use-local-billing'
import type { PlanKey, BillingInterval } from '@/hooks/use-billing'

interface Props {
  planKey: PlanKey
  interval: BillingInterval
  onClose: () => void
}

export function LocalPaymentModal({ planKey, interval, onClose }: Props) {
  const t = useTranslations('billing')
  const router = useRouter()
  const locale = useLocale()
  const { data: gateways } = useLocalGateways()
  const checkout = useCreateLocalCheckout()
  const [provider, setProvider] = useState<LocalGatewayCode>('fib')

  async function handleContinue() {
    const res = await checkout.mutateAsync({ planKey, interval, provider })
    router.push(`/${locale}/settings/billing/iqd-checkout/${res.id}`)
  }

  const options: {
    code: LocalGatewayCode
    icon: typeof QrCode
    available: boolean
    label: string
    desc: string
  }[] = [
    {
      code: 'fib',
      icon: QrCode,
      available: gateways?.find((g) => g.code === 'fib')?.isImplemented ?? true,
      label: t('gatewayFib'),
      desc: t('gatewayFibDesc'),
    },
    {
      code: 'manual_bank_transfer',
      icon: Building2,
      available: true,
      label: t('gatewayManual'),
      desc: t('gatewayManualDesc'),
    },
    {
      code: 'zaincash',
      icon: Banknote,
      available: gateways?.find((g) => g.code === 'zaincash')?.isImplemented ?? false,
      label: t('gatewayZainCash'),
      desc: t('comingSoon'),
    },
    {
      code: 'fastpay',
      icon: Banknote,
      available: gateways?.find((g) => g.code === 'fastpay')?.isImplemented ?? false,
      label: t('gatewayFastPay'),
      desc: t('comingSoon'),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('selectGateway')}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {options.map((opt) => {
            const isSelected = provider === opt.code
            return (
              <button
                key={opt.code}
                type="button"
                disabled={!opt.available}
                onClick={() => setProvider(opt.code)}
                className={`flex w-full items-start gap-3 rounded-md border p-3 text-left transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-gray-200 dark:border-gray-700'
                } ${!opt.available ? 'cursor-not-allowed opacity-50' : 'hover:border-blue-400'}`}
              >
                <opt.icon className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {checkout.isError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {(checkout.error as Error).message}
          </p>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={checkout.isPending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {checkout.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('continue')}
        </button>
      </div>
    </div>
  )
}
