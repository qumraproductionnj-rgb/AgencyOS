import { Injectable, Logger } from '@nestjs/common'
import puppeteer from 'puppeteer'

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name)

  async generateInvoicePdf(invoice: {
    number: string
    currency: string
    subtotal: number | bigint
    discountPercent: unknown
    discountAmount: number | bigint | null
    taxPercent: unknown
    taxAmount: number | bigint | null
    total: number | bigint
    paidAmount: number | bigint
    balanceDue: number | bigint
    status: string
    notes: string | null
    dueDate: Date
    client: { name: string; nameEn?: string | null; address?: string | null }
    items: unknown
    createdAt: Date
  }): Promise<Buffer> {
    const items =
      (invoice.items as {
        description: string
        quantity: number
        unitPrice: number
        currency?: string
      }[]) ?? []

    const n = (v: number | bigint | null | undefined) => (v ? Number(v).toLocaleString() : '0')

    const statusBadge =
      invoice.status === 'PAID'
        ? 'background:#16a34a;color:#fff;'
        : invoice.status === 'OVERDUE'
          ? 'background:#dc2626;color:#fff;'
          : 'background:#6b7280;color:#fff;'

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 20mm; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 12px; color: #333; margin: 0; padding: 0; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 20px; margin: 0; color: #1e3a5f; }
    .header p { font-size: 11px; color: #666; margin: 4px 0; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: bold; ${statusBadge} }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .meta div { width: 48%; }
    .meta h3 { font-size: 11px; color: #1e3a5f; margin: 0 0 4px; text-transform: uppercase; }
    .meta p { margin: 2px 0; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #1e3a5f; color: #fff; padding: 8px; font-size: 11px; text-align: right; }
    td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; text-align: right; }
    .totals { width: 300px; margin-right: auto; }
    .totals td { border: none; padding: 4px 8px; }
    .totals .final td { font-weight: bold; font-size: 14px; border-top: 2px solid #333; padding-top: 8px; }
    .notes { margin-top: 20px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px; }
    .footer { text-align: center; font-size: 10px; color: #999; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>فاتورة</h1>
    <p>${invoice.number} <span class="status-badge">${invoice.status}</span></p>
  </div>

  <div class="meta">
    <div>
      <h3>العميل</h3>
      <p>${invoice.client.name}</p>
      ${invoice.client.nameEn ? `<p>${invoice.client.nameEn}</p>` : ''}
      ${invoice.client.address ? `<p>${invoice.client.address}</p>` : ''}
    </div>
    <div style="text-align: left;">
      <h3>التاريخ</h3>
      <p>${new Date(invoice.createdAt).toLocaleDateString('ar-IQ')}</p>
      <p style="margin-top:12px;"><strong>تاريخ الاستحقاق:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-IQ')}</p>
    </div>
  </div>

  <table>
    <thead><tr><th>#</th><th>البيان</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
    <tbody>
      ${items
        .map(
          (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${n(item.unitPrice)}</td>
          <td>${n(item.quantity * item.unitPrice)}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>المجموع الفرعي</td><td>${n(invoice.subtotal)} ${invoice.currency}</td></tr>
    ${invoice.discountPercent ? `<tr><td>الخصم (${Number(invoice.discountPercent)}%)</td><td>-${n(invoice.discountAmount)}</td></tr>` : ''}
    ${invoice.taxPercent ? `<tr><td>الضريبة (${Number(invoice.taxPercent)}%)</td><td>+${n(invoice.taxAmount)}</td></tr>` : ''}
    <tr class="final"><td>الإجمالي النهائي</td><td>${n(invoice.total)} ${invoice.currency}</td></tr>
    <tr><td>المدفوع</td><td>-${n(invoice.paidAmount)} ${invoice.currency}</td></tr>
    <tr style="font-weight:bold;color:${Number(invoice.balanceDue) > 0 ? '#dc2626' : '#16a34a'}"><td>المبلغ المتبقي</td><td>${n(invoice.balanceDue)} ${invoice.currency}</td></tr>
  </table>

  ${invoice.notes ? `<div class="notes"><strong>ملاحظات:</strong><br>${invoice.notes}</div>` : ''}

  <div class="footer">
    <p>تم الإنشاء بواسطة AgencyOS — نظام إدارة الوكالات الإبداعية</p>
  </div>
</body>
</html>`

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      })
      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }

  async generateQuotationPdf(quotation: {
    number: string
    currency: string
    subtotal: number | bigint
    discountPercent: unknown
    discountAmount: number | bigint | null
    taxPercent: unknown
    taxAmount: number | bigint | null
    total: number | bigint
    notes: string | null
    validUntil: Date | null
    client: { name: string; nameEn?: string | null; address?: string | null }
    items: unknown
    createdAt: Date
  }): Promise<Buffer> {
    const items =
      (quotation.items as {
        description: string
        quantity: number
        unitPrice: number
        currency?: string
      }[]) ?? []

    const n = (v: number | bigint | null | undefined) => (v ? Number(v).toLocaleString() : '0')

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 20mm; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 12px; color: #333; margin: 0; padding: 0; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 20px; margin: 0; color: #1e3a5f; }
    .header p { font-size: 11px; color: #666; margin: 4px 0; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .meta div { width: 48%; }
    .meta h3 { font-size: 11px; color: #1e3a5f; margin: 0 0 4px; text-transform: uppercase; }
    .meta p { margin: 2px 0; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #1e3a5f; color: #fff; padding: 8px; font-size: 11px; text-align: right; }
    td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; text-align: right; }
    .totals { width: 300px; margin-right: auto; }
    .totals td { border: none; padding: 4px 8px; }
    .totals .final td { font-weight: bold; font-size: 14px; border-top: 2px solid #333; padding-top: 8px; }
    .notes { margin-top: 20px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px; }
    .footer { text-align: center; font-size: 10px; color: #999; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 8px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 10px; }
    .badge-draft { background: #f0f0f0; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>عرض سعر</h1>
    <p>${quotation.number}</p>
  </div>

  <div class="meta">
    <div>
      <h3>العميل</h3>
      <p>${quotation.client.name}</p>
      ${quotation.client.nameEn ? `<p>${quotation.client.nameEn}</p>` : ''}
      ${quotation.client.address ? `<p>${quotation.client.address}</p>` : ''}
    </div>
    <div style="text-align: left;">
      <h3>التاريخ</h3>
      <p>${new Date(quotation.createdAt).toLocaleDateString('ar-IQ')}</p>
      ${quotation.validUntil ? `<p style="margin-top:12px;"><strong>صال حتى:</strong> ${new Date(quotation.validUntil).toLocaleDateString('ar-IQ')}</p>` : ''}
    </div>
  </div>

  <table>
    <thead><tr><th>#</th><th>البيان</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
    <tbody>
      ${items
        .map(
          (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${n(item.unitPrice)}</td>
          <td>${n(item.quantity * item.unitPrice)}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>المجموع الفرعي</td><td>${n(quotation.subtotal)} ${quotation.currency}</td></tr>
    ${quotation.discountPercent ? `<tr><td>الخصم (${Number(quotation.discountPercent)}%)</td><td>-${n(quotation.discountAmount)}</td></tr>` : ''}
    ${quotation.taxPercent ? `<tr><td>الضريبة (${Number(quotation.taxPercent)}%)</td><td>+${n(quotation.taxAmount)}</td></tr>` : ''}
    <tr class="final"><td>الإجمالي النهائي</td><td>${n(quotation.total)} ${quotation.currency}</td></tr>
  </table>

  ${quotation.notes ? `<div class="notes"><strong>ملاحظات:</strong><br>${quotation.notes}</div>` : ''}

  <div class="footer">
    <p>تم الإنشاء بواسطة AgencyOS — نظام إدارة الوكالات الإبداعية</p>
  </div>
</body>
</html>`

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      })
      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }
}
