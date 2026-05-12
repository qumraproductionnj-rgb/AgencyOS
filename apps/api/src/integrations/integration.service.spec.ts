import { Test } from '@nestjs/testing'
import { IntegrationService } from './integration.service'
import { PrismaService } from '../database/prisma.service'
import { NotificationService } from '../notifications/notification.service'

function mockPrisma() {
  return {
    tenant: {
      contentPlan: {
        findFirst: jest.fn(),
      },
      contentPiece: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      task: {
        create: jest.fn(),
      },
      asset: {
        create: jest.fn(),
      },
      userRole: {
        findMany: jest.fn(),
      },
    },
  }
}

function mockNotificationService() {
  return { create: jest.fn() }
}

const mockPlan = {
  id: 'plan-1',
  companyId: 'company-1',
  clientId: 'client-1',
  title: 'January 2026',
  month: 1,
  year: 2026,
  status: 'ACTIVE',
  client: { id: 'client-1', name: 'Test Client' },
  pieces: [
    {
      id: 'piece-1',
      title: 'Test Reel',
      type: 'REEL',
      platforms: ['instagram'],
      scheduledAt: new Date('2026-01-15'),
      bigIdea: null,
      clientId: 'client-1',
      projectId: null,
      pillarId: null,
      deletedAt: null,
    },
    {
      id: 'piece-2',
      title: 'Test Design',
      type: 'STATIC_DESIGN',
      platforms: ['facebook'],
      scheduledAt: new Date('2026-01-20'),
      bigIdea: null,
      clientId: 'client-1',
      projectId: null,
      pillarId: null,
      deletedAt: null,
    },
  ],
}

const mockPiece = {
  id: 'piece-1',
  companyId: 'company-1',
  title: 'Test Reel',
  type: 'REEL',
  stage: 'APPROVED',
  bigIdea: 'Big idea',
  clientId: 'client-1',
  projectId: 'project-1',
  platforms: ['instagram'],
  scheduledAt: new Date('2026-01-15'),
  client: { name: 'Test Client' },
  plan: { title: 'January 2026' },
  deletedAt: null,
}

