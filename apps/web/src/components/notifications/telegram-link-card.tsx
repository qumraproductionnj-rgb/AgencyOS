'use client'

import { useTranslations } from 'next-intl'
import { useTelegramStatus, useGenerateTelegramLink, useUnlinkTelegram } from '@/hooks/use-telegram'
import { format } from 'date-fns'

export function TelegramLinkCard() {
  const t = useTranslations('telegram')
  const { data: status, isLoading: statusLoading } = useTelegramStatus()
  const generateLink = useGenerateTelegramLink()
  const unlink = useUnlinkTelegram()

  const handleLink = async () => {
    const result = await generateLink.mutateAsync()
    window.open(result.deepLink, '_blank')
  }

  const handleUnlink = async () => {
    await unlink.mutateAsync()
  }

  if (statusLoading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
      </div>
    )
  }

  const isLinked = status?.linked ?? false

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isLinked
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {isLinked ? t('linked') : t('notLinked')}
        </span>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
      <div className="mt-4 space-y-4">
        {status?.linkedAt && (
          <p className="text-muted-foreground text-sm">
            {t('linkedAt', { date: format(new Date(status.linkedAt), 'yyyy-MM-dd HH:mm') })}
          </p>
        )}

        {!isLinked && !generateLink.data && (
          <button
            onClick={handleLink}
            disabled={generateLink.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generateLink.isPending ? t('generating') : t('linkButton')}
          </button>
        )}

        {generateLink.data && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">{t('linkSuccess')}</p>
            <a
              href={generateLink.data.deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('openTelegram')}
            </a>
            <p className="text-muted-foreground text-xs">
              {t('expiresIn', { minutes: Math.round(generateLink.data.expiresInSeconds / 60) })}
            </p>
          </div>
        )}

        {isLinked && (
          <button
            onClick={handleUnlink}
            disabled={unlink.isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {unlink.isPending ? t('unlinking') : t('unlinkButton')}
          </button>
        )}
      </div>
    </div>
  )
}
