import { Test } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { BrandBriefService } from './brand-brief.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      brandBrief: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      audiencePersona: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  }
}

const mockBrief = {
  id: 'brief-1',
  companyId: 'company-1',
  clientId: 'client-1',
  brandNameAr: 'رؤية',
  brandNameEn: "Ru'ya",
  brandStory: 'A leading production company',
  mission: 'Empower creativity',
  vision: 'Global leader',
  toneOfVoice: ['professional', 'friendly'],
  voiceDos: ['Use clear language'],
  voiceDonts: ['Avoid jargon'],
  brandKeywords: ['creative', 'production'],
  bannedWords: [],
  primaryColors: ['#FF0000'],
  secondaryColors: ['#00FF00'],
  fonts: { heading: 'Cairo', body: 'Noto Sans', accent: 'Amiri' },
  visualStyle: ['minimalist'],
  moodKeywords: ['professional'],
  culturalContext: 'Iraqi market',
  religiousConsiderations: 'Respect Islamic values',
  activePlatforms: ['instagram', 'tiktok'],
  postingFrequency: { instagram: 3, tiktok: 2 },
  competitors: [{ name: 'Competitor A', whatWeDoBetter: 'Quality' }],
  defaultPillarIds: ['pillar-1'],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
}

const mockPersona = {
  id: 'persona-1',
  companyId: 'company-1',
  brandBriefId: 'brief-1',
  name: 'Iraqi Youth',
  ageRange: '18-25',
  gender: 'male',
  location: 'Baghdad',
  occupation: 'Student',
  incomeLevel: 'medium',
  interests: ['music', 'tech'],
  painPoints: ['lack of time'],
  goals: ['career growth'],
  objections: ['too expensive'],
  motivations: ['quality content'],
  preferredPlatforms: ['instagram'],
  contentConsumptionHabits: 'Daily',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
}

describe('BrandBriefService', () => {
  let service: BrandBriefService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()

    const module = await Test.createTestingModule({
      providers: [BrandBriefService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<BrandBriefService>(BrandBriefService)
  })

  // ─── Brand Briefs ────────────────────────────────────

  describe('findAll', () => {
    it('should return all brand briefs', async () => {
      prisma.tenant.brandBrief.findMany.mockResolvedValue([mockBrief])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
      expect(prisma.tenant.brandBrief.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ companyId: 'company-1' }) }),
      )
    })

    it('should filter by clientId', async () => {
      prisma.tenant.brandBrief.findMany.mockResolvedValue([mockBrief])
      await service.findAll('company-1', { clientId: 'client-1' })
      expect(prisma.tenant.brandBrief.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clientId: 'client-1' }),
        }),
      )
    })
  })

  describe('findOne', () => {
    it('should return brand brief with personas', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue({
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [mockPersona],
      })
      const result = await service.findOne('company-1', 'brief-1')
      expect(result.id).toBe('brief-1')
      expect(result.personas).toHaveLength(1)
    })

    it('should throw if not found', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create brand brief', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue(null)
      prisma.tenant.brandBrief.create.mockResolvedValue({
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [],
      })
      const result = await service.create('company-1', 'user-1', {
        clientId: 'client-1',
        brandNameAr: 'رؤية',
        brandNameEn: "Ru'ya",
        toneOfVoice: ['professional'],
      })
      expect(result.brandNameAr).toBe('رؤية')
    })

    it('should create brand brief with nested personas', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue(null)
      const created = {
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null } as const,
        personas: [mockPersona] as (typeof mockPersona)[],
      }
      prisma.tenant.brandBrief.create.mockResolvedValue(created)
      const result = await service.create('company-1', 'user-1', {
        clientId: 'client-1',
        brandNameAr: 'رؤية',
        personas: [{ name: 'Iraqi Youth', ageRange: '18-25' }],
      })
      expect((result as typeof created).personas).toHaveLength(1)
      expect(prisma.tenant.brandBrief.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            personas: expect.objectContaining({
              create: expect.arrayContaining([expect.objectContaining({ name: 'Iraqi Youth' })]),
            }),
          }),
        }),
      )
    })

    it('should throw if client already has a brief', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue({
        id: 'existing-brief',
        clientId: 'client-1',
      })
      await expect(service.create('company-1', 'user-1', { clientId: 'client-1' })).rejects.toThrow(
        ConflictException,
      )
    })
  })

  describe('update', () => {
    it('should update brand brief fields', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue({
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [],
      })
      prisma.tenant.brandBrief.update.mockResolvedValue({
        ...mockBrief,
        brandStory: 'Updated story',
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [],
      })
      const result = await service.update('company-1', 'brief-1', 'user-1', {
        brandStory: 'Updated story',
      })
      expect(result.brandStory).toBe('Updated story')
    })

    it('should throw if not found', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue(null)
      await expect(service.update('company-1', 'nonexistent', 'user-1', {})).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should soft delete brand brief', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue({
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [],
      })
      prisma.tenant.brandBrief.update.mockResolvedValue({ ...mockBrief, deletedAt: new Date() })
      await service.remove('company-1', 'brief-1', 'user-1')
      expect(prisma.tenant.brandBrief.update).toHaveBeenCalled()
    })
  })

  // ─── Audience Personas ───────────────────────────────

  describe('findPersonas', () => {
    it('should return personas for a brief', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue({
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [],
      })
      prisma.tenant.audiencePersona.findMany.mockResolvedValue([mockPersona])
      const result = await service.findPersonas('company-1', 'brief-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('createPersona', () => {
    it('should create a persona', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue({
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [],
      })
      prisma.tenant.audiencePersona.create.mockResolvedValue(mockPersona)
      const result = await service.createPersona('company-1', 'brief-1', 'user-1', {
        name: 'Iraqi Youth',
      })
      expect(result.name).toBe('Iraqi Youth')
    })
  })

  describe('updatePersona', () => {
    it('should update persona fields', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue({
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [],
      })
      prisma.tenant.audiencePersona.findFirst.mockResolvedValue(mockPersona)
      prisma.tenant.audiencePersona.update.mockResolvedValue({
        ...mockPersona,
        ageRange: '26-35',
      })
      const result = await service.updatePersona('company-1', 'brief-1', 'persona-1', 'user-1', {
        ageRange: '26-35',
      })
      expect(result.ageRange).toBe('26-35')
    })

    it('should throw if persona not found', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue({
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [],
      })
      prisma.tenant.audiencePersona.findFirst.mockResolvedValue(null)
      await expect(
        service.updatePersona('company-1', 'brief-1', 'nonexistent', 'user-1', { name: 'X' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removePersona', () => {
    it('should soft delete persona', async () => {
      prisma.tenant.brandBrief.findFirst.mockResolvedValue({
        ...mockBrief,
        client: { id: 'client-1', name: 'Client', nameEn: null },
        personas: [],
      })
      prisma.tenant.audiencePersona.findFirst.mockResolvedValue(mockPersona)
      prisma.tenant.audiencePersona.update.mockResolvedValue({
        ...mockPersona,
        deletedAt: new Date(),
      })
      await service.removePersona('company-1', 'brief-1', 'persona-1')
      expect(prisma.tenant.audiencePersona.update).toHaveBeenCalled()
    })
  })
})
