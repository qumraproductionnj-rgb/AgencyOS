import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import type { LeadStatus } from '@agencyos/database'
import { PrismaService } from '../database/prisma.service'
import type { CreateLeadDto, UpdateLeadDto } from './lead.dto'

const STAGE_ORDER: Record<string, number> = {
  NEW: 0,
  CONTACTED: 1,
  QUALIFIED: 2,
  PROPOSAL: 3,
  NEGOTIATION: 4,
  WON: 5,
  LOST: 5,
}

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, filters?: { search?: string; status?: string }) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }

    if (filters?.status) where['status'] = filters.status
    if (filters?.search) {
      const s = filters.search
      where['OR'] = [
        { name: { contains: s, mode: 'insensitive' } },
        { companyName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
      ]
    }

    return this.prisma.tenant.lead.findMany({
      where: where as never,
      include: {
        assignee: { select: { id: true, email: true } },
        deals: {
          select: { id: true, name: true, value: true, currency: true, stage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const lead = await this.prisma.tenant.lead.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        assignee: { select: { id: true, email: true } },
        deals: {
          select: { id: true, name: true, value: true, currency: true, stage: true },
        },
      },
    })
    if (!lead) throw new NotFoundException('Lead not found')
    return lead
  }

  async create(companyId: string, userId: string, dto: CreateLeadDto) {
    const lead = await this.prisma.tenant.lead.create({
      data: {
        companyId,
        name: dto.name,
        ...(dto.companyName ? { companyName: dto.companyName } : {}),
        ...(dto.email ? { email: dto.email } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
        ...(dto.source ? { source: dto.source } : {}),
        ...(dto.notes ? { notes: dto.notes } : {}),
        createdBy: userId,
      },
      include: {
        assignee: { select: { id: true, email: true } },
      },
    })

    this.logger.log(`Lead created: ${lead.id} (${lead.name})`)
    return lead
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateLeadDto) {
    await this.findOne(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.name !== undefined) updateData['name'] = dto.name
    if (dto.companyName !== undefined) updateData['companyName'] = dto.companyName
    if (dto.email !== undefined) updateData['email'] = dto.email
    if (dto.phone !== undefined) updateData['phone'] = dto.phone
    if (dto.source !== undefined) updateData['source'] = dto.source
    if (dto.notes !== undefined) updateData['notes'] = dto.notes
    if (dto.assignedTo !== undefined) updateData['assignedTo'] = dto.assignedTo

    const updated = await this.prisma.tenant.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, email: true } },
      },
    })

    this.logger.log(`Lead updated: ${id}`)
    return updated
  }

  async updateStatus(companyId: string, id: string, userId: string, status: LeadStatus) {
    const lead = await this.findOne(companyId, id)
    const currentOrder = STAGE_ORDER[lead.status] ?? 0
    const newOrder = STAGE_ORDER[status] ?? 0

    if (newOrder < currentOrder) {
      throw new BadRequestException(
        `Cannot move lead backward from ${lead.status} to ${status}. Only forward transitions are allowed.`,
      )
    }

    if (status === 'WON') {
      return this.convertToClient(companyId, id, lead, userId)
    }

    if (status === 'LOST') {
      const updated = await this.prisma.tenant.lead.update({
        where: { id },
        data: { status: 'LOST', updatedBy: userId },
        include: {
          assignee: { select: { id: true, email: true } },
        },
      })
      this.logger.log(`Lead lost: ${id}`)
      return updated
    }

    const updated = await this.prisma.tenant.lead.update({
      where: { id },
      data: { status, updatedBy: userId },
      include: {
        assignee: { select: { id: true, email: true } },
      },
    })

    this.logger.log(`Lead status updated: ${id} → ${status}`)
    return updated
  }

  private async convertToClient(
    companyId: string,
    leadId: string,
    lead: Awaited<ReturnType<LeadService['findOne']>>,
    userId: string,
  ) {
    const clientName = lead.companyName || lead.name

    const client = await this.prisma.tenant.client.create({
      data: {
        companyId,
        name: clientName,
        ...(lead.email ? { email: lead.email } : {}),
        ...(lead.phone ? { phone: lead.phone } : {}),
        notes: `Converted from lead: ${lead.name}`,
        createdBy: userId,
      },
    })

    const deal = await this.prisma.tenant.deal.create({
      data: {
        companyId,
        leadId: lead.id,
        clientId: client.id,
        name: `Deal - ${lead.name}`,
        stage: 'QUALIFICATION',
        createdBy: userId,
      },
    })

    const updated = await this.prisma.tenant.lead.update({
      where: { id: leadId },
      data: {
        status: 'WON',
        convertedAt: new Date(),
        convertedToClientId: client.id,
        convertedToDealId: deal.id,
        updatedBy: userId,
      },
      include: {
        assignee: { select: { id: true, email: true } },
        deals: true,
      },
    })

    this.logger.log(`Lead converted: ${leadId} → client ${client.id}, deal ${deal.id}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.lead.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Lead deleted: ${id}`)
  }
}
