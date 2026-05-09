'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export function PwaInstallPrompt() {
  const t = useTranslations('pwa')
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!show) return null

  const handleInstall = async () => {
    if (!deferredPrompt) return
    ;(deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt()
    const result = await (deferredPrompt as unknown as { userChoice: Promise<{ outcome: string }> })
      .userChoice
    if (result.outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg border bg-white p-4 shadow-lg">
      <p className="mb-2 text-sm font-medium">{t('installPrompt')}</p>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          {t('install')}
        </button>
        <button
          onClick={() => setShow(false)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
        >
          {t('dismiss')}
        </button>
      </div>
    </div>
  )
}
