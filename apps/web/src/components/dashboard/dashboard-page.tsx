'use client'

import { useState, useCallback, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { LayoutGrid, Settings2, RotateCcw, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTour } from '@/hooks/use-tour'
import { WidgetRenderer } from './widgets/widget-renderer'
import {
  WIDGET_CATALOG,
  PRESET_MANAGER,
  PRESET_DESIGNER,
  PRESET_ACCOUNTANT,
  type WidgetId,
  type LayoutItem,
} from './widgets/types'

const STORAGE_KEY = 'agencyos:dashboard:layout'

function loadLayout(): LayoutItem[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LayoutItem[]) : null
  } catch {
    return null
  }
}

function saveLayout(layout: LayoutItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  } catch {
    // ignore quota errors
  }
}

export function DashboardPage() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [editMode, setEditMode] = useState(false)
  const [layout, setLayout] = useState<LayoutItem[]>(() => loadLayout() ?? PRESET_MANAGER)
  const [showAddPanel, setShowAddPanel] = useState(false)

  useEffect(() => {
    saveLayout(layout)
  }, [layout])

  const activeIds = layout.map((l) => l.i as WidgetId)

  const removeWidget = useCallback((id: WidgetId) => {
    setLayout((prev) => prev.filter((l) => l.i !== id))
  }, [])

  const addWidget = useCallback(
    (id: WidgetId) => {
      const def = WIDGET_CATALOG.find((w) => w.id === id)
      if (!def) return
      const maxY = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0)
      setLayout((prev) => [...prev, { i: id, x: 0, y: maxY, w: def.defaultW, h: def.defaultH }])
      setShowAddPanel(false)
    },
    [layout],
  )

  const applyPreset = useCallback((preset: LayoutItem[]) => {
    setLayout(preset)
    setEditMode(false)
  }, [])

  const availableToAdd = WIDGET_CATALOG.filter((w) => !activeIds.includes(w.id))

  const { startTour: _startTour } = useTour('dashboard', [
    {
      elementId: 'dashboard-header',
      titleAr: 'لوحة التحكم',
      titleEn: 'Dashboard',
      descAr: 'مرحبًا! هذه لوحة تحكمك الشخصية — يمكنك تخصيصها حسب احتياجاتك.',
      descEn: 'Welcome! This is your personal dashboard — customize it to fit your needs.',
      side: 'bottom',
    },
    {
      elementId: 'dashboard-customize',
      titleAr: 'تخصيص اللوحة',
      titleEn: 'Customize',
      descAr: 'انقر هنا لإضافة أو حذف الأدوات وتغيير القالب.',
      descEn: 'Click here to add/remove widgets and switch presets.',
      side: 'bottom',
    },
    {
      elementId: 'dashboard-widgets',
      titleAr: 'الأدوات',
      titleEn: 'Widgets',
      descAr: 'كل بطاقة هنا هي أداة — اسحبها أو احذفها في وضع التحرير.',
      descEn: 'Each card is a widget — remove them in edit mode.',
      side: 'top',
    },
  ])

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div id="dashboard-header" className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-sky-400" />
          <h1 className="text-lg font-bold">{isAr ? 'لوحة التحكم' : 'Dashboard'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {editMode && (
            <>
              <div className="flex gap-1 rounded-lg border border-white/[0.06] p-1">
                {[
                  { label: isAr ? 'مدير' : 'Manager', preset: PRESET_MANAGER },
                  { label: isAr ? 'مصمم' : 'Designer', preset: PRESET_DESIGNER },
                  { label: isAr ? 'محاسب' : 'Accountant', preset: PRESET_ACCOUNTANT },
                ].map(({ label, preset }) => (
                  <button
                    key={label}
                    onClick={() => applyPreset(preset)}
                    className="rounded-md px-2.5 py-1 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setLayout(PRESET_MANAGER)
                  saveLayout(PRESET_MANAGER)
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                {isAr ? 'إعادة تعيين' : 'Reset'}
              </button>
              <button
                onClick={() => setShowAddPanel(true)}
                className="flex items-center gap-1.5 rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/30"
              >
                <Plus className="h-3 w-3" />
                {isAr ? 'إضافة' : 'Add'}
              </button>
            </>
          )}
          <button
            id="dashboard-customize"
            onClick={() => setEditMode((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              editMode
                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                : 'border border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white',
            )}
          >
            <Settings2 className="h-3.5 w-3.5" />
            {isAr ? (editMode ? 'حفظ' : 'تخصيص') : editMode ? 'Save' : 'Customize'}
          </button>
        </div>
      </div>

      {editMode && (
        <div className="rounded-xl border border-purple-400/20 bg-purple-400/[0.05] px-4 py-2.5 text-sm text-purple-300">
          {isAr
            ? '✏️ وضع التحرير — اختر قالبًا أو أضف/احذف الأدوات'
            : '✏️ Edit mode — choose a preset or add/remove widgets'}
        </div>
      )}

      {/* Widget Grid */}
      <div id="dashboard-widgets" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {layout.map((item) => {
          const def = WIDGET_CATALOG.find((w) => w.id === item.i)
          if (!def) return null

          const colSpanMap: Record<number, string> = {
            1: 'xl:col-span-1',
            2: 'xl:col-span-2',
            3: 'xl:col-span-3',
            4: 'xl:col-span-4',
          }
          const minHMap: Record<number, string> = {
            2: 'min-h-[120px]',
            3: 'min-h-[200px]',
            4: 'min-h-[280px]',
            5: 'min-h-[340px]',
          }

          const colSpan = colSpanMap[Math.min(item.w, 4)] ?? 'xl:col-span-1'
          const minH = minHMap[item.h] ?? 'min-h-[120px]'

          return (
            <div
              key={item.i}
              className={cn(colSpan, minH, editMode && 'rounded-xl ring-1 ring-purple-400/20')}
            >
              <WidgetRenderer
                id={item.i as WidgetId}
                isAr={isAr}
                editMode={editMode}
                onRemove={removeWidget}
              />
            </div>
          )
        })}
      </div>

      {/* Add widget panel */}
      {showAddPanel && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={() => setShowAddPanel(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{isAr ? 'إضافة أداة' : 'Add Widget'}</h3>
              <button
                onClick={() => setShowAddPanel(false)}
                className="rounded-lg p-1.5 text-white/30 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {availableToAdd.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                {isAr ? 'جميع الأدوات مضافة' : 'All widgets added'}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableToAdd.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => addWidget(w.id)}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-start text-sm transition-colors hover:border-sky-400/30 hover:bg-sky-400/[0.04]"
                  >
                    <span className="font-medium">{isAr ? w.titleAr : w.titleEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
