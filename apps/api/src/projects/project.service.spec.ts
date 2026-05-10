import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { ProjectService } from './project.service'

function mockPrisma() {
  return {
    tenant: {
      project: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      revision: {
        count: jest.fn(),
        create: jest.fn(),
      },
    },
  }
}

const mockProject = {
  id: 'proj-1',
  companyId: 'company-1',
  clientId: 'client-1',
  campaignId: null,
  name: 'إعلان تلفزيوني',
  nameEn: 'TV Commercial',
  description: 'Project description',
  stage: 'BRIEF',
  budget: 10000000,
  currency: 'IQD',
  startDate: new Date('2026-06-01'),
  deadline: new Date('2026-07-01'),
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
  client: { id: 'client-1', name: 'Client', nameEn: null },
  campaign: null,
  _count: { tasks: 0, revisions: 0 },
  tasks: [],
  revisions: [],
}

describe('ProjectService', () => {
  let service: ProjectService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()

    const module = await Test.createTestingModule({
      providers: [ProjectService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<ProjectService>(ProjectService)
  })

  describe('findAll', () => {
    it('should return projects list', async () => {
      prisma.tenant.project.findMany.mockResolvedValue([mockProject])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
      expect(prisma.tenant.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ companyId: 'company-1' }) }),
      )
    })
  })

  describe('findOne', () => {
    it('should return a project by id', async () => {
      prisma.tenant.project.findFirst.mockResolvedValue(mockProject)
      const result = await service.findOne('company-1', 'proj-1')
      expect(result.id).toBe('proj-1')
    })

    it('should throw NotFound for missing project', async () => {
      prisma.tenant.project.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'bad-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a project in BRIEF stage', async () => {
      prisma.tenant.project.create.mockResolvedValue(mockProject)

      const result = await service.create('company-1', 'user-1', {
        clientId: 'client-1',
        name: 'إعلان تلفزيوني',
        nameEn: 'TV Commercial',
        description: 'Project description',
        budget: 10000000,
        currency: 'IQD',
        startDate: '2026-06-01',
        deadline: '2026-07-01',
      })

      expect(result.stage).toBe('BRIEF')
    })
  })

  describe('updateStage', () => {
    it('should transition BRIEF → PLANNING', async () => {
      prisma.tenant.project.findFirst.mockResolvedValue(mockProject)
      prisma.tenant.project.update.mockResolvedValue({ ...mockProject, stage: 'PLANNING' })

      const result = await service.updateStage('company-1', 'proj-1', 'user-1', 'PLANNING')
      expect(result).toBeDefined()
    })

    it('should reject backward transition IN_PROGRESS → BRIEF', async () => {
      prisma.tenant.project.findFirst.mockResolvedValue({ ...mockProject, stage: 'IN_PROGRESS' })
      await expect(service.updateStage('company-1', 'proj-1', 'user-1', 'BRIEF')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should set completedAt when moving to COMPLETED', async () => {
      const reviewStage = { ...mockProject, stage: 'REVIEW' }
      prisma.tenant.project.findFirst.mockResolvedValue(reviewStage)
      prisma.tenant.project.update.mockResolvedValue({
        ...mockProject,
        stage: 'COMPLETED',
        completedAt: new Date(),
      })

      await service.updateStage('company-1', 'proj-1', 'user-1', 'COMPLETED')
      expect(prisma.tenant.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ completedAt: expect.any(Date) }),
        }),
      )
    })
  })

  describe('addRevision', () => {
    it('should add a revision when under limit', async () => {
      prisma.tenant.project.findFirst.mockResolvedValue(mockProject)
      prisma.tenant.revision.count.mockResolvedValue(0)
      prisma.tenant.revision.create.mockResolvedValue({
        id: 'rev-1',
        companyId: 'company-1',
        projectId: 'proj-1',
        taskId: null,
        revisionNumber: 1,
        requestedBy: 'user-1',
        notes: 'Please adjust colors',
        deliveredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: 'user-1',
        updatedBy: null,
      })

      const result = await service.addRevision(
        'company-1',
        'proj-1',
        'user-1',
        'Please adjust colors',
      )
      expect(result.revision.revisionNumber).toBe(1)
      expect(result.remaining).toBe(2)
    })

    it('should reject revision when limit reached', async () => {
      prisma.tenant.project.findFirst.mockResolvedValue(mockProject)
      prisma.tenant.revision.count.mockResolvedValue(3)

      await expect(service.addRevision('company-1', 'proj-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('remove', () => {
    it('should soft delete a project', async () => {
      prisma.tenant.project.findFirst.mockResolvedValue(mockProject)
      prisma.tenant.project.update.mockResolvedValue({ ...mockProject, deletedAt: new Date() })
      await service.remove('company-1', 'proj-1', 'user-1')
      expect(prisma.tenant.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })
  })
})
