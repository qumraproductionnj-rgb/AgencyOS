'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExportRow } from '@/lib/export'

interface ExportButtonProps {
  getData: () => ExportRow[]
  filename: string
  sheetName?: string
  isAr?: boolean
  className?: string
}

export function ExportButton({
  getData,
  filename,
  sheetName = 'Sheet1',
  isAr,
  className,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleExport(type: 'csv' | 'excel') {
    setLoading(true)
    setOpen(false)
    try {
      const rows = getData()
      if (type === 'csv') {
        const { exportToCSV } = await import('@/lib/export')
        exportToCSV(rows, filename)
      } else {
        const { exportToExcel } = await import('@/lib/export')
        await exportToExcel(rows, sheetName, filename)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
      >
        <Download className="h-3.5 w-3.5" />
        {loading ? (isAr ? 'جارٍ التصدير...' : 'Exporting...') : isAr ? 'تصدير' : 'Export'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111] shadow-2xl">
            <button
              onClick={() => handleExport('csv')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              {isAr ? 'تصدير CSV' : 'Export CSV'}
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-sky-400" />
              {isAr ? 'تصدير Excel' : 'Export Excel'}
            </button>
            <button
              onClick={() => {
                window.print()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Printer className="h-3.5 w-3.5 text-purple-400" />
              {isAr ? 'طباعة' : 'Print'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
