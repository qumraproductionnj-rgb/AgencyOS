'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  useEquipmentItem,
  useEquipmentBookings,
  useEquipmentMaintenance,
  useCreateBooking,
  useUpdateBookingStatus,
  useCreateMaintenance,
  useEquipmentQrCode,
  useRegenerateQrCode,
} from '@/hooks/use-equipment'
import { format } from 'date-fns'

interface Props {
  id: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  CHECKED_OUT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  RETURNED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
}

export function EquipmentDetail({ id }: Props) {
  const t = useTranslations('equipment')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { data: item, isLoading } = useEquipmentItem(id)
  const { data: bookings } = useEquipmentBookings(id)
  const { data: maintenance } = useEquipmentMaintenance(id)
  const { data: qrData } = useEquipmentQrCode(id)
  const regenerateQr = useRegenerateQrCode()
  const createBooking = useCreateBooking()
  const updateStatus = useUpdateBookingStatus()
  const createMaintenance = useCreateMaintenance()

  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showMaintForm, setShowMaintForm] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    bookingStart: '',
    bookingEnd: '',
    projectId: '',
  })
  const [maintForm, setMaintForm] = useState({
    maintenanceDate: '',
    type: 'ROUTINE',
    description: '',
    cost: '',
    performedBy: '',
  })

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    await createBooking.mutateAsync({
      equipmentId: id,
      bookingStart: bookingForm.bookingStart,
      bookingEnd: bookingForm.bookingEnd,
      projectId: bookingForm.projectId || undefined,
    })
    setShowBookingForm(false)
    setBookingForm({ bookingStart: '', bookingEnd: '', projectId: '' })
  }

  const handleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMaintenance.mutateAsync({
      equipmentId: id,
      maintenanceDate: maintForm.maintenanceDate,
      type: maintForm.type,
      description: maintForm.description || undefined,
      cost: maintForm.cost ? parseInt(maintForm.cost, 10) : undefined,
      performedBy: maintForm.performedBy || undefined,
    })
    setShowMaintForm(false)
    setMaintForm({
      maintenanceDate: '',
      type: 'ROUTINE',
      description: '',
      cost: '',
      performedBy: '',
    })
  }

  const handleCheckout = async (bookingId: string) => {
    await updateStatus.mutateAsync({ id: bookingId, status: 'CHECKED_OUT' })
  }

  const handleReturn = async (bookingId: string) => {
    const notes = window.prompt('Return condition notes:')
    const data: { id: string; status: string; returnConditionNotes?: string } = {
      id: bookingId,
      status: 'RETURNED',
    }
    if (notes) data.returnConditionNotes = notes
    await updateStatus.mutateAsync(data)
  }

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>
  if (!item) return <p className="p-4 text-red-600">{t('notFound')}</p>

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
        &larr; {tCommon('back')}
      </button>

      {/* Header */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">
              {item.brand && `${item.brand} ${item.model ?? ''}`}
              {item.serialNumber && ` — ${t('serialNumber')}: ${item.serialNumber}`}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[item.currentStatus] ?? ''}`}
          >
            {t(`status_${item.currentStatus}`)}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs">{t('category')}</p>
            <p className="font-medium">{t(`cat_${item.category}`)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{t('condition')}</p>
            <p className="font-medium">{t(`cond_${item.condition}`)}</p>
          </div>
          {item.holder?.fullNameAr && (
            <div>
              <p className="text-muted-foreground text-xs">{t('holder')}</p>
              <p className="font-medium">{item.holder.fullNameAr}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-xs">{t('purchasePrice')}</p>
            <p className="font-medium">
              {item.purchasePrice
                ? `${(item.purchasePrice / 1000).toFixed(1)}K ${item.currency ?? ''}`
                : '—'}
            </p>
          </div>
        </div>

        {/* QR Code */}
        {qrData?.qrCodeUrl && (
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-sm font-medium">{t('qrCode')}</p>
            <div className="flex items-center gap-4">
              <img src={qrData.qrCodeUrl} alt="QR Code" className="h-24 w-24 border" />
              <button
                onClick={() => regenerateQr.mutate(id)}
                disabled={regenerateQr.isPending}
                className="text-sm text-blue-600 hover:underline"
              >
                {t('regenerateQr')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bookings */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('bookings')}</h2>
          <button
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            + {t('newBooking')}
          </button>
        </div>

        {showBookingForm && (
          <form
            onSubmit={handleBook}
            className="mb-4 space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium">{t('bookingStart')}</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingForm.bookingStart}
                  onChange={(e) => setBookingForm({ ...bookingForm, bookingStart: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">{t('bookingEnd')}</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingForm.bookingEnd}
                  onChange={(e) => setBookingForm({ ...bookingForm, bookingEnd: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium">{t('projectId')}</label>
              <input
                value={bookingForm.projectId}
                onChange={(e) => setBookingForm({ ...bookingForm, projectId: e.target.value })}
                placeholder="Project ID (optional)"
                className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createBooking.isPending}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {tCommon('save')}
              </button>
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {tCommon('cancel')}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {bookings?.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded border p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {format(new Date(b.bookingStart), 'yyyy-MM-dd HH:mm')} →{' '}
                  {format(new Date(b.bookingEnd), 'yyyy-MM-dd HH:mm')}
                </p>
                <p className="text-muted-foreground text-xs">
                  {b.project?.name && `${b.project.name} · `}
                  {b.booker?.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status] ?? ''}`}
                >
                  {t(`bookingStatus_${b.status}`)}
                </span>
                {b.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCheckout(b.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {t('checkout')}
                  </button>
                )}
                {b.status === 'CHECKED_OUT' && (
                  <button
                    onClick={() => handleReturn(b.id)}
                    className="text-xs text-green-600 hover:underline"
                  >
                    {t('return')}
                  </button>
                )}
              </div>
            </div>
          ))}
          {(!bookings || bookings.length === 0) && (
            <p className="text-muted-foreground text-sm">{t('noBookings')}</p>
          )}
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('maintenance')}</h2>
          <button
            onClick={() => setShowMaintForm(!showMaintForm)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            + {t('addMaintenance')}
          </button>
        </div>

        {showMaintForm && (
          <form
            onSubmit={handleMaintenance}
            className="mb-4 space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium">{t('maintenanceDate')}</label>
                <input
                  type="date"
                  required
                  value={maintForm.maintenanceDate}
                  onChange={(e) => setMaintForm({ ...maintForm, maintenanceDate: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">{t('maintType')}</label>
                <select
                  value={maintForm.type}
                  onChange={(e) => setMaintForm({ ...maintForm, type: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="ROUTINE">{t('maintType_ROUTINE')}</option>
                  <option value="REPAIR">{t('maintType_REPAIR')}</option>
                  <option value="CALIBRATION">{t('maintType_CALIBRATION')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium">{t('description')}</label>
              <textarea
                value={maintForm.description}
                onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium">{t('cost')}</label>
                <input
                  type="number"
                  value={maintForm.cost}
                  onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">{t('performedBy')}</label>
                <input
                  value={maintForm.performedBy}
                  onChange={(e) => setMaintForm({ ...maintForm, performedBy: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMaintenance.isPending}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {tCommon('save')}
              </button>
              <button
                type="button"
                onClick={() => setShowMaintForm(false)}
                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {tCommon('cancel')}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {maintenance?.map((m) => (
            <div key={m.id} className="rounded border p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {format(new Date(m.maintenanceDate), 'yyyy-MM-dd')} — {t(`maintType_${m.type}`)}
                </p>
                {m.cost && (
                  <span className="text-xs">
                    {m.cost} {m.currency}
                  </span>
                )}
              </div>
              {m.description && (
                <p className="text-muted-foreground mt-1 text-xs">{m.description}</p>
              )}
              {m.performedBy && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {t('performedBy')}: {m.performedBy}
                </p>
              )}
            </div>
          ))}
          {(!maintenance || maintenance.length === 0) && (
            <p className="text-muted-foreground text-sm">{t('noMaintenance')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
