'use client'

import { useState, useCallback } from 'react'

export interface GpsPosition {
  latitude: number
  longitude: number
  accuracy: number
}

export interface GpsError {
  code: number
  message: string
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useGPS() {
  const [position, setPosition] = useState<GpsPosition | null>(null)
  const [error, setError] = useState<GpsError | null>(null)
  const [loading, setLoading] = useState(false)

  const getPosition = useCallback((): Promise<GpsPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = { code: 0, message: 'Geolocation not supported' }
        setError(err)
        reject(err)
        return
      }

      setLoading(true)
      setError(null)

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const result: GpsPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
          setPosition(result)
          setLoading(false)
          resolve(result)
        },
        (err) => {
          const gpsErr: GpsError = { code: err.code, message: err.message }
          setError(gpsErr)
          setLoading(false)
          reject(gpsErr)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    })
  }, [])

  return { position, error, loading, getPosition, calculateDistance }
}
