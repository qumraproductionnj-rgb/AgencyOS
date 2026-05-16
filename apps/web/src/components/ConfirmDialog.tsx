'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  /** If set, user must type this exact word to enable the confirm button */
  requireTyping?: string
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  requireTyping,
  loading = false,
}: Props) {
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setTyped('')
      return
    }
    if (requireTyping) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open, requireTyping])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const canConfirm = !requireTyping || typed === requireTyping
  const btnColor =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : variant === 'warning'
        ? 'bg-orange-500 hover:bg-orange-600'
        : 'bg-blue-600 hover:bg-blue-700'

  const handleConfirm = async () => {
    if (!canConfirm || busy) return
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 rounded-full p-2 ${variant === 'danger' ? 'bg-red-50' : variant === 'warning' ? 'bg-orange-50' : 'bg-blue-50'}`}
          >
            <AlertTriangle
              size={18}
              className={
                variant === 'danger'
                  ? 'text-red-500'
                  : variant === 'warning'
                    ? 'text-orange-500'
                    : 'text-blue-500'
              }
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X size={14} />
          </button>
        </div>

        {requireTyping && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs text-gray-500">
              Type <span className="font-mono font-semibold text-red-600">{requireTyping}</span> to
              confirm
            </p>
            <input
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) void handleConfirm()
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
              placeholder={requireTyping}
              autoComplete="off"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!canConfirm || busy || loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40 ${btnColor}`}
          >
            {busy || loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}
