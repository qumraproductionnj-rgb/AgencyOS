'use client'

import { useLocale } from 'next-intl'
import { WifiOff } from 'lucide-react'
import { useSocket } from '@/hooks/use-socket'
import { cn } from '@/lib/utils'

export function ConnectionStatus() {
  const { connected } = useSocket()
  const locale = useLocale()
  const isAr = locale === 'ar'

  if (connected) return null

  return (
    <div
      className={cn(
        'fixed bottom-20 z-50 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-400',
        isAr ? 'left-4' : 'right-4',
      )}
    >
      <WifiOff className="h-3.5 w-3.5" />
      {isAr ? 'غير متصل — جاري إعادة الاتصال...' : 'Offline — reconnecting...'}
    </div>
  )
}
