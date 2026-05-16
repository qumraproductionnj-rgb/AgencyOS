'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export function RouteError({ error, reset }: Props) {
  const router = useRouter()

  useEffect(() => {
    // Log to console for debugging; Sentry picks it up automatically
    console.error('[RouteError]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-red-50 p-4">
        <AlertTriangle className="text-red-500" size={32} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800">عذراً، حدث خطأ غير متوقع</h2>
        <p className="mt-1 text-sm text-gray-500">Something went wrong loading this page.</p>
        {error.message && (
          <p className="mt-2 max-w-sm rounded bg-gray-100 px-3 py-1 font-mono text-xs text-gray-600">
            {error.message}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw size={14} />
          Try again
        </button>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={14} />
          Go back
        </button>
      </div>
    </div>
  )
}
