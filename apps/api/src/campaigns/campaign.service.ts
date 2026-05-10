import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { CreateCampaignDto, UpdateCampaignDto } from './campaign.dto'

const VALID_TRANSITIONS: Record<string, string[]> = {
  PLANNING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['PAUSED', 'COMPLETED', 'CANCELLED'],
  PAUSED: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    filters?: { search?: string; status?: string; clientId?: string },
  ) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (filters?.clientId) where['clientId'] = filters.clientId
    if (filters?.status) where['status'] = filters.status
    if (filters?.search) {
      const s = filters.search
      where['OR'] = [
        { name: { contains: s, mode: 'insensitive' } },
        { nameEn: { contains: s, mode: 'insensitive' } },
        { client: { name: { contains: s, mode: 'insensitive' } } },
      ]
    }

    return this.prisma.tenant.campaign.findMany({
      where: where as never,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const campaign = await this.prisma.tenant.campaign.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        projects: {
          select: { id: true, name: true, stage: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!campaign) throw new NotFoundException('Campaign not found')
    return campaign
  }

  async create(companyId: string, userId: string, dto: CreateCampaignDto) {
    const campaign = await this.prisma.tenant.campaign.create({
      data: {
        companyId,
        clientId: dto.clientId,
        name: dto.name,
        nameEn: dto.nameEn ?? null,
        description: dto.description ?? null,
        budget: Math.round(dto.budget),
        currency: dto.currency,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        createdBy: userId,
      },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        _count: { select: { projects: true } },
      },
    })

    this.logger.log(`Campaign created: ${campaign.id} "${campaign.name}"`)
    return campaign
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateCampaignDto) {
    await this.findOne(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.name) updateData['name'] = dto.name
    if (dto.nameEn !== undefined) updateData['nameEn'] = dto.nameEn
    if (dto.description !== undefined) updateData['description'] = dto.description
    if (dto.budget) updateData['budget'] = Math.round(dto.budget)
    if (dto.currency) updateData['currency'] = dto.currency
    if (dto.startDate) updateData['startDate'] = new Date(dto.startDate)
    if (dto.endDate) updateData['endDate'] = new Date(dto.endDate)

    const updated = await this.prisma.tenant.campaign.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        _count: { select: { projects: true } },
      },
    })

    this.logger.log(`Campaign updated: ${id}`)
    return updated
  }

  async updateStatus(companyId: string, id: string, userId: string, status: string) {
    const existing = await this.findOne(companyId, id)

    const allowed = VALID_TRANSITIONS[existing.status]
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${existing.status} to ${status}. Allowed: ${(allowed ?? []).join(', ') || 'none'}`,
      )
    }

    const updated = await this.prisma.tenant.campaign.update({
      where: { id },
      data: { status: status as never, updatedBy: userId },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        _count: { select: { projects: true } },
      },
    })

    this.logger.log(`Campaign ${id} → ${status}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.campaign.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Campaign deleted: ${id}`)
  }
}
