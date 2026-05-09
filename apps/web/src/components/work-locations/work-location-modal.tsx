'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import {
  useCreateWorkLocation,
  useUpdateWorkLocation,
  useWorkLocation,
} from '@/hooks/use-work-locations'
import { useEmployees } from '@/hooks/use-employees'

const LocationMapPicker = dynamic(
  () => import('./location-map-picker').then((m) => m.LocationMapPicker),
  { ssr: false },
)

interface Props {
  id: string | null
  onClose: () => void
}

const BAGHDAD_LAT = 33.3152
const BAGHDAD_LNG = 44.3661

export function WorkLocationModal({ id, onClose }: Props) {
  const t = useTranslations('workLocations')
  const tCommon = useTranslations('common')
  const isEdit = !!id

  const { data: existing } = useWorkLocation(id ?? '')
  const { data: employees } = useEmployees()
  const create = useCreateWorkLocation()
  const update = useUpdateWorkLocation()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState(BAGHDAD_LAT)
  const [longitude, setLongitude] = useState(BAGHDAD_LNG)
  const [radiusMeters, setRadiusMeters] = useState(100)
  const [isActive, setIsActive] = useState(true)
  const [employeeIds, setEmployeeIds] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setAddress(existing.address ?? '')
      setLatitude(existing.latitude)
      setLongitude(existing.longitude)
      setRadiusMeters(existing.radiusMeters)
      setIsActive(existing.isActive)
      setEmployeeIds(existing.workLocationEmployees?.map((e) => e.employee.id) ?? [])
    }
  }, [existing])

  const busy = create.isPending || update.isPending

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) {
      setError(t('nameRequired'))
      return
    }
    const payload: Record<string, unknown> = {
      name: name.trim(),
      latitude,
      longitude,
      radiusMeters,
      isActive,
    }
    if (address.trim()) payload['address'] = address.trim()
    if (employeeIds.length > 0) payload['employeeIds'] = employeeIds

    if (isEdit) {
      await update.mutateAsync({ id: id!, ...payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  const toggleEmployee = (empId: string) => {
    setEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId],
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">{isEdit ? t('editTitle') : t('createTitle')}</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t('address')}</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t('clickMap')}</label>
            <LocationMapPicker
              latitude={latitude}
              longitude={longitude}
              radius={radiusMeters}
              onChange={(lat, lng) => {
                setLatitude(lat)
                setLongitude(lng)
              }}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">
              {t('radius')}: {radiusMeters}m
            </label>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              {t('active')}
            </label>
          </div>

          <div>
            <label className="text-sm font-medium">{t('assignEmployees')}</label>
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2">
              {employees?.map((emp) => (
                <label key={emp.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={employeeIds.includes(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                    className="rounded"
                  />
                  {emp.fullNameAr} ({emp.employeeCode})
                </label>
              ))}
              {!employees?.length && (
                <p className="text-muted-foreground text-xs">{t('noEmployees')}</p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !name.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
