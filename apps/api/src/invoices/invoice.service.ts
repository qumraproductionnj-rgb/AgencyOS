import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { PdfService } from '../quotations/pdf.service'
import type { CreateInvoiceDto, RecordPaymentDto, UpdateInvoiceDto } from './invoice.dto'

type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'OVERDUE'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUNDED'

const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'],
  OVERDUE: ['PARTIALLY_PAID', 'PAID', 'CANCELLED'],
  PARTIALLY_PAID: ['PAID', 'OVERDUE', 'CANCELLED'],
  PAID: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
  ) {}

  private async generateNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `INV-${year}-`

    const last = await this.prisma.tenant.invoice.findFirst({
      where: { companyId, number: { startsWith: prefix } },
      orderBy: { number: 'desc' },
      select: { number: true },
    })

    const nextSeq = last ? Number(last.number.split('-').pop()!) + 1 : 1
    return `${prefix}${String(nextSeq).padStart(4, '0')}`
  }

  private calculateTotals(
    items: { quantity: number; unitPrice: number; currency?: string; total?: number }[],
    currency: string,
    discountPercent?: number,
    discountAmount?: number,
    taxPercent?: number,
  ) {
    const subtotal = items.reduce((sum, item) => {
      const total = item.quantity * item.unitPrice
      return sum + Math.round(total)
    }, 0)

    let discount = discountAmount ?? 0
    if (discountPercent && discountPercent > 0) {
      discount = Math.round(subtotal * (discountPercent / 100))
    }

    const tax = taxPercent ? Math.round((subtotal - discount) * (taxPercent / 100)) : 0

    const total = subtotal - discount + tax

    return {
      subtotal,
      discountPercent: discountPercent ?? null,
      discountAmount: discount,
      taxPercent: taxPercent ?? null,
      taxAmount: tax,
      total,
    }
  }

  async findAll(companyId: string, filters?: { search?: string; status?: string }) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (filters?.status) where['status'] = filters.status
    if (filters?.search) {
      const s = filters.search
      where['OR'] = [
        { number: { contains: s, mode: 'insensitive' } },
        { client: { name: { contains: s, mode: 'insensitive' } } },
      ]
    }

    return this.prisma.tenant.invoice.findMany({
      where: where as never,
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const inv = await this.prisma.tenant.invoice.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        client: {
          select: { id: true, name: true, nameEn: true, address: true, phone: true, email: true },
        },
        quotation: { select: { id: true, number: true } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    })
    if (!inv) throw new NotFoundException('Invoice not found')
    return inv
  }

  async create(companyId: string, userId: string, dto: CreateInvoiceDto) {
    const number = await this.generateNumber(companyId)
    const currency = dto.currency || 'IQD'
    const totals = this.calculateTotals(
      dto.items,
      currency,
      dto.discountPercent,
      dto.discountAmount,
      dto.taxPercent,
    )

    const invoice = await this.prisma.tenant.invoice.create({
      data: {
        companyId,
        clientId: dto.clientId,
        number,
        type: dto.type ?? 'STANDARD',
        status: 'DRAFT',
        items: dto.items as never,
        currency,
        subtotal: totals.subtotal,
        discountPercent: totals.discountPercent,
        discountAmount: totals.discountAmount,
        taxPercent: totals.taxPercent,
        taxAmount: totals.taxAmount,
        total: totals.total,
        balanceDue: totals.total,
        dueDate: new Date(dto.dueDate),
        issuedDate: new Date(),
        ...(dto.projectId ? { projectId: dto.projectId } : {}),
        ...(dto.quotationId ? { quotationId: dto.quotationId } : {}),
        ...(dto.notes ? { notes: dto.notes } : {}),
        createdBy: userId,
      },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
      },
    })

    this.logger.log(`Invoice created: ${invoice.id} (${invoice.number})`)
    return invoice
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateInvoiceDto) {
    const existing = await this.findOne(companyId, id)
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be edited')
    }

    const items = dto.items ?? (existing.items as Record<string, unknown>[])
    const currency = dto.currency ?? existing.currency
    const discountPercent =
      (dto.discountPercent ?? existing.discountPercent)
        ? Number(existing.discountPercent)
        : undefined
    const discountAmount = dto.discountAmount ?? existing.discountAmount ?? undefined
    const taxPercent =
      (dto.taxPercent ?? existing.taxPercent) ? Number(existing.taxPercent) : undefined

    const totals = this.calculateTotals(
      items as never,
      currency,
      discountPercent,
      discountAmount as number | undefined,
      taxPercent,
    )

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.items) updateData['items'] = dto.items
    if (dto.currency) updateData['currency'] = dto.currency
    updateData['subtotal'] = totals.subtotal
    updateData['discountPercent'] = totals.discountPercent
    updateData['discountAmount'] = totals.discountAmount
    updateData['taxPercent'] = totals.taxPercent
    updateData['taxAmount'] = totals.taxAmount
    updateData['total'] = totals.total
    updateData['balanceDue'] = totals.total - Number(existing.paidAmount)
    if (dto.dueDate) updateData['dueDate'] = new Date(dto.dueDate)
    if (dto.notes !== undefined) updateData['notes'] = dto.notes

    const updated = await this.prisma.tenant.invoice.update({
      where: { id },
      data: updateData,
      include: { client: { select: { id: true, name: true } } },
    })

    this.logger.log(`Invoice updated: ${id}`)
    return updated
  }

  async updateStatus(companyId: string, id: string, userId: string, status: string) {
    const inv = await this.findOne(companyId, id)

    const allowed = VALID_TRANSITIONS[inv.status as InvoiceStatus] ?? []
    if (!allowed.includes(status as InvoiceStatus)) {
      throw new BadRequestException(`Cannot transition from ${inv.status} to ${status}`)
    }

    const updateData: Record<string, unknown> = { status, updatedBy: userId }

    const updated = await this.prisma.tenant.invoice.update({
      where: { id },
      data: updateData,
      include: { client: { select: { id: true, name: true } } },
    })

    this.logger.log(`Invoice ${id} → ${status}`)
    return updated
  }

  async send(companyId: string, id: string, userId: string) {
    const inv = await this.findOne(companyId, id)
    if (inv.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be sent')
    }

    await this.pdf.generateInvoicePdf(inv)
    const pdfUrl = `invoices/${id}.pdf`

    const updated = await this.prisma.tenant.invoice.update({
      where: { id },
      data: { status: 'SENT', pdfUrl, updatedBy: userId },
      include: { client: { select: { id: true, name: true } } },
    })

    this.logger.log(`Invoice sent: ${id}`)
    return updated
  }

  async recordPayment(companyId: string, invoiceId: string, userId: string, dto: RecordPaymentDto) {
    const inv = await this.findOne(companyId, invoiceId)
    if (inv.status === 'PAID' || inv.status === 'CANCELLED' || inv.status === 'REFUNDED') {
      throw new BadRequestException(`Cannot record payment on ${inv.status} invoice`)
    }

    const payment = await this.prisma.tenant.payment.create({
      data: {
        companyId,
        invoiceId,
        amount: Math.round(dto.amount),
        currency: dto.currency,
        method: dto.method,
        referenceNo: dto.referenceNo ?? null,
        paidAt: new Date(dto.paidAt),
        notes: dto.notes ?? null,
        createdBy: userId,
      },
    })

    const totalPaid = Number(inv.paidAmount) + Math.round(dto.amount)
    const totalAmount = Number(inv.total)
    let newStatus: string
    if (totalPaid >= totalAmount) {
      newStatus = 'PAID'
    } else if (totalPaid > 0) {
      newStatus = 'PARTIALLY_PAID'
    } else {
      newStatus = inv.status
    }

    const balanceDue = totalAmount - totalPaid

    await this.prisma.tenant.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: totalPaid,
        balanceDue,
        status: newStatus as never,
        updatedBy: userId,
      },
    })

    this.logger.log(`Payment recorded: ${payment.id} on invoice ${invoiceId}`)
    return payment
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.invoice.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Invoice deleted: ${id}`)
  }

  async generatePdf(companyId: string, id: string): Promise<Buffer> {
    const inv = await this.findOne(companyId, id)
    return this.pdf.generateInvoicePdf(inv)
  }
}
