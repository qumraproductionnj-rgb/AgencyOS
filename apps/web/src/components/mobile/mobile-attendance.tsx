'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useGPS } from '@/hooks/use-gps'
import { cn } from '@/lib/utils'

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function MobileAttendance() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { getPosition, loading: gpsLoading } = useGPS()
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleCheckIn() {
    setStatus('loading')
    setMessage('')

    try {
      const pos = await getPosition()

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([50, 30, 50])

      const res = await fetch(`${API}/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`,
        },
        body: JSON.stringify({
          latitude: pos.latitude,
          longitude: pos.longitude,
          accuracy: pos.accuracy,
        }),
      })

      if (res.ok) {
        setStatus('success')
        setMessage(isAr ? 'تم تسجيل الحضور بنجاح ✅' : 'Check-in successful ✅')
        if (navigator.vibrate) navigator.vibrate(200)
      } else {
        const err = await res.json()
        setStatus('error')
        setMessage(err.message ?? (isAr ? 'فشل تسجيل الحضور' : 'Check-in failed'))
      }
    } catch (err) {
      setStatus('error')
      setMessage(
        err instanceof Error
          ? err.message
          : isAr
            ? 'تعذّر تحديد موقعك'
            : 'Could not get your location',
      )
    }
  }

  const isLoading = status === 'loading' || gpsLoading

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-lg font-bold">{isAr ? 'تسجيل الحضور' : 'Check In'}</h2>
        <p className="mt-1 text-sm text-white/40">
          {isAr
            ? 'اضغط الزر لتسجيل حضورك بالموقع الحالي'
            : 'Tap button to check in with your location'}
        </p>
      </div>

      {/* Big check-in button */}
      <button
        onClick={handleCheckIn}
        disabled={isLoading || status === 'success'}
        className={cn(
          'relative flex h-40 w-40 flex-col items-center justify-center rounded-full border-4 transition-all duration-300 active:scale-95',
          status === 'success'
            ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400'
            : status === 'error'
              ? 'border-red-400 bg-red-400/10 text-red-400'
              : 'border-sky-400 bg-sky-400/10 text-sky-300 hover:bg-sky-400/20',
          isLoading && 'opacity-60',
        )}
      >
        {isLoading ? (
          <Loader2 className="h-12 w-12 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle className="h-12 w-12" />
        ) : status === 'error' ? (
          <AlertCircle className="h-12 w-12" />
        ) : (
          <MapPin className="h-12 w-12" />
        )}
        <span className="mt-2 text-sm font-semibold">
          {isLoading
            ? isAr
              ? 'جاري...'
              : 'Loading...'
            : status === 'success'
              ? isAr
                ? 'تم!'
                : 'Done!'
              : isAr
                ? 'تسجيل'
                : 'Check In'}
        </span>
      </button>

      {message && (
        <p
          className={cn(
            'rounded-xl px-4 py-3 text-center text-sm font-medium',
            status === 'success'
              ? 'bg-emerald-400/10 text-emerald-300'
              : 'bg-red-400/10 text-red-300',
          )}
        >
          {message}
        </p>
      )}

      {status === 'error' && (
        <button onClick={() => setStatus('idle')} className="text-sm text-white/40 underline">
          {isAr ? 'حاول مرة أخرى' : 'Try again'}
        </button>
      )}
    </div>
  )
}
