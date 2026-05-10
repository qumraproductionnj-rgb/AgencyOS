import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { PdfService } from './pdf.service'
import type { CreateQuotationDto, UpdateQuotationDto } from './quotation.dto'

@Injectable()
export class QuotationService {
  private readonly logger = new Logger(QuotationService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
  ) {}

  private async generateNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `QUO-${year}-`

    const last = await this.prisma.tenant.quotation.findFirst({
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

    return this.prisma.tenant.quotation.findMany({
      where: where as never,
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const q = await this.prisma.tenant.quotation.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        client: {
          select: { id: true, name: true, nameEn: true, address: true, phone: true, email: true },
        },
        deal: { select: { id: true, name: true } },
      },
    })
    if (!q) throw new NotFoundException('Quotation not found')
    return q
  }

  async create(companyId: string, userId: string, dto: CreateQuotationDto) {
    const number = await this.generateNumber(companyId)
    const currency = dto.currency || 'IQD'
    const totals = this.calculateTotals(
      dto.items,
      currency,
      dto.discountPercent,
      dto.discountAmount,
      dto.taxPercent,
    )

    const quotation = await this.prisma.tenant.quotation.create({
      data: {
        companyId,
        clientId: dto.clientId,
        number,
        items: dto.items as never,
        currency,
        subtotal: totals.subtotal,
        discountPercent: totals.discountPercent,
        discountAmount: totals.discountAmount,
        taxPercent: totals.taxPercent,
        taxAmount: totals.taxAmount,
        total: totals.total,
        ...(dto.dealId ? { dealId: dto.dealId } : {}),
        ...(dto.validUntil ? { validUntil: new Date(dto.validUntil) } : {}),
        ...(dto.notes ? { notes: dto.notes } : {}),
        createdBy: userId,
      },
      include: {
        client: { select: { id: true, name: true, nameEn: true, address: true } },
      },
    })

    this.logger.log(`Quotation created: ${quotation.id} (${quotation.number})`)
    return quotation
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateQuotationDto) {
    const existing = await this.findOne(companyId, id)
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft quotations can be edited')
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
    if (dto.validUntil) updateData['validUntil'] = new Date(dto.validUntil)
    if (dto.notes !== undefined) updateData['notes'] = dto.notes

    const updated = await this.prisma.tenant.quotation.update({
      where: { id },
      data: updateData,
      include: { client: { select: { id: true, name: true } } },
    })

    this.logger.log(`Quotation updated: ${id}`)
    return updated
  }

  async updateStatus(
    companyId: string,
    id: string,
    userId: string,
    status: string,
    rejectionReason?: string,
  ) {
    const q = await this.findOne(companyId, id)

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SENT', 'EXPIRED'],
      SENT: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
    }

    const allowed = validTransitions[q.status] ?? []
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${q.status} to ${status}`)
    }

    const updateData: Record<string, unknown> = { status, updatedBy: userId }
    if (status === 'SENT') {
      updateData['sentAt'] = new Date()
    }
    if (status === 'ACCEPTED') {
      updateData['acceptedAt'] = new Date()
    }
    if (status === 'REJECTED') {
      updateData['rejectedAt'] = new Date()
      updateData['rejectionReason'] = rejectionReason ?? null
    }

    const updated = await this.prisma.tenant.quotation.update({
      where: { id },
      data: updateData,
      include: { client: { select: { id: true, name: true } } },
    })

    this.logger.log(`Quotation ${id} → ${status}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.quotation.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Quotation deleted: ${id}`)
  }

  // Public token-based accept/reject

  async findByToken(token: string) {
    const q = await this.prisma.tenant.quotation.findFirst({
      where: { id: token, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
      },
    })
    if (!q) throw new NotFoundException('Quotation not found')
    if (q.status !== 'SENT') {
      throw new BadRequestException(
        q.status === 'ACCEPTED' ? 'Quotation already accepted' : 'Quotation is not available',
      )
    }
    return q
  }

  async acceptByToken(token: string) {
    const q = await this.findByToken(token)
    if (q.status !== 'SENT') {
      throw new BadRequestException(
        q.status === 'ACCEPTED' ? 'Quotation already accepted' : 'Quotation is not available',
      )
    }

    const updated = await this.prisma.tenant.quotation.update({
      where: { id: token },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    })

    const projectName = `Project - ${q.number}`
    const now = new Date()
    const sixtyDays = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    await this.prisma.tenant.project.create({
      data: {
        companyId: q.companyId,
        clientId: q.clientId,
        name: projectName,
        stage: 'BRIEF',
        startDate: now,
        deadline: sixtyDays,
        createdBy: q.createdBy,
      },
    })

    const invoiceNumber = `INV-${q.number.slice(4)}`
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await this.prisma.tenant.invoice.create({
      data: {
        companyId: q.companyId,
        clientId: q.clientId,
        quotationId: q.id,
        number: invoiceNumber,
        type: 'STANDARD',
        status: 'DRAFT',
        items: q.items as never,
        subtotal: q.subtotal,
        discountPercent: q.discountPercent,
        discountAmount: q.discountAmount,
        taxPercent: q.taxPercent,
        taxAmount: q.taxAmount,
        total: q.total,
        balanceDue: q.total,
        currency: q.currency,
        dueDate,
        issuedDate: now,
        createdBy: q.createdBy,
      },
    })

    this.logger.log(`Quotation accepted via token: ${token}`)
    return updated
  }

  async generatePdf(companyId: string, id: string): Promise<Buffer> {
    const q = await this.findOne(companyId, id)
    return this.pdf.generateQuotationPdf(q)
  }
}
