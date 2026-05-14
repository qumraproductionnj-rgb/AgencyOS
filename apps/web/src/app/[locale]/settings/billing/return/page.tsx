'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

function BillingReturnContent() {
  const t = useTranslations('billing')
  const params = useSearchParams()
  const router = useRouter()
  const locale = useLocale()
  const queryClient = useQueryClient()
  const status = params.get('status')

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
  }, [queryClient])

  const isSuccess = status === 'success'
  const isCancelled = status === 'cancelled'

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      {isSuccess && <CheckCircle2 className="h-16 w-16 text-green-500" />}
      {isCancelled && <XCircle className="h-16 w-16 text-gray-400" />}
      {!isSuccess && !isCancelled && <Loader2 className="h-16 w-16 animate-spin text-gray-400" />}

      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {isSuccess
          ? t('returnSuccessTitle')
          : isCancelled
            ? t('returnCancelledTitle')
            : t('returnPendingTitle')}
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {isSuccess
          ? t('returnSuccessBody')
          : isCancelled
            ? t('returnCancelledBody')
            : t('returnPendingBody')}
      </p>

      <button
        type="button"
        onClick={() => router.push(`/${locale}/settings/billing`)}
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {t('backToBilling')}
      </button>
    </div>
  )
}

export default function BillingReturnPage() {
  return (
    <Suspense>
      <BillingReturnContent />
    </Suspense>
  )
}
