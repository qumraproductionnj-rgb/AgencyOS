'use client'

import { useOnline } from '@/hooks/use-online'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[999] flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <WifiOff size={14} />
      <span>No internet connection — changes will not be saved</span>
    </div>
  )
}
