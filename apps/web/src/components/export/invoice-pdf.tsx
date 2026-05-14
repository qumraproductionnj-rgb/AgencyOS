'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'

interface InvoiceItem {
  descriptionAr: string
  descriptionEn: string
  qty: number
  unitPrice: number
  total: number
}

interface InvoiceData {
  number: string
  date: string
  clientNameAr: string
  clientNameEn: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  isAr: boolean
}

// Generates a printable HTML invoice in a new window (Puppeteer-style approach)
function buildInvoiceHtml(data: InvoiceData): string {
  const { isAr } = data
  const dir = isAr ? 'rtl' : 'ltr'
  const rows = data.items
    .map(
      (item) => `
    <tr>
      <td>${isAr ? item.descriptionAr : item.descriptionEn}</td>
      <td>${item.qty}</td>
      <td>${item.unitPrice.toLocaleString()} ${isAr ? 'د.ع' : 'IQD'}</td>
      <td>${item.total.toLocaleString()} ${isAr ? 'د.ع' : 'IQD'}</td>
    </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${isAr ? 'ar' : 'en'}">
<head>
<meta charset="UTF-8" />
<title>${isAr ? 'فاتورة' : 'Invoice'} ${data.number}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${isAr ? "'Noto Sans Arabic', 'Segoe UI', sans-serif" : "'Segoe UI', sans-serif"}; font-size: 13px; color: #1a1a1a; background: #fff; padding: 40px; }
  h1 { font-size: 28px; font-weight: 700; color: #6366f1; margin-bottom: 4px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .meta { text-align: ${isAr ? 'left' : 'right'}; }
  .meta p { color: #666; line-height: 1.8; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f5f5f5; padding: 10px 12px; text-align: ${isAr ? 'right' : 'left'}; font-size: 11px; color: #666; }
  td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
  .totals { text-align: ${isAr ? 'left' : 'right'}; }
  .totals p { line-height: 2; }
  .total-final { font-size: 18px; font-weight: 700; color: #6366f1; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>${isAr ? 'رؤية للإنتاج الفني' : "Ru'ya for Artistic Production"}</h1>
    <p style="color:#666">${isAr ? 'بغداد، العراق' : 'Baghdad, Iraq'}</p>
  </div>
  <div class="meta">
    <p><strong>${isAr ? 'فاتورة رقم' : 'Invoice #'}:</strong> ${data.number}</p>
    <p><strong>${isAr ? 'التاريخ' : 'Date'}:</strong> ${data.date}</p>
    <p><strong>${isAr ? 'العميل' : 'Client'}:</strong> ${isAr ? data.clientNameAr : data.clientNameEn}</p>
  </div>
</div>
<p class="section-title">${isAr ? 'بنود الفاتورة' : 'Line Items'}</p>
<table>
  <thead>
    <tr>
      <th>${isAr ? 'الوصف' : 'Description'}</th>
      <th>${isAr ? 'الكمية' : 'Qty'}</th>
      <th>${isAr ? 'سعر الوحدة' : 'Unit Price'}</th>
      <th>${isAr ? 'الإجمالي' : 'Total'}</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<div class="totals">
  <p>${isAr ? 'المجموع الفرعي' : 'Subtotal'}: ${data.subtotal.toLocaleString()} ${isAr ? 'د.ع' : 'IQD'}</p>
  <p>${isAr ? 'الضريبة (3%)' : 'Tax (3%)'}: ${data.tax.toLocaleString()} ${isAr ? 'د.ع' : 'IQD'}</p>
  <p class="total-final">${isAr ? 'المجموع الكلي' : 'Total'}: ${data.total.toLocaleString()} ${isAr ? 'د.ع' : 'IQD'}</p>
</div>
</body>
</html>`
}

interface InvoicePdfButtonProps {
  invoice: InvoiceData
  isAr?: boolean
}

export function InvoicePdfButton({ invoice, isAr }: InvoicePdfButtonProps) {
  const [loading, setLoading] = useState(false)

  function handlePrint() {
    setLoading(true)
    const html = buildInvoiceHtml({ ...invoice, isAr: isAr ?? false })
    const win = window.open('', '_blank', 'width=800,height=700')
    if (!win) {
      setLoading(false)
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      setLoading(false)
    }, 400)
  }

  return (
    <button
      onClick={handlePrint}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileText className="h-3.5 w-3.5" />
      )}
      {isAr ? 'طباعة PDF' : 'Print PDF'}
    </button>
  )
}
