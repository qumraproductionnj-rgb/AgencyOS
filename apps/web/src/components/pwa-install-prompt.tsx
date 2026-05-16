'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Download, X } from 'lucide-react'

const STORAGE_KEY = 'agencyos:pwa:install-dismissed'
const SHOW_DELAY_MS = 30_000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === '1') return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    const timer = setTimeout(() => setShow(true), SHOW_DELAY_MS)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY, '1')
      }
    }
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-[150] rounded-2xl border border-sky-400/20 bg-[#0d0d0d] p-4 shadow-2xl md:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-black text-white">
          V
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {isAr ? 'ثبّت Vision OS على جهازك' : 'Install Vision OS'}
          </p>
          <p className="mt-0.5 text-xs text-white/40">
            {isAr ? 'وصول سريع بدون متصفح' : 'Quick access without browser'}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={install}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/30"
            >
              <Download className="h-3 w-3" />
              {isAr ? 'تثبيت' : 'Install'}
            </button>
            <button
              onClick={dismiss}
              className="rounded-lg px-3 py-1.5 text-xs text-white/30 transition-colors hover:text-white"
            >
              {isAr ? 'لاحقاً' : 'Later'}
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="shrink-0 text-white/20 hover:text-white/50">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
