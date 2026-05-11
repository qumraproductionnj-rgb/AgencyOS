import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type {
  CreateContentPillarDto,
  UpdateContentPillarDto,
  ContentPillarQueryDto,
} from './content-pillar.dto'

@Injectable()
export class ContentPillarService {
  private readonly logger = new Logger(ContentPillarService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, query?: ContentPillarQueryDto) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (query?.clientId) where['clientId'] = query.clientId

    return this.prisma.tenant.contentPillar.findMany({
      where: where as never,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const pillar = await this.prisma.tenant.contentPillar.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
      },
    })
    if (!pillar) throw new NotFoundException('Content pillar not found')
    return pillar
  }

  async create(companyId: string, userId: string, dto: CreateContentPillarDto) {
    const pillar = await this.prisma.tenant.contentPillar.create({
      data: {
        companyId,
        clientId: dto.clientId,
        nameAr: dto.nameAr,
        nameEn: dto.nameEn ?? null,
        description: dto.description ?? null,
        color: dto.color ?? null,
        icon: dto.icon ?? null,
        percentageTarget: dto.percentageTarget ?? null,
        exampleTopics: dto.exampleTopics ?? [],
        recommendedFormats: dto.recommendedFormats ?? [],
        createdBy: userId,
      },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
      },
    })

    this.logger.log(`Content pillar created: ${pillar.id} "${pillar.nameAr}"`)
    return pillar
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateContentPillarDto) {
    await this.findOne(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.nameAr) updateData['nameAr'] = dto.nameAr
    if (dto.nameEn !== undefined) updateData['nameEn'] = dto.nameEn
    if (dto.description !== undefined) updateData['description'] = dto.description
    if (dto.color !== undefined) updateData['color'] = dto.color
    if (dto.icon !== undefined) updateData['icon'] = dto.icon
    if (dto.percentageTarget !== undefined) updateData['percentageTarget'] = dto.percentageTarget
    if (dto.exampleTopics !== undefined) updateData['exampleTopics'] = dto.exampleTopics
    if (dto.recommendedFormats !== undefined)
      updateData['recommendedFormats'] = dto.recommendedFormats

    const updated = await this.prisma.tenant.contentPillar.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
      },
    })

    this.logger.log(`Content pillar updated: ${id}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.contentPillar.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Content pillar deleted: ${id}`)
  }
}
