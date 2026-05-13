'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useFrameworks, useApplyFramework } from '@/hooks/use-frameworks'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { FrameworkInteractiveForm } from './framework-interactive-form'

interface Props {
  pieceId: string
  contentType: string
  currentFramework?: string | null
  open: boolean
  onClose: () => void
  onApplied: () => void
}

const CATEGORIES = [
  'copywriting',
  'storytelling',
  'video',
  'sales',
  'design',
  'educational',
] as const

export function FrameworkApplyModal({
  pieceId,
  contentType,
  currentFramework,
  open,
  onClose,
  onApplied,
}: Props) {
  const t = useTranslations('frameworks')
  const tCommon = useTranslations('common')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data: frameworks, isLoading } = useFrameworks({
    category: categoryFilter || undefined,
  })

  const applyFramework = useApplyFramework()
  const [applying, setApplying] = useState(false)

  const handleApply = useCallback(
    async (fieldValues: Record<string, string>) => {
      if (!selectedCode) return
      setApplying(true)
      try {
        await applyFramework.mutateAsync({
          pieceId,
          data: { frameworkCode: selectedCode, fieldValues },
        })
        onApplied()
        onClose()
      } finally {
        setApplying(false)
      }
    },
    [selectedCode, pieceId, applyFramework, onApplied, onClose],
  )

  const handleAiGenerate = useCallback(
    async (fieldValues: Record<string, string>) => {
      if (!selectedCode) return
      const framework = frameworks?.find((f) => f.code === selectedCode)
      if (!framework) return

      const fields = Object.entries(fieldValues)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')

      try {
        const result = await api.post<{ output: string }>('/ai/generate', {
          toolType: 'framework_content',
          prompt: `Using the ${framework.nameEn ?? framework.code} framework, generate full content for this ${contentType} piece based on these framework fields:\n\n${fields}\n\nGenerate: hook, body text, CTA, caption, and hashtags. Return as JSON.`,
          systemPrompt: `You are a professional content creator using the ${framework.nameEn ?? framework.code} framework. Generate compelling content based on the provided framework fields. Return JSON with keys: hook, body, cta, caption, hashtags.`,
        })

        if (result.output) {
          try {
            const parsed = JSON.parse(result.output)
            await api.put(`/content-pieces/${pieceId}`, {
              frameworkUsed: selectedCode,
              frameworkData: fieldValues,
              components: parsed,
            })
          } catch {
            await api.put(`/content-pieces/${pieceId}`, {
              frameworkUsed: selectedCode,
              frameworkData: fieldValues,
            })
          }
        }
        onApplied()
        onClose()
      } catch {
        // fallback — just apply framework without AI content
        await api.put(`/content-pieces/${pieceId}`, {
          frameworkUsed: selectedCode,
          frameworkData: fieldValues,
        })
        onApplied()
        onClose()
      }
    },
    [selectedCode, frameworks, contentType, pieceId, onApplied, onClose],
  )

  if (!open) return null

  const selectedFramework = frameworks?.find((f) => f.code === selectedCode)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-10">
      <div className="mx-4 mb-10 w-full max-w-4xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('pickFramework')}</h2>
            {selectedFramework && (
              <p className="mt-0.5 text-sm text-blue-600">
                {selectedFramework.nameEn ?? selectedFramework.code}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-5">
          {/* Sidebar */}
          <div className="border-r p-4 md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mb-3 w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
            >
              <option value="">{t('selectCategory')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`category_${cat}`)}
                </option>
              ))}
            </select>

            <div className="space-y-1">
              {isLoading && (
                <p className="px-2 py-4 text-center text-sm text-gray-400">{tCommon('loading')}</p>
              )}
              {!isLoading &&
                frameworks?.map((fw) => (
                  <button
                    key={fw.code}
                    onClick={() => setSelectedCode(fw.code)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      selectedCode === fw.code
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50',
                      currentFramework === fw.code && 'border-l-2 border-green-400',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{fw.nameEn ?? fw.code}</span>
                      {currentFramework === fw.code && (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{fw.nameAr ?? ''}</div>
                  </button>
                ))}
            </div>
          </div>

          {/* Form Area */}
          <div className="overflow-y-auto p-6 md:col-span-3">
            {!selectedCode && (
              <p className="py-12 text-center text-sm text-gray-400">{t('pickFramework')}</p>
            )}

            {selectedCode && !selectedFramework && (
              <p className="py-12 text-center text-sm text-gray-400">{tCommon('loading')}</p>
            )}

            {selectedFramework && (
              <FrameworkInteractiveForm
                key={selectedFramework.code}
                framework={selectedFramework}
                onApply={handleApply}
                isApplying={applying}
                showAiGenerate
                onAiGenerate={handleAiGenerate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
