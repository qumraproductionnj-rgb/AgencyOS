'use client'

import { useParams, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { usePaymentIntent } from '@/hooks/use-local-billing'
import { ManualPaymentSubmit } from '@/components/subscription/manual-payment-submit'

const STATUS_VIEW: Record<string, { icon: typeof CheckCircle2; tone: string }> = {
  PENDING: { icon: Clock, tone: 'text-blue-600' },
  AWAITING_VERIFICATION: { icon: Clock, tone: 'text-amber-600' },
  PAID: { icon: CheckCircle2, tone: 'text-green-600' },
  FAILED: { icon: XCircle, tone: 'text-red-600' },
  EXPIRED: { icon: AlertCircle, tone: 'text-gray-600' },
  CANCELLED: { icon: XCircle, tone: 'text-gray-600' },
  REJECTED: { icon: XCircle, tone: 'text-red-600' },
}

export default function IqdCheckoutPage() {
  const t = useTranslations('billing')
  const params = useParams<{ id: string; locale: string }>()
  const router = useRouter()
  const locale = useLocale()
  const { data: intent, isLoading } = usePaymentIntent(params.id)

  if (isLoading || !intent) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const statusView = STATUS_VIEW[intent.status] ?? STATUS_VIEW['PENDING']!
  const StatusIcon = statusView.icon

  const amountIqd = Number(intent.amount).toLocaleString()

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-8 w-8 ${statusView.tone}`} />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t(`status_${intent.status}` as keyof IntlMessages['billing'])}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {amountIqd} IQD · {t(intent.interval === 'year' ? 'yearly' : 'monthly')}
            </p>
          </div>
        </div>

        {intent.rejectionReason && (
          <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            <strong>{t('rejectionReason')}: </strong>
            {intent.rejectionReason}
          </div>
        )}

        {intent.expiresAt && intent.status === 'PENDING' && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {t('paymentExpiresAt')}: {new Date(intent.expiresAt).toLocaleString()}
          </p>
        )}
      </div>

      {intent.provider === 'fib' && intent.status === 'PENDING' && intent.qrCode && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('scanWithFibApp')}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('scanQrInstruction')}</p>
          <div className="mt-4 flex justify-center">
            <div className="rounded-md bg-white p-4 shadow-inner">
              {/* QR code is a base64 data URL from the provider; safe to render directly. */}
              <img src={intent.qrCode} alt="FIB QR code" className="h-48 w-48" />
            </div>
          </div>
          {intent.redirectUrl && (
            <a
              href={intent.redirectUrl}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('openInApp')}
            </a>
          )}
          <p className="mt-3 text-xs text-gray-400">{t('autoRefreshNote')}</p>
        </div>
      )}

      {intent.provider === 'manual_bank_transfer' && (
        <ManualPaymentSubmit intentId={intent.id} status={intent.status} />
      )}

      {intent.status === 'PAID' && (
        <button
          type="button"
          onClick={() => router.push(`/${locale}/settings/billing`)}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t('backToBilling')}
        </button>
      )}
    </div>
  )
}

// Stub interface to satisfy the t() generic; messages JSON is the runtime source.
interface IntlMessages {
  billing: Record<string, string>
}
