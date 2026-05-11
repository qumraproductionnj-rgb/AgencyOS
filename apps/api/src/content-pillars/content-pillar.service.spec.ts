import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ContentPillarService } from './content-pillar.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      contentPillar: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  }
}

const mockPillar = {
  id: 'pillar-1',
  companyId: 'company-1',
  clientId: 'client-1',
  nameAr: 'تعليم',
  nameEn: 'Education',
  description: 'Educational content for audience',
  color: '#FF5733',
  icon: 'book',
  percentageTarget: 40,
  exampleTopics: ['How-to guides', 'Industry tips'],
  recommendedFormats: ['video', 'design'],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
}

describe('ContentPillarService', () => {
  let service: ContentPillarService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()

    const module = await Test.createTestingModule({
      providers: [ContentPillarService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<ContentPillarService>(ContentPillarService)
  })

  describe('findAll', () => {
    it('should return all pillars', async () => {
      prisma.tenant.contentPillar.findMany.mockResolvedValue([mockPillar])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
      expect(prisma.tenant.contentPillar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ companyId: 'company-1' }) }),
      )
    })

    it('should filter by clientId', async () => {
      prisma.tenant.contentPillar.findMany.mockResolvedValue([mockPillar])
      await service.findAll('company-1', { clientId: 'client-1' })
      expect(prisma.tenant.contentPillar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clientId: 'client-1' }),
        }),
      )
    })
  })

  describe('findOne', () => {
    it('should return a pillar by id', async () => {
      prisma.tenant.contentPillar.findFirst.mockResolvedValue({
        ...mockPillar,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
      })
      const result = await service.findOne('company-1', 'pillar-1')
      expect(result.nameAr).toBe('تعليم')
    })

    it('should throw if not found', async () => {
      prisma.tenant.contentPillar.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a pillar', async () => {
      prisma.tenant.contentPillar.create.mockResolvedValue({
        ...mockPillar,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
      })
      const result = await service.create('company-1', 'user-1', {
        clientId: 'client-1',
        nameAr: 'تعليم',
        nameEn: 'Education',
        color: '#FF5733',
        percentageTarget: 40,
        exampleTopics: ['How-to guides'],
      })
      expect(result.nameAr).toBe('تعليم')
      expect(result.percentageTarget).toBe(40)
    })
  })

  describe('update', () => {
    it('should update pillar fields', async () => {
      prisma.tenant.contentPillar.findFirst.mockResolvedValue({
        ...mockPillar,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
      })
      prisma.tenant.contentPillar.update.mockResolvedValue({
        ...mockPillar,
        percentageTarget: 50,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
      })
      const result = await service.update('company-1', 'pillar-1', 'user-1', {
        percentageTarget: 50,
      })
      expect(result.percentageTarget).toBe(50)
    })

    it('should throw if not found', async () => {
      prisma.tenant.contentPillar.findFirst.mockResolvedValue(null)
      await expect(
        service.update('company-1', 'nonexistent', 'user-1', { nameAr: 'X' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should soft delete a pillar', async () => {
      prisma.tenant.contentPillar.findFirst.mockResolvedValue({
        ...mockPillar,
        client: { id: 'client-1', name: 'عميل', nameEn: null },
      })
      prisma.tenant.contentPillar.update.mockResolvedValue({ ...mockPillar, deletedAt: new Date() })
      await service.remove('company-1', 'pillar-1', 'user-1')
      expect(prisma.tenant.contentPillar.update).toHaveBeenCalled()
    })
  })
})
