import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ContentPieceService } from './content-piece.service'
import { PrismaService } from '../database/prisma.service'
import { IntegrationService } from '../integrations/integration.service'
import { NotificationService } from '../notifications/notification.service'

function mockPrisma() {
  return {
    tenant: {
      contentPiece: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      contentRevision: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  }
}

const mockPiece = {
  id: 'piece-1',
  companyId: 'company-1',
  planId: 'plan-1',
  clientId: 'client-1',
  pillarId: null,
  projectId: null,
  title: 'منشور توعوي',
  type: 'STATIC_DESIGN',
  platforms: ['instagram'],
  stage: 'IDEA',
  bigIdea: null,
  frameworkUsed: null,
  frameworkData: null,
  components: null,
  captionAr: null,
  captionEn: null,
  hashtags: [],
  ctaText: null,
  ctaLink: null,
  linkedAssets: [],
  inspirationRefs: null,
  scheduledAt: null,
  publishedAt: null,
  internalApproverId: null,
  internalApprovedAt: null,
  clientApprovalStatus: null,
  clientApprovedAt: null,
  metrics: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
  plan: { id: 'plan-1', month: 1, year: 2026, title: 'يناير 2026' },
  client: { id: 'client-1', name: 'عميل', nameEn: null },
  pillar: null,
  project: null,
  revisions: [],
}

const mockRevision = {
  id: 'rev-1',
  companyId: 'company-1',
  contentPieceId: 'piece-1',
  roundNumber: 1,
  feedbackText: 'يرجى تعديل اللون',
  feedbackAnnotations: null,
  attachedFiles: [],
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  requestedBy: 'user-1',
  resolvedBy: null,
  resolvedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
}

describe('ContentPieceService', () => {
  let service: ContentPieceService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()

    const module = await Test.createTestingModule({
      providers: [
        ContentPieceService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: IntegrationService,
          useValue: {
            onPieceApproved: jest.fn().mockResolvedValue(undefined),
            onPieceScheduled: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: NotificationService, useValue: { create: jest.fn() } },
      ],
    }).compile()

    service = module.get<ContentPieceService>(ContentPieceService)
  })

  describe('findOne', () => {
    it('should return a content piece with relations', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      const result = await service.findOne('company-1', 'piece-1')
      expect(result.title).toBe('منشور توعوي')
      expect(result.type).toBe('STATIC_DESIGN')
    })

    it('should throw NotFoundException for missing piece', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'nonexistent')).rejects.toThrow(NotFoundException)
    })

    it('should query with companyId and deletedAt filter', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      await service.findOne('company-1', 'piece-1')
      expect(prisma.tenant.contentPiece.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'piece-1', companyId: 'company-1', deletedAt: null },
        }),
      )
    })
  })

  describe('update', () => {
    it('should update piece fields', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.contentPiece.update.mockResolvedValue({ ...mockPiece, captionAr: 'نص جديد' })

      const result = await service.update('company-1', 'piece-1', 'user-1', {
        captionAr: 'نص جديد',
        hashtags: ['توعية', 'صحة'],
      })

      expect(result.captionAr).toBe('نص جديد')
      expect(prisma.tenant.contentPiece.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'piece-1' },
          data: expect.objectContaining({
            captionAr: 'نص جديد',
            hashtags: ['توعية', 'صحة'],
            updatedBy: 'user-1',
          }),
        }),
      )
    })

    it('should throw if piece not found', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(null)
      await expect(
        service.update('company-1', 'nonexistent', 'user-1', { title: 'New' }),
      ).rejects.toThrow(NotFoundException)
    })

    it('should ignore undefined fields', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.contentPiece.update.mockResolvedValue(mockPiece)

      await service.update('company-1', 'piece-1', 'user-1', {
        title: undefined,
      })

      const updateCall = prisma.tenant.contentPiece.update.mock.calls[0][0]
      expect(updateCall.data.title).toBeUndefined()
    })
  })

  describe('updateStage', () => {
    it('should return the same piece when stage is unchanged', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)

      const result = await service.updateStage('company-1', 'piece-1', 'user-1', { stage: 'IDEA' })

      expect(result).toEqual(mockPiece)
      expect(prisma.tenant.contentPiece.update).not.toHaveBeenCalled()
    })

    it('should transition IDEA → IN_WRITING', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.contentPiece.update.mockResolvedValue({ ...mockPiece, stage: 'IN_WRITING' })

      const result = await service.updateStage('company-1', 'piece-1', 'user-1', {
        stage: 'IN_WRITING',
      })

      expect(result.stage).toBe('IN_WRITING')
    })

    it('should set approval timestamps when transitioning to APPROVED', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue({
        ...mockPiece,
        stage: 'INTERNAL_REVIEW',
      })
      prisma.tenant.contentPiece.update.mockResolvedValue({ ...mockPiece, stage: 'APPROVED' })

      await service.updateStage('company-1', 'piece-1', 'user-1', { stage: 'APPROVED' })

      expect(prisma.tenant.contentPiece.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stage: 'APPROVED',
            internalApprovedAt: expect.any(Date),
            internalApproverId: 'user-1',
          }),
        }),
      )
    })

    it('should throw on invalid transition', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece) // stage: IDEA

      await expect(
        service.updateStage('company-1', 'piece-1', 'user-1', { stage: 'PUBLISHED' }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw on transition from terminal stage', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue({ ...mockPiece, stage: 'PUBLISHED' })

      await expect(
        service.updateStage('company-1', 'piece-1', 'user-1', { stage: 'SCHEDULED' }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('findRevisions', () => {
    it('should return revisions ordered by roundNumber desc', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.contentRevision.findMany.mockResolvedValue([mockRevision])

      const result = await service.findRevisions('company-1', 'piece-1')

      expect(result).toHaveLength(1)
      expect(prisma.tenant.contentRevision.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { contentPieceId: 'piece-1', deletedAt: null },
          orderBy: { roundNumber: 'desc' },
        }),
      )
    })

    it('should throw if piece not found', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(null)

      await expect(service.findRevisions('company-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('createRevision', () => {
    it('should create a revision with PENDING status', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.contentRevision.create.mockResolvedValue(mockRevision)

      const result = await service.createRevision('company-1', 'piece-1', 'user-1', {
        roundNumber: 1,
        feedbackText: 'يرجى تعديل اللون',
        attachedFiles: [],
      })

      expect(result.roundNumber).toBe(1)
      expect(result.status).toBe('PENDING')
      expect(prisma.tenant.contentRevision.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 'company-1',
            contentPieceId: 'piece-1',
            roundNumber: 1,
            requestedBy: 'user-1',
            createdBy: 'user-1',
          }),
        }),
      )
    })

    it('should throw if piece not found', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(null)

      await expect(
        service.createRevision('company-1', 'nonexistent', 'user-1', { roundNumber: 1 }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateRevision', () => {
    it('should update revision fields', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.contentRevision.findFirst.mockResolvedValue(mockRevision)
      prisma.tenant.contentRevision.update.mockResolvedValue({
        ...mockRevision,
        feedbackText: 'محدث',
      })

      const result = await service.updateRevision('company-1', 'piece-1', 'rev-1', 'user-1', {
        feedbackText: 'محدث',
      })

      expect(result.feedbackText).toBe('محدث')
    })

    it('should set resolver when marking as COMPLETED', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.contentRevision.findFirst.mockResolvedValue(mockRevision)
      prisma.tenant.contentRevision.update.mockResolvedValue({
        ...mockRevision,
        status: 'COMPLETED',
      })

      await service.updateRevision('company-1', 'piece-1', 'rev-1', 'user-1', {
        status: 'COMPLETED',
      })

      expect(prisma.tenant.contentRevision.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            resolvedBy: 'user-1',
            resolvedAt: expect.any(Date),
          }),
        }),
      )
    })

    it('should throw if revision not found', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.contentRevision.findFirst.mockResolvedValue(null)

      await expect(
        service.updateRevision('company-1', 'piece-1', 'nonexistent', 'user-1', {
          feedbackText: 'x',
        }),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
