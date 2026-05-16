'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  fullPageHref?: string
  fullPageLabel?: string
  width?: 'sm' | 'md' | 'lg'
}

const WIDTH_CLASS = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

export function DetailDrawer({
  open,
  onClose,
  title,
  children,
  fullPageHref,
  fullPageLabel = 'Open full page',
  width = 'md',
}: Props) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal
        className={`fixed inset-y-0 end-0 z-50 flex w-full flex-col bg-white shadow-xl ${WIDTH_CLASS[width]} overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          <div className="ms-auto flex items-center gap-2">
            {fullPageHref && (
              <a
                href={fullPageHref}
                className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
              >
                {fullPageLabel} ↗
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  )
}
