'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFrameworks, useFrameworkRecommendations, type Framework } from '@/hooks/use-frameworks'
import { cn } from '@/lib/utils'
import { FrameworkInteractiveForm } from './framework-interactive-form'

const CATEGORIES = [
  'copywriting',
  'storytelling',
  'video',
  'sales',
  'design',
  'educational',
  'strategy',
  'ideation',
] as const

const CONTENT_TYPES = [
  'VIDEO_LONG',
  'REEL',
  'STORY',
  'STATIC_DESIGN',
  'CAROUSEL',
  'GIF',
  'PODCAST',
  'BLOG_POST',
  'EMAIL',
  'LANDING_PAGE',
  'AD_COPY',
  'PRESENTATION',
] as const

const CATEGORY_ICONS: Record<string, string> = {
  copywriting: '✍️',
  storytelling: '📖',
  video: '🎬',
  sales: '💼',
  design: '🎨',
  educational: '📚',
  strategy: '🧠',
  ideation: '💡',
}

export function FrameworksCatalog() {
  const t = useTranslations('frameworks')
  const tCommon = useTranslations('common')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedContentType, setSelectedContentType] = useState<string>('')
  const [search, setSearch] = useState('')
  const [activeFramework, setActiveFramework] = useState<Framework | null>(null)

  const { data: frameworks, isLoading } = useFrameworks({
    category: selectedCategory || undefined,
    contentType: selectedContentType || undefined,
    search: search || undefined,
  })

  const { data: recommendations } = useFrameworkRecommendations(
    selectedContentType || undefined,
    undefined,
  )

  const handleApply = (_fieldValues: Record<string, string>) => {
    setActiveFramework(null)
  }

  const contentTypesForFramework = (fw: Framework) => {
    return (fw.bestForContentTypes ?? []).slice(0, 4)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('description')}</p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setActiveFramework(null)
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('selectCategory')}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`category_${cat}`)}
            </option>
          ))}
        </select>

        <select
          value={selectedContentType}
          onChange={(e) => {
            setSelectedContentType(e.target.value)
            setActiveFramework(null)
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('selectContentType')}</option>
          {CONTENT_TYPES.map((ct) => (
            <option key={ct} value={ct}>
              {ct.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setActiveFramework(null)
          }}
          placeholder={t('searchPlaceholder')}
          className="min-w-[200px] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {isLoading && <p className="text-sm text-gray-400">{tCommon('loading')}</p>}

      {/* Recommendations Banner */}
      {selectedContentType &&
        recommendations &&
        recommendations.length > 0 &&
        !selectedCategory &&
        !search && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-blue-800">
              {t('recommendFor', { type: selectedContentType.replace(/_/g, ' ') })}
            </h3>
            <div className="flex flex-wrap gap-2">
              {recommendations.map((fw) => (
                <button
                  key={fw.code}
                  onClick={() => setActiveFramework(activeFramework?.code === fw.code ? null : fw)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    activeFramework?.code === fw.code
                      ? 'border-blue-300 bg-blue-100 text-blue-700'
                      : 'border-blue-200 bg-white text-blue-600 hover:bg-blue-100',
                  )}
                >
                  {fw.nameEn ?? fw.code}
                </button>
              ))}
            </div>
          </div>
        )}

      {!isLoading && frameworks && frameworks.length === 0 && (
        <p className="text-sm text-gray-400">{t('noFrameworks')}</p>
      )}

      {!isLoading && frameworks && frameworks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Framework Cards */}
          <div className={cn('space-y-3', activeFramework ? 'lg:col-span-1' : 'lg:col-span-3')}>
            {frameworks.map((fw) => (
              <button
                key={fw.code}
                onClick={() => setActiveFramework(activeFramework?.code === fw.code ? null : fw)}
                className={cn(
                  'w-full rounded-lg border p-4 text-left transition-all',
                  activeFramework?.code === fw.code
                    ? 'border-blue-400 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORY_ICONS[fw.category ?? ''] ?? '📋'}</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {fw.nameEn ?? fw.code}
                      </div>
                      <div className="text-xs text-gray-500">{fw.nameAr ?? fw.code}</div>
                    </div>
                  </div>
                  {fw.category && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {t(`category_${fw.category}`)}
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-gray-500">{fw.description}</p>
                {contentTypesForFramework(fw).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {contentTypesForFramework(fw).map((ct) => (
                      <span
                        key={ct}
                        className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500"
                      >
                        {ct}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Active Framework Detail */}
          {activeFramework && (
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-blue-200 bg-white p-6 shadow-sm">
                <FrameworkInteractiveForm
                  key={activeFramework.code}
                  framework={activeFramework}
                  onApply={handleApply}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
