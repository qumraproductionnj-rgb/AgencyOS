'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAcceptInvite } from '@/hooks/use-employees'

export default function AcceptInvitePage() {
  const t = useTranslations('acceptInvite')
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const accept = useAcceptInvite()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-500">{t('invalidToken')}</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="text-4xl">✓</div>
          <h1 className="text-2xl font-bold">{t('successTitle')}</h1>
          <p className="text-muted-foreground">{t('successMessage')}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('goToLogin')}
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    setError('')
    if (!password || password.length < 8) {
      setError(t('passwordTooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('passwordsDontMatch'))
      return
    }
    try {
      await accept.mutateAsync({ token, password })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('confirmPassword')}</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={accept.isPending || !password}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {accept.isPending ? tCommon('loading') : t('setPassword')}
          </button>
        </div>
      </div>
    </div>
  )
}
