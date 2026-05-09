'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useToday, useCheckIn, useCheckOut } from '@/hooks/use-attendance'

export default function CheckInPage() {
  const t = useTranslations('attendance')
  const tCommon = useTranslations('common')
  const { data: today } = useToday()
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()

  const [position, setPosition] = useState<{ lat: number; lng: number; accuracy: number } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [geoWatch, setGeoWatch] = useState<number | null>(null)

  const isCheckedIn = !!today && !today.checkOutTime
  const busy = checkIn.isPending || checkOut.isPending

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t('geoNotSupported'))
      return
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        })
        setError(null)
      },
      (err) => {
        setError(err.code === 1 ? t('geoDenied') : t('geoError'))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    )
    setGeoWatch(id)
  }, [t])

  useEffect(() => {
    requestPosition()
    return () => {
      if (geoWatch !== null) navigator.geolocation.clearWatch(geoWatch)
    }
  }, [requestPosition])

  const handleCheckIn = async () => {
    if (!position) {
      setError(t('noPosition'))
      return
    }
    setError(null)
    try {
      await checkIn.mutateAsync({ latitude: position.lat, longitude: position.lng })
    } catch (err) {
      const msg = err instanceof Error ? err.message : tCommon('error')
      setError(msg)
    }
  }

  const handleCheckOut = async () => {
    setError(null)
    try {
      await checkOut.mutateAsync(
        position ? { latitude: position.lat, longitude: position.lng } : {},
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : tCommon('error')
      setError(msg)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold">{t('checkIn')}</h1>

        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-sm">{t('locationStatus')}</p>
          {position ? (
            <div className="flex flex-col items-center">
              <span className="font-mono text-xs">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </span>
              <span
                className={`text-xs ${position.accuracy <= 50 ? 'text-green-600' : 'text-yellow-600'}`}
              >
                ±{position.accuracy}m {t('accuracy')}
              </span>
            </div>
          ) : (
            <p className="text-sm text-yellow-600">{t('acquiringLocation')}</p>
          )}
        </div>

        <button
          onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
          disabled={busy || !position}
          className={`mx-auto flex h-32 w-32 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${isCheckedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {busy ? tCommon('loading') : isCheckedIn ? t('checkOut') : t('checkIn')}
        </button>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {today && (
          <div className="rounded-lg border p-4 text-start">
            <h3 className="mb-2 text-sm font-semibold">{t('todaySummary')}</h3>
            <div className="space-y-1 text-xs">
              <p>
                {t('status')}: <span className="font-medium">{today.status}</span>
              </p>
              <p>
                {t('checkInTime')}: {new Date(today.checkInTime).toLocaleTimeString()}
              </p>
              {today.checkOutTime && (
                <p>
                  {t('checkOutTime')}: {new Date(today.checkOutTime).toLocaleTimeString()}
                </p>
              )}
              {today.workHoursCalculated !== null && (
                <p>
                  {t('hours')}: {today.workHoursCalculated.toFixed(2)}
                </p>
              )}
              {today.workLocation && (
                <p>
                  {t('location')}: {today.workLocation.name}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowHelp(true)}
          className="text-muted-foreground text-xs underline"
        >
          {t('whyBlocked')}
        </button>
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-semibold">{t('helpTitle')}</h3>
            <ul className="space-y-2 text-sm">
              <li>• {t('helpGps')}</li>
              <li>• {t('helpRange')}</li>
              <li>• {t('helpLocation')}</li>
              <li>• {t('helpPermissions')}</li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {tCommon('confirm')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
