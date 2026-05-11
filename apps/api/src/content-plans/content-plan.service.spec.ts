import { Test } from '@nestjs/testing'
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'
import { ContentPlanService } from './content-plan.service'
import { PrismaService } from '../database/prisma.service'
import { AiGenerationService } from '../ai/ai-generation.service'

function mockPrisma() {
  return {
    tenant: {
      contentPlan: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      campaign: { findFirst: jest.fn() },
      contentPiece: {
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
    },
  }
}

function mockAi() {
  return {
    generate: jest.fn(),
  }
}

const mockPlan = {
  id: 'plan-1',
  companyId: 'company-1',
  clientId: 'client-1',
  campaignId: null,
  title: 'يناير 2026',
  month: 1,
  year: 2026,
  status: 'DRAFT',
  monthlyObjectives: null,
  pillarDistribution: null,
  contentTypeDistribution: null,
  clientApprovalStatus: null,
  clientApprovedAt: null,
  clientApprovedBy: null,
  clientRevisionCount: 0,
  clientRevisionLimit: 2,
  totalPiecesPlanned: 0,
  totalPiecesPublished: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
}

describe('ContentPlanService', () => {
  let service: ContentPlanService
  let prisma: ReturnType<typeof mockPrisma>
  let ai: ReturnType<typeof mockAi>

  beforeEach(async () => {
    prisma = mockPrisma()
    ai = mockAi()

    const module = await Test.createTestingModule({
      providers: [
        ContentPlanService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiGenerationService, useValue: ai },
      ],
    }).compile()

    service = module.get<ContentPlanService>(ContentPlanService)
  })

  describe('findAll', () => {
    it('should return plans with filters', async () => {
      prisma.tenant.contentPlan.findMany.mockResolvedValue([mockPlan])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
    })

    it('should filter by clientId', async () => {
      prisma.tenant.contentPlan.findMany.mockResolvedValue([mockPlan])
      await service.findAll('company-1', { clientId: 'client-1' })
      expect(prisma.tenant.contentPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clientId: 'client-1' }),
        }),
      )
    })
  })

  describe('findOne', () => {
    it('should return plan with pieces', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue({
        ...mockPlan,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
        campaign: null,
        pieces: [],
      })
      const result = await service.findOne('company-1', 'plan-1')
      expect(result.title).toBe('يناير 2026')
    })

    it('should throw if not found', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a plan', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue(null)
      prisma.tenant.contentPlan.create.mockResolvedValue({
        ...mockPlan,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
      })
      const result = await service.create('company-1', 'user-1', {
        clientId: 'client-1',
        month: 1,
        year: 2026,
      })
      expect(result.month).toBe(1)
    })

    it('should throw if plan already exists for client+month', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue({ id: 'existing' })
      await expect(
        service.create('company-1', 'user-1', { clientId: 'client-1', month: 1, year: 2026 }),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('updateStatus', () => {
    it('should transition DRAFT → IN_REVIEW', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue({
        ...mockPlan,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
        campaign: null,
        pieces: [],
      })
      prisma.tenant.contentPlan.update.mockResolvedValue({
        ...mockPlan,
        status: 'IN_REVIEW',
        client: { id: 'client-1', name: 'عميل', nameEn: null },
      })
      const result = await service.updateStatus('company-1', 'plan-1', 'user-1', {
        status: 'IN_REVIEW',
      })
      expect(result.status).toBe('IN_REVIEW')
    })

    it('should reject invalid transition', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue({
        ...mockPlan,
        status: 'COMPLETED',
        client: { id: 'client-1', name: 'عميل', nameEn: null },
        campaign: null,
        pieces: [],
      })
      await expect(
        service.updateStatus('company-1', 'plan-1', 'user-1', { status: 'DRAFT' }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('generateIdeas', () => {
    it('should call AI and return parsed ideas', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue({
        ...mockPlan,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
        campaign: null,
        pieces: [],
      })
      ai.generate.mockResolvedValue({
        content: '[{"title":"Idea 1","type":"REEL","pillarIndex":0}]',
        tokensInput: 50,
        tokensOutput: 30,
        costEstimateUsd: 0.001,
      })
      const result = await service.generateIdeas('company-1', 'plan-1', { count: 50 })
      expect(result.ideas).toHaveLength(1)
      expect(result.ideas[0]).toMatchObject({ title: 'Idea 1' })
    })
  })

  describe('finalize', () => {
    it('should create content pieces', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue({
        ...mockPlan,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
        campaign: null,
        pieces: [],
      })
      prisma.tenant.contentPlan.update.mockResolvedValue({ ...mockPlan, totalPiecesPlanned: 2 })
      prisma.tenant.contentPiece.createMany.mockResolvedValue({ count: 2 })
      prisma.tenant.contentPiece.findMany.mockResolvedValue([{}, {}])

      const result = await service.finalize('company-1', 'plan-1', 'user-1', {
        pieces: [
          { title: 'Piece 1', type: 'REEL', platforms: ['instagram'], scheduledDay: 5 },
          { title: 'Piece 2', type: 'STATIC_DESIGN', platforms: ['instagram'], scheduledDay: 10 },
        ],
      })
      expect(result).toHaveLength(2)
    })

    it('should reject invalid day for month', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue({
        ...mockPlan,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
        campaign: null,
        pieces: [],
      })
      await expect(
        service.finalize('company-1', 'plan-1', 'user-1', {
          pieces: [{ title: 'X', type: 'REEL', platforms: ['instagram'], scheduledDay: 32 }],
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })
})