describe('IntegrationService', () => {
  let service: IntegrationService
  let prisma: ReturnType<typeof mockPrisma>
  let notificationService: ReturnType<typeof mockNotificationService>

  beforeEach(async () => {
    prisma = mockPrisma()
    notificationService = mockNotificationService()
    const module = await Test.createTestingModule({
      providers: [
        IntegrationService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile()

    service = module.get<IntegrationService>(IntegrationService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('onPlanActivated', () => {
    it('skips when plan not found', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue(null)

      await service.onPlanActivated('company-1', 'plan-1', 'user-1')

      expect(prisma.tenant.task.create).not.toHaveBeenCalled()
      expect(notificationService.create).not.toHaveBeenCalled()
    })

    it('creates multiple tasks per piece based on type', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue(mockPlan)
      prisma.tenant.task.create.mockResolvedValue({ id: 'task-1' })

      await service.onPlanActivated('company-1', 'plan-1', 'user-1')

      expect(prisma.tenant.task.create).toHaveBeenCalledTimes(6)
      expect(prisma.tenant.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: expect.stringContaining('[REEL] Test Reel'),
            priority: 'HIGH',
          }),
        }),
      )
      expect(prisma.tenant.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: expect.stringContaining('[STATIC_DESIGN] Test Design'),
            priority: 'MEDIUM',
          }),
        }),
      )
    })

    it('sends summary notification when tasks created', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue(mockPlan)
      prisma.tenant.task.create.mockResolvedValue({ id: 'task-1' })

      await service.onPlanActivated('company-1', 'plan-1', 'user-1')

      expect(notificationService.create).toHaveBeenCalledWith('company-1', {
        userId: 'user-1',
        type: 'TASK_ASSIGNED',
        title: expect.stringContaining('6 tasks created'),
        body: expect.stringContaining('Test Client'),
        data: expect.objectContaining({ planId: 'plan-1', taskCount: 6 }),
      })
    })

    it('handles task creation errors gracefully', async () => {
      prisma.tenant.contentPlan.findFirst.mockResolvedValue(mockPlan)
      prisma.tenant.task.create.mockRejectedValueOnce(new Error('DB error'))
      prisma.tenant.task.create.mockResolvedValue({ id: 'task-2' })

      await expect(service.onPlanActivated('company-1', 'plan-1', 'user-1')).resolves.not.toThrow()
    })
  })

  describe('onPieceApproved', () => {
    it('creates asset for approved piece', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.asset.create.mockResolvedValue({ id: 'asset-1' })

      await service.onPieceApproved('company-1', 'piece-1', 'user-1')

      expect(prisma.tenant.asset.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: 'company-1',
          name: 'Test Reel (REEL)',
          type: 'VIDEO',
          tags: ['REEL', 'approved', 'auto-created'],
          linkedClientIds: ['client-1'],
          linkedProjectIds: ['project-1'],
          createdBy: 'user-1',
        }),
      })
    })

    it('skips when piece not found', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(null)

      await service.onPieceApproved('company-1', 'piece-1', 'user-1')

      expect(prisma.tenant.asset.create).not.toHaveBeenCalled()
    })
  })

  describe('onPieceScheduled', () => {
    it('notifies account managers when piece is scheduled', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.userRole.findMany.mockResolvedValue([
        { userId: 'am-user-1' },
        { userId: 'am-user-2' },
      ])

      await service.onPieceScheduled('company-1', 'piece-1', 'user-1')

      expect(notificationService.create).toHaveBeenCalledTimes(2)
      expect(notificationService.create).toHaveBeenCalledWith(
        'company-1',
        expect.objectContaining({
          userId: 'am-user-1',
          type: 'GENERAL',
          title: expect.stringContaining('Test Reel'),
        }),
      )
      expect(notificationService.create).toHaveBeenCalledWith(
        'company-1',
        expect.objectContaining({
          userId: 'am-user-2',
          type: 'GENERAL',
          title: expect.stringContaining('Test Reel'),
        }),
      )
    })

    it('skips when piece not found', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(null)

      await service.onPieceScheduled('company-1', 'piece-1', 'user-1')

      expect(prisma.tenant.userRole.findMany).not.toHaveBeenCalled()
      expect(notificationService.create).not.toHaveBeenCalled()
    })

    it('deduplicates account manager user IDs', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(mockPiece)
      prisma.tenant.userRole.findMany.mockResolvedValue([
        { userId: 'am-user-1' },
        { userId: 'am-user-1' },
      ])

      await service.onPieceScheduled('company-1', 'piece-1', 'user-1')

      expect(notificationService.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('getCalendar', () => {
    it('returns pieces grouped by day', async () => {
      const mockPieces = [
        { ...mockPiece, scheduledAt: new Date('2026-01-15'), stage: 'SCHEDULED' },
        { ...mockPiece, id: 'piece-2', scheduledAt: new Date('2026-01-15'), stage: 'SCHEDULED' },
        { ...mockPiece, id: 'piece-3', scheduledAt: new Date('2026-01-20'), stage: 'APPROVED' },
      ]
      prisma.tenant.contentPiece.findMany.mockResolvedValue(mockPieces)

      const result = await service.getCalendar('company-1', 1, 2026)

      expect(result.month).toBe(1)
      expect(result.year).toBe(2026)
      expect(result.totalPieces).toBe(3)
      expect(result.days[15]).toHaveLength(2)
      expect(result.days[20]).toHaveLength(1)
    })
  })

  describe('getEquipmentSuggestions', () => {
    it('returns suggestions for known content type', async () => {
      const result = await service.getEquipmentSuggestions('VIDEO_LONG')

      expect(result.suggested).toBe(true)
      expect(result.contentType).toBe('VIDEO_LONG')
      expect(result.items.length).toBeGreaterThan(0)
    })

    it('returns empty for unknown content type', async () => {
      const result = await service.getEquipmentSuggestions('UNKNOWN_TYPE')

      expect(result.suggested).toBe(false)
      expect(result.items).toHaveLength(0)
    })
  })

  describe('getPieceEquipmentSuggestions', () => {
    it('returns suggestions based on piece type', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue({
        id: 'piece-1',
        type: 'REEL',
        title: 'Test Reel',
      })

      const result = await service.getPieceEquipmentSuggestions('company-1', 'piece-1')

      expect(result.found).toBe(true)
      expect(result.suggested).toBe(true)
      expect(result.items!.length).toBeGreaterThan(0)
    })

    it('returns not found when piece missing', async () => {
      prisma.tenant.contentPiece.findFirst.mockResolvedValue(null)

      const result = await service.getPieceEquipmentSuggestions('company-1', 'piece-1')

      expect(result.found).toBe(false)
    })
  })
})
