'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Framework, FrameworkField } from '@/hooks/use-frameworks'

interface Props {
  framework: Framework
  onApply: (fieldValues: Record<string, string>) => void
  isApplying?: boolean
  showAiGenerate?: boolean
  onAiGenerate?: (fieldValues: Record<string, string>) => Promise<void>
}
export function FrameworkInteractiveForm({
  framework,
  onApply,
  isApplying,
  showAiGenerate: _showAiGenerate,
  onAiGenerate,
}: Props) {
  const t = useTranslations('frameworks')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [aiBusy, setAiBusy] = useState(false)

  const fields = (framework.fieldsSchema ?? []) as FrameworkField[]
  if (fields.length === 0) return null

  const setValue = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    const filled: Record<string, string> = {}
    for (const field of fields) {
      filled[field.key] = fieldValues[field.key] ?? ''
    }
    onApply(filled)
  }

  const handleAiGenerate = async () => {
    if (!onAiGenerate) return
    setAiBusy(true)
    try {
      const filled: Record<string, string> = {}
      for (const field of fields) {
        filled[field.key] = fieldValues[field.key] ?? ''
      }
      await onAiGenerate(filled)
    } finally {
      setAiBusy(false)
    }
  }

  const allFilled = fields.every(
    (f) => !f.required || (fieldValues[f.key] && fieldValues[f.key]!.trim().length > 0),
  )

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-gray-800">
          {framework.nameEn ?? framework.code}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{framework.description}</p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <FrameworkFieldInput
            key={field.key}
            field={field}
            value={fieldValues[field.key] ?? ''}
            onChange={(v) => setValue(field.key, v)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {onAiGenerate && (
          <button
            onClick={handleAiGenerate}
            disabled={aiBusy}
            className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            {aiBusy ? t('generating') : t('aiGenerateFromFramework')}
          </button>
        )}
        <button
          onClick={handleApply}
          disabled={isApplying || !allFilled}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isApplying ? t('applying') : t('apply')}
        </button>
      </div>
    </div>
  )
}

function FrameworkFieldInput({
  field,
  value,
  onChange,
}: {
  field: FrameworkField
  value: string
  onChange: (v: string) => void
}) {
  const label = field.label || field.key
  const placeholder = field.placeholder ?? ''

  switch (field.type) {
    case 'textarea':
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {field.description && <p className="mb-1 text-xs text-gray-400">{field.description}</p>}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={field.maxLength}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            dir="auto"
          />
        </div>
      )

    case 'select':
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{placeholder || 'Select...'}</option>
            {(field.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )

    case 'number':
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      )

    case 'color':
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-gray-300"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#hex"
              maxLength={7}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>
      )

    case 'rating':
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={field.max ?? 10}
              value={parseInt(value, 10) || 5}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1"
            />
            <span className="w-8 text-center text-sm font-medium text-gray-600">
              {value || '—'}
            </span>
          </div>
        </div>
      )

    default:
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {field.description && <p className="mb-1 text-xs text-gray-400">{field.description}</p>}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={field.maxLength}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            dir="auto"
          />
        </div>
      )
  }
}
