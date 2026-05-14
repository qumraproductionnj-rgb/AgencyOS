/**
 * Client-side export utilities for Excel and CSV.
 * PDF export uses @react-pdf/renderer via dedicated component.
 */

export type ExportRow = Record<string, string | number | boolean | null | undefined>

export function exportToCSV(rows: ExportRow[], filename: string): void {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0]!)
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const v = row[h]
          if (v == null) return ''
          const str = String(v)
          // Quote cells containing commas, quotes, or newlines
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

export async function exportToExcel(
  rows: ExportRow[],
  sheetName: string,
  filename: string,
): Promise<void> {
  const { utils, writeFile } = await import('xlsx')
  const ws = utils.json_to_sheet(rows)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, sheetName)
  writeFile(wb, `${filename}.xlsx`)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
