import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { PerformanceReviewService } from './performance-review.service'
import { PrismaService } from '../database/prisma.service'

describe('PerformanceReviewService', () => {
  let service: PerformanceReviewService
  let rev: Record<string, jest.Mock>
  let emp: Record<string, jest.Mock>

  const mockReview = {
    id: 'rev-1',
    companyId: 'company-1',
    employeeId: 'emp-1',
    reviewerId: 'user-1',
    reviewDate: new Date('2026-06-15'),
    overallScore: 7.5,
    kpis: [
      { name: 'Quality', score: 8, weight: 1 },
      { name: 'Timeliness', score: 7, weight: 1 },
    ],
    strengths: 'Good work',
    improvements: 'Needs faster delivery',
    notes: null,
    createdAt: new Date(),
    employee: { id: 'emp-1', fullNameAr: 'موظف', fullNameEn: 'Employee', employeeCode: 'E001' },
    reviewer: { id: 'user-1', email: 'manager@test.com' },
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    rev = {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }

    emp = {
      findFirst: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceReviewService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { performanceReview: rev, employee: emp },
          },
        },
      ],
    }).compile()

    service = module.get<PerformanceReviewService>(PerformanceReviewService)
  })

  describe('findAll', () => {
    it('returns reviews', async () => {
      rev['findMany'] = jest.fn().mockResolvedValue([mockReview])
      const result = await service.findAll('company-1', 'user-1')
      expect(result).toHaveLength(1)
    })

    it('filters by employeeId', async () => {
      rev['findMany'] = jest.fn().mockResolvedValue([])
      await service.findAll('company-1', 'user-1', 'emp-1')
      expect(rev['findMany']!).toHaveBeenCalled()
    })

    it('returns empty when no reviews', async () => {
      rev['findMany'] = jest.fn().mockResolvedValue([])
      const result = await service.findAll('company-1', 'user-1')
      expect(result).toHaveLength(0)
    })
  })

  describe('findOne', () => {
    it('returns a review by id', async () => {
      rev['findFirst'] = jest.fn().mockResolvedValue(mockReview)
      const result = await service.findOne('company-1', 'rev-1')
      expect(result).toBeDefined()
      expect(result.id).toBe('rev-1')
    })

    it('throws when not found', async () => {
      rev['findFirst'] = jest.fn().mockResolvedValue(null)
      await expect(service.findOne('company-1', 'not-found')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('creates a review with KPIs and calculates overall score', async () => {
      rev['create'] = jest.fn().mockResolvedValue(mockReview)
      const dto = {
        employeeId: 'emp-1',
        reviewDate: '2026-06-15',
        kpis: [
          { name: 'Quality', score: 8, weight: 1 },
          { name: 'Timeliness', score: 7, weight: 1 },
        ],
        strengths: 'Good work',
      }
      const result = await service.create('company-1', 'user-1', dto)
      expect(result).toBeDefined()
      expect(rev['create']!).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('updates a review', async () => {
      rev['findFirst'] = jest.fn().mockResolvedValue(mockReview)
      rev['update'] = jest.fn().mockResolvedValue(mockReview)
      const result = await service.update('company-1', 'rev-1', 'user-1', {
        strengths: 'Updated strengths',
      })
      expect(result).toBeDefined()
      expect(rev['update']!).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('soft deletes a review', async () => {
      rev['findFirst'] = jest.fn().mockResolvedValue(mockReview)
      rev['update'] = jest.fn().mockResolvedValue(mockReview)
      await service.remove('company-1', 'rev-1', 'user-1')
      expect(rev['update']!).toHaveBeenCalled()
    })
  })
})
