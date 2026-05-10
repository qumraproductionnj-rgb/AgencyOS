import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { CreateProjectDto, UpdateProjectDto } from './project.dto'

const MAX_REVISIONS = 3

const VALID_TRANSITIONS: Record<string, string[]> = {
  BRIEF: ['PLANNING', 'CANCELLED'],
  PLANNING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['REVIEW', 'CANCELLED'],
  REVIEW: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  COMPLETED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    filters?: { search?: string; stage?: string; clientId?: string },
  ) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (filters?.stage) where['stage'] = filters.stage
    if (filters?.clientId) where['clientId'] = filters.clientId
    if (filters?.search) {
      const s = filters.search
      where['OR'] = [
        { name: { contains: s, mode: 'insensitive' } },
        { nameEn: { contains: s, mode: 'insensitive' } },
        { client: { name: { contains: s, mode: 'insensitive' } } },
      ]
    }

    return this.prisma.tenant.project.findMany({
      where: where as never,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        campaign: { select: { id: true, name: true } },
        _count: { select: { tasks: true, revisions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const project = await this.prisma.tenant.project.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        campaign: { select: { id: true, name: true } },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: { select: { id: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        revisions: {
          select: {
            id: true,
            revisionNumber: true,
            notes: true,
            createdAt: true,
            requestor: { select: { id: true, email: true } },
          },
          orderBy: { revisionNumber: 'desc' },
        },
      },
    })
    if (!project) throw new NotFoundException('Project not found')
    return project
  }

  async create(companyId: string, userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.tenant.project.create({
      data: {
        companyId,
        clientId: dto.clientId,
        campaignId: dto.campaignId ?? null,
        name: dto.name,
        nameEn: dto.nameEn ?? null,
        description: dto.description ?? null,
        budget: Math.round(dto.budget),
        currency: dto.currency,
        startDate: new Date(dto.startDate),
        deadline: new Date(dto.deadline),
        createdBy: userId,
      },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        campaign: { select: { id: true, name: true } },
        _count: { select: { tasks: true, revisions: true } },
      },
    })

    this.logger.log(`Project created: ${project.id} "${project.name}"`)
    return project
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateProjectDto) {
    await this.findOne(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.name) updateData['name'] = dto.name
    if (dto.nameEn !== undefined) updateData['nameEn'] = dto.nameEn
    if (dto.description !== undefined) updateData['description'] = dto.description
    if (dto.budget) updateData['budget'] = Math.round(dto.budget)
    if (dto.currency) updateData['currency'] = dto.currency
    if (dto.startDate) updateData['startDate'] = new Date(dto.startDate)
    if (dto.deadline) updateData['deadline'] = new Date(dto.deadline)

    const updated = await this.prisma.tenant.project.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        campaign: { select: { id: true, name: true } },
        _count: { select: { tasks: true, revisions: true } },
      },
    })

    this.logger.log(`Project updated: ${id}`)
    return updated
  }

  async updateStage(companyId: string, id: string, userId: string, stage: string) {
    const existing = await this.findOne(companyId, id)

    const allowed = VALID_TRANSITIONS[existing.stage]
    if (!allowed || !allowed.includes(stage)) {
      throw new BadRequestException(
        `Cannot transition from ${existing.stage} to ${stage}. Allowed: ${(allowed ?? []).join(', ') || 'none'}`,
      )
    }

    const updateData: Record<string, unknown> = { stage: stage as never, updatedBy: userId }
    if (stage === 'COMPLETED' || stage === 'DELIVERED') {
      updateData['completedAt'] = new Date()
    }

    const updated = await this.prisma.tenant.project.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        campaign: { select: { id: true, name: true } },
        _count: { select: { tasks: true, revisions: true } },
      },
    })

    this.logger.log(`Project ${id} → ${stage}`)
    return updated
  }

  async addRevision(companyId: string, id: string, userId: string, notes?: string) {
    await this.findOne(companyId, id)

    const revisionCount = await this.prisma.tenant.revision.count({
      where: { projectId: id, companyId, deletedAt: null },
    })

    if (revisionCount >= MAX_REVISIONS) {
      throw new BadRequestException(
        `Revision limit reached (${MAX_REVISIONS}). Consider extending the project or discussing with the client.`,
      )
    }

    const revision = await this.prisma.tenant.revision.create({
      data: {
        companyId,
        projectId: id,
        revisionNumber: revisionCount + 1,
        requestedBy: userId,
        notes: notes ?? null,
        createdBy: userId,
      },
    })

    this.logger.log(`Revision #${revision.revisionNumber} added to project ${id}`)

    const remaining = MAX_REVISIONS - (revisionCount + 1)
    if (remaining <= 0) {
      this.logger.warn(`Project ${id}: revision limit reached (${MAX_REVISIONS})`)
    }

    return { revision, remaining, limit: MAX_REVISIONS }
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.project.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Project deleted: ${id}`)
  }
}
