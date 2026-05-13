'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useBooths,
  useCreateBooth,
  useUpdateBooth,
  useDeleteBooth,
  useInventory,
  useCreateInventory,
  useDeleteInventory,
} from '@/hooks/use-exhibitions'

interface Props {
  exhibitionId: string
}

const DESIGN_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  designing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
}

const SETUP_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  in_setup: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  live: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  dismantled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

export function BoothSection({ exhibitionId }: Props) {
  const t = useTranslations('exhibitions')
  const tCommon = useTranslations('common')
  const { data: booths, isLoading } = useBooths(exhibitionId)
  const createBooth = useCreateBooth()
  const updateBooth = useUpdateBooth()
  const deleteBooth = useDeleteBooth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ brandName: '', boothNumber: '', boothSize: '', notes: '' })
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null)
  const [showInventoryForm, setShowInventoryForm] = useState(false)
  const [invForm, setInvForm] = useState({
    itemName: '',
    category: 'SIGNAGE',
    quantitySent: 0,
    quantityConsumed: 0,
    quantityReturned: 0,
    quantityDamaged: 0,
    unitCost: '',
    currency: 'IQD',
    notes: '',
  })

  const createInventory = useCreateInventory()

  const handleCreateBooth = async (e: React.FormEvent) => {
    e.preventDefault()
    await createBooth.mutateAsync({
      exhibitionId,
      data: {
        brandName: form.brandName,
        boothNumber: form.boothNumber || undefined,
        boothSize: form.boothSize || undefined,
        notes: form.notes || undefined,
      } as Record<string, unknown>,
    })
    setForm({ brandName: '', boothNumber: '', boothSize: '', notes: '' })
    setShowForm(false)
  }

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBoothId) return
    await createInventory.mutateAsync({
      exhibitionId,
      boothId: selectedBoothId,
      data: {
        itemName: invForm.itemName,
        category: invForm.category,
        quantitySent: invForm.quantitySent,
        quantityConsumed: invForm.quantityConsumed,
        quantityReturned: invForm.quantityReturned,
        quantityDamaged: invForm.quantityDamaged,
        unitCost: invForm.unitCost ? parseInt(invForm.unitCost, 10) : undefined,
        currency: invForm.currency,
        notes: invForm.notes || undefined,
      } as Record<string, unknown>,
    })
    setInvForm({
      itemName: '',
      category: 'SIGNAGE',
      quantitySent: 0,
      quantityConsumed: 0,
      quantityReturned: 0,
      quantityDamaged: 0,
      unitCost: '',
      currency: 'IQD',
      notes: '',
    })
    setShowInventoryForm(false)
  }

  if (isLoading) return <p className="text-muted-foreground">{tCommon('loading')}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('booths')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + {t('addBooth')}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateBooth}
          className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50"
        >
          <div>
            <label className="block text-xs font-medium">{t('brandName')} *</label>
            <input
              required
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium">{t('boothNumber')}</label>
              <input
                value={form.boothNumber}
                onChange={(e) => setForm({ ...form, boothNumber: e.target.value })}
                className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">{t('boothSize')}</label>
              <input
                value={form.boothSize}
                onChange={(e) => setForm({ ...form, boothSize: e.target.value })}
                className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium">{t('notes')}</label>
            <textarea
              value={form.notes}
              rows={2}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createBooth.isPending}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {tCommon('save')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {tCommon('cancel')}
            </button>
          </div>
        </form>
      )}

      {booths?.map((booth) => (
        <div key={booth.id} className="bg-card rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{booth.brandName}</h3>
              {booth.boothNumber && (
                <p className="text-muted-foreground text-sm">
                  {t('boothNumber')}: {booth.boothNumber}
                </p>
              )}
              {booth.boothSize && (
                <p className="text-muted-foreground text-sm">
                  {t('boothSize')}: {booth.boothSize}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${DESIGN_STATUS_COLORS[booth.designStatus] ?? ''}`}
              >
                {t(`designStatus_${booth.designStatus}`)}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${SETUP_STATUS_COLORS[booth.setupStatus] ?? ''}`}
              >
                {t(`setupStatus_${booth.setupStatus}`)}
              </span>
              <button
                onClick={() => deleteBooth.mutate({ exhibitionId, boothId: booth.id })}
                className="text-xs text-red-600 hover:underline"
              >
                {tCommon('delete')}
              </button>
            </div>
          </div>

          {/* Design status quick set */}
          <div className="mt-2 flex gap-1">
            {['pending', 'designing', 'ready'].map((st) => (
              <button
                key={st}
                onClick={() =>
                  updateBooth.mutate({
                    exhibitionId,
                    boothId: booth.id,
                    data: { designStatus: st } as Record<string, unknown>,
                  })
                }
                className={`rounded px-2 py-0.5 text-xs ${booth.designStatus === st ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {t(`designStatus_${st}`)}
              </button>
            ))}
          </div>
          <div className="mt-1 flex gap-1">
            {['pending', 'in_setup', 'live', 'dismantled'].map((st) => (
              <button
                key={st}
                onClick={() =>
                  updateBooth.mutate({
                    exhibitionId,
                    boothId: booth.id,
                    data: { setupStatus: st } as Record<string, unknown>,
                  })
                }
                className={`rounded px-2 py-0.5 text-xs ${booth.setupStatus === st ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {t(`setupStatus_${st}`)}
              </button>
            ))}
          </div>

          {/* Inventory section */}
          <div className="mt-4 border-t pt-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium">{t('inventory')}</h4>
              <button
                onClick={() => {
                  setSelectedBoothId(booth.id)
                  setShowInventoryForm(true)
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                + {t('addItem')}
              </button>
            </div>

            {showInventoryForm && selectedBoothId === booth.id && (
              <form
                onSubmit={handleCreateInventory}
                className="mb-3 space-y-2 rounded border bg-gray-50 p-3 dark:bg-gray-800/50"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs">{t('itemName')}</label>
                    <input
                      required
                      value={invForm.itemName}
                      onChange={(e) => setInvForm({ ...invForm, itemName: e.target.value })}
                      className="mt-0.5 w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs">{t('category_short')}</label>
                    <select
                      value={invForm.category}
                      onChange={(e) => setInvForm({ ...invForm, category: e.target.value })}
                      className="mt-0.5 w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                    >
                      {[
                        'SIGNAGE',
                        'GIVEAWAY',
                        'DISPLAY',
                        'ELECTRONICS',
                        'FURNITURE',
                        'CONSUMABLE',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {t(`invCategory_${c}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs">{t('sent')}</label>
                    <input
                      type="number"
                      value={invForm.quantitySent}
                      onChange={(e) =>
                        setInvForm({ ...invForm, quantitySent: parseInt(e.target.value) || 0 })
                      }
                      className="mt-0.5 w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs">{t('consumed')}</label>
                    <input
                      type="number"
                      value={invForm.quantityConsumed}
                      onChange={(e) =>
                        setInvForm({ ...invForm, quantityConsumed: parseInt(e.target.value) || 0 })
                      }
                      className="mt-0.5 w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs">{t('returned')}</label>
                    <input
                      type="number"
                      value={invForm.quantityReturned}
                      onChange={(e) =>
                        setInvForm({ ...invForm, quantityReturned: parseInt(e.target.value) || 0 })
                      }
                      className="mt-0.5 w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs">{t('damaged')}</label>
                    <input
                      type="number"
                      value={invForm.quantityDamaged}
                      onChange={(e) =>
                        setInvForm({ ...invForm, quantityDamaged: parseInt(e.target.value) || 0 })
                      }
                      className="mt-0.5 w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs">{t('unitCost')}</label>
                    <input
                      type="number"
                      value={invForm.unitCost}
                      onChange={(e) => setInvForm({ ...invForm, unitCost: e.target.value })}
                      className="mt-0.5 w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs">{t('notes')}</label>
                    <input
                      value={invForm.notes}
                      onChange={(e) => setInvForm({ ...invForm, notes: e.target.value })}
                      className="mt-0.5 w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createInventory.isPending}
                    className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {tCommon('save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInventoryForm(false)}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {tCommon('cancel')}
                  </button>
                </div>
              </form>
            )}

            <InventoryList boothId={booth.id} exhibitionId={exhibitionId} t={t} tCommon={tCommon} />
          </div>
        </div>
      ))}

      {(!booths || booths.length === 0) && !showForm && (
        <p className="text-muted-foreground text-sm">{t('noBooths')}</p>
      )}
    </div>
  )
}

function InventoryList({
  boothId,
  exhibitionId,
  t,
  tCommon,
}: {
  boothId: string
  exhibitionId: string
  t: (key: string) => string
  tCommon: (key: string) => string
}) {
  const { data: inventory } = useInventory(exhibitionId, boothId)
  const deleteInventory = useDeleteInventory()

  if (!inventory || inventory.length === 0)
    return <p className="text-muted-foreground text-xs">{t('noInventory')}</p>

  return (
    <div className="space-y-1">
      {inventory.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded border bg-gray-50 px-3 py-1.5 text-xs dark:bg-gray-800/50"
        >
          <div>
            <span className="font-medium">{item.itemName}</span>
            <span className="text-muted-foreground ml-2">{t(`invCategory_${item.category}`)}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-3">
            <span>
              {t('sent')}: {item.quantitySent}
            </span>
            <span>
              {t('consumed')}: {item.quantityConsumed}
            </span>
            <span>
              {t('returned')}: {item.quantityReturned}
            </span>
            <span>
              {t('damaged')}: {item.quantityDamaged}
            </span>
            {item.totalCost && (
              <span>
                {(Number(item.totalCost) / 1000).toFixed(1)}K {item.currency}
              </span>
            )}
            <button
              onClick={() =>
                deleteInventory.mutate({ exhibitionId, boothId, inventoryId: item.id })
              }
              className="text-red-600 hover:underline"
            >
              {tCommon('delete')}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
