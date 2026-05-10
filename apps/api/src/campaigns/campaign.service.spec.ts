import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { CampaignService } from './campaign.service'

function mockPrisma() {
  return {
    tenant: {
      campaign: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  }
}

const mockCampaign = {
  id: 'camp-1',
  companyId: 'company-1',
  clientId: 'client-1',
  name: 'حملة ترويجية',
  nameEn: 'Promo Campaign',
  description: 'Campaign description',
  budget: 5000000,
  currency: 'IQD',
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-06-30'),
  status: 'PLANNING',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
  client: { id: 'client-1', name: 'Client', nameEn: null },
  _count: { projects: 0 },
  projects: [],
}

describe('CampaignService', () => {
  let service: CampaignService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()

    const module = await Test.createTestingModule({
      providers: [CampaignService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<CampaignService>(CampaignService)
  })

  describe('findAll', () => {
    it('should return campaigns list', async () => {
      prisma.tenant.campaign.findMany.mockResolvedValue([mockCampaign])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
      expect(prisma.tenant.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ companyId: 'company-1' }) }),
      )
    })
  })

  describe('findOne', () => {
    it('should return a campaign by id', async () => {
      prisma.tenant.campaign.findFirst.mockResolvedValue(mockCampaign)
      const result = await service.findOne('company-1', 'camp-1')
      expect(result.id).toBe('camp-1')
    })

    it('should throw NotFound for missing campaign', async () => {
      prisma.tenant.campaign.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'bad-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a campaign', async () => {
      prisma.tenant.campaign.create.mockResolvedValue(mockCampaign)

      const result = await service.create('company-1', 'user-1', {
        clientId: 'client-1',
        name: 'حملة ترويجية',
        nameEn: 'Promo Campaign',
        description: 'Campaign description',
        budget: 5000000,
        currency: 'IQD',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      })

      expect(result.name).toBe('حملة ترويجية')
    })
  })

  describe('updateStatus', () => {
    it('should transition PLANNING → ACTIVE', async () => {
      prisma.tenant.campaign.findFirst.mockResolvedValue(mockCampaign)
      prisma.tenant.campaign.update.mockResolvedValue({ ...mockCampaign, status: 'ACTIVE' })

      const result = await service.updateStatus('company-1', 'camp-1', 'user-1', 'ACTIVE')
      expect(result).toBeDefined()
    })

    it('should reject backward transition ACTIVE → PLANNING', async () => {
      prisma.tenant.campaign.findFirst.mockResolvedValue({ ...mockCampaign, status: 'ACTIVE' })
      await expect(
        service.updateStatus('company-1', 'camp-1', 'user-1', 'PLANNING'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should reject transition from COMPLETED', async () => {
      prisma.tenant.campaign.findFirst.mockResolvedValue({ ...mockCampaign, status: 'COMPLETED' })
      await expect(service.updateStatus('company-1', 'camp-1', 'user-1', 'ACTIVE')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('remove', () => {
    it('should soft delete a campaign', async () => {
      prisma.tenant.campaign.findFirst.mockResolvedValue(mockCampaign)
      prisma.tenant.campaign.update.mockResolvedValue({ ...mockCampaign, deletedAt: new Date() })
      await service.remove('company-1', 'camp-1', 'user-1')
      expect(prisma.tenant.campaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'camp-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })
  })
})
