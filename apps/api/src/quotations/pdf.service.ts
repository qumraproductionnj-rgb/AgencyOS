import { Injectable, Logger } from '@nestjs/common'
import puppeteer from 'puppeteer'

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name)

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
