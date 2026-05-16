'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface BaseProps {
  value: string | number
  onSave: (val: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

interface TextProps extends BaseProps {
  type: 'text' | 'number' | 'date'
}

interface SelectProps extends BaseProps {
  type: 'select'
  options: SelectOption[]
}

type InlineEditProps = TextProps | SelectProps

export function InlineEdit({
  value,
  onSave,
  className = '',
  disabled = false,
  placeholder,
  ...rest
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value ?? ''))
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement & HTMLSelectElement>(null)

  useEffect(() => {
    setDraft(String(value ?? ''))
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = async () => {
    if (draft === String(value ?? '')) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(draft)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  const cancel = () => {
    setDraft(String(value ?? ''))
    setEditing(false)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void commit()
    }
    if (e.key === 'Escape') cancel()
  }

  if (!editing) {
    return (
      <span
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setEditing(true)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === 'F2')) setEditing(true)
        }}
        title={disabled ? undefined : 'Click to edit'}
        className={`inline-block cursor-pointer rounded px-1 hover:bg-blue-50 hover:outline hover:outline-1 hover:outline-blue-300 focus:outline focus:outline-1 focus:outline-blue-400 ${disabled ? 'cursor-default opacity-60' : ''} ${className}`}
      >
        {value !== '' && value !== null && value !== undefined ? (
          (rest as { type: string; options?: SelectOption[] }).type === 'select' ? (
            ((rest as SelectProps).options.find((o) => o.value === String(value))?.label ??
            String(value))
          ) : (
            String(value)
          )
        ) : (
          <span className="italic text-gray-400">{placeholder ?? '—'}</span>
        )}
        {saving && <span className="ml-1 text-xs text-gray-400">…</span>}
      </span>
    )
  }

  const sharedClass = `border border-blue-400 rounded px-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`

  if ((rest as { type: string }).type === 'select') {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={onKey}
        className={sharedClass}
      >
        {(rest as SelectProps).options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type={(rest as TextProps).type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => void commit()}
      onKeyDown={onKey}
      placeholder={placeholder}
      className={sharedClass}
    />
  )
}
