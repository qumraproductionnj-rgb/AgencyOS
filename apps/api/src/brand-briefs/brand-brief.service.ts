import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type {
  CreateBrandBriefDto,
  UpdateBrandBriefDto,
  BrandBriefQueryDto,
  CreatePersonaDto,
  UpdatePersonaDto,
} from './brand-brief.dto'

@Injectable()
export class BrandBriefService {
  private readonly logger = new Logger(BrandBriefService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ─── Brand Briefs ────────────────────────────────────

  async findAll(companyId: string, query?: BrandBriefQueryDto) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (query?.clientId) where['clientId'] = query.clientId

    return this.prisma.tenant.brandBrief.findMany({
      where: where as never,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        _count: { select: { personas: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const brief = await this.prisma.tenant.brandBrief.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        personas: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!brief) throw new NotFoundException('Brand brief not found')
    return brief
  }

  async create(companyId: string, userId: string, dto: CreateBrandBriefDto) {
    const existing = await this.prisma.tenant.brandBrief.findFirst({
      where: { clientId: dto.clientId, companyId, deletedAt: null },
      select: { id: true },
    })
    if (existing) {
      throw new ConflictException('Client already has a brand brief')
    }

    const createData: Record<string, unknown> = {
      companyId,
      clientId: dto.clientId,
      brandNameAr: dto.brandNameAr ?? null,
      brandNameEn: dto.brandNameEn ?? null,
      brandStory: dto.brandStory ?? null,
      mission: dto.mission ?? null,
      vision: dto.vision ?? null,
      toneOfVoice: dto.toneOfVoice ?? [],
      voiceDos: dto.voiceDos ?? [],
      voiceDonts: dto.voiceDonts ?? [],
      brandKeywords: dto.brandKeywords ?? [],
      bannedWords: dto.bannedWords ?? [],
      primaryColors: dto.primaryColors ?? [],
      secondaryColors: dto.secondaryColors ?? [],
      visualStyle: dto.visualStyle ?? [],
      moodKeywords: dto.moodKeywords ?? [],
      culturalContext: dto.culturalContext ?? null,
      religiousConsiderations: dto.religiousConsiderations ?? null,
      activePlatforms: dto.activePlatforms ?? [],
      defaultPillarIds: dto.defaultPillarIds ?? [],
      createdBy: userId,
    }
    if (dto.fonts) createData['fonts'] = dto.fonts
    if (dto.postingFrequency) createData['postingFrequency'] = dto.postingFrequency
    if (dto.competitors) createData['competitors'] = dto.competitors
    if (dto.personas) {
      createData['personas'] = {
        create: dto.personas.map((p) => {
          const personaData: Record<string, unknown> = {
            companyId,
            name: p.name,
            createdBy: userId,
          }
          if (p.ageRange) personaData['ageRange'] = p.ageRange
          if (p.gender) personaData['gender'] = p.gender
          if (p.location) personaData['location'] = p.location
          if (p.occupation) personaData['occupation'] = p.occupation
          if (p.incomeLevel) personaData['incomeLevel'] = p.incomeLevel
          if (p.interests) personaData['interests'] = p.interests
          if (p.painPoints) personaData['painPoints'] = p.painPoints
          if (p.goals) personaData['goals'] = p.goals
          if (p.objections) personaData['objections'] = p.objections
          if (p.motivations) personaData['motivations'] = p.motivations
          if (p.preferredPlatforms) personaData['preferredPlatforms'] = p.preferredPlatforms
          if (p.contentConsumptionHabits)
            personaData['contentConsumptionHabits'] = p.contentConsumptionHabits
          if (p.avatarUrl) personaData['avatarUrl'] = p.avatarUrl
          return personaData
        }),
      }
    }

    const brief = await this.prisma.tenant.brandBrief.create({
      data: createData as never,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        personas: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    this.logger.log(`Brand brief created: ${brief.id} for client ${dto.clientId}`)
    return brief
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateBrandBriefDto) {
    await this.findOne(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.brandNameAr !== undefined) updateData['brandNameAr'] = dto.brandNameAr
    if (dto.brandNameEn !== undefined) updateData['brandNameEn'] = dto.brandNameEn
    if (dto.brandStory !== undefined) updateData['brandStory'] = dto.brandStory
    if (dto.mission !== undefined) updateData['mission'] = dto.mission
    if (dto.vision !== undefined) updateData['vision'] = dto.vision
    if (dto.toneOfVoice !== undefined) updateData['toneOfVoice'] = dto.toneOfVoice
    if (dto.voiceDos !== undefined) updateData['voiceDos'] = dto.voiceDos
    if (dto.voiceDonts !== undefined) updateData['voiceDonts'] = dto.voiceDonts
    if (dto.brandKeywords !== undefined) updateData['brandKeywords'] = dto.brandKeywords
    if (dto.bannedWords !== undefined) updateData['bannedWords'] = dto.bannedWords
    if (dto.primaryColors !== undefined) updateData['primaryColors'] = dto.primaryColors
    if (dto.secondaryColors !== undefined) updateData['secondaryColors'] = dto.secondaryColors
    if (dto.fonts !== undefined) updateData['fonts'] = dto.fonts
    if (dto.visualStyle !== undefined) updateData['visualStyle'] = dto.visualStyle
    if (dto.moodKeywords !== undefined) updateData['moodKeywords'] = dto.moodKeywords
    if (dto.culturalContext !== undefined) updateData['culturalContext'] = dto.culturalContext
    if (dto.religiousConsiderations !== undefined)
      updateData['religiousConsiderations'] = dto.religiousConsiderations
    if (dto.activePlatforms !== undefined) updateData['activePlatforms'] = dto.activePlatforms
    if (dto.postingFrequency !== undefined) updateData['postingFrequency'] = dto.postingFrequency
    if (dto.competitors !== undefined) updateData['competitors'] = dto.competitors
    if (dto.defaultPillarIds !== undefined) updateData['defaultPillarIds'] = dto.defaultPillarIds

    const updated = await this.prisma.tenant.brandBrief.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        personas: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    this.logger.log(`Brand brief updated: ${id}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.brandBrief.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Brand brief deleted: ${id}`)
  }

  // ─── Audience Personas ───────────────────────────────

  async findPersonas(companyId: string, briefId: string) {
    await this.findOne(companyId, briefId)

    return this.prisma.tenant.audiencePersona.findMany({
      where: { brandBriefId: briefId, companyId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    })
  }

  async createPersona(companyId: string, briefId: string, userId: string, dto: CreatePersonaDto) {
    await this.findOne(companyId, briefId)

    const persona = await this.prisma.tenant.audiencePersona.create({
      data: {
        companyId,
        brandBriefId: briefId,
        name: dto.name,
        ageRange: dto.ageRange ?? null,
        gender: dto.gender ?? null,
        location: dto.location ?? null,
        occupation: dto.occupation ?? null,
        incomeLevel: dto.incomeLevel ?? null,
        interests: dto.interests ?? [],
        painPoints: dto.painPoints ?? [],
        goals: dto.goals ?? [],
        objections: dto.objections ?? [],
        motivations: dto.motivations ?? [],
        preferredPlatforms: dto.preferredPlatforms ?? [],
        contentConsumptionHabits: dto.contentConsumptionHabits ?? null,
        avatarUrl: dto.avatarUrl ?? null,
        createdBy: userId,
      },
    })

    this.logger.log(`Persona created: ${persona.id} for brief ${briefId}`)
    return persona
  }

  async updatePersona(
    companyId: string,
    briefId: string,
    personaId: string,
    userId: string,
    dto: UpdatePersonaDto,
  ) {
    await this.findOne(companyId, briefId)
    await this.findPersonaOrThrow(companyId, personaId)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.name) updateData['name'] = dto.name
    if (dto.ageRange !== undefined) updateData['ageRange'] = dto.ageRange
    if (dto.gender !== undefined) updateData['gender'] = dto.gender
    if (dto.location !== undefined) updateData['location'] = dto.location
    if (dto.occupation !== undefined) updateData['occupation'] = dto.occupation
    if (dto.incomeLevel !== undefined) updateData['incomeLevel'] = dto.incomeLevel
    if (dto.interests !== undefined) updateData['interests'] = dto.interests
    if (dto.painPoints !== undefined) updateData['painPoints'] = dto.painPoints
    if (dto.goals !== undefined) updateData['goals'] = dto.goals
    if (dto.objections !== undefined) updateData['objections'] = dto.objections
    if (dto.motivations !== undefined) updateData['motivations'] = dto.motivations
    if (dto.preferredPlatforms !== undefined)
      updateData['preferredPlatforms'] = dto.preferredPlatforms
    if (dto.contentConsumptionHabits !== undefined)
      updateData['contentConsumptionHabits'] = dto.contentConsumptionHabits
    if (dto.avatarUrl !== undefined) updateData['avatarUrl'] = dto.avatarUrl

    const updated = await this.prisma.tenant.audiencePersona.update({
      where: { id: personaId },
      data: updateData,
    })

    this.logger.log(`Persona updated: ${personaId}`)
    return updated
  }

  async removePersona(companyId: string, briefId: string, personaId: string) {
    await this.findOne(companyId, briefId)
    await this.findPersonaOrThrow(companyId, personaId)

    await this.prisma.tenant.audiencePersona.update({
      where: { id: personaId },
      data: { deletedAt: new Date() },
    })

    this.logger.log(`Persona deleted: ${personaId}`)
  }

  // ─── Helpers ─────────────────────────────────────────

  private async findPersonaOrThrow(companyId: string, id: string) {
    const persona = await this.prisma.tenant.audiencePersona.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    if (!persona) throw new NotFoundException('Persona not found')
    return persona
  }
}
