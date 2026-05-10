import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ExchangeRateService } from './exchange-rate.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      exchangeRate: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
    system: {
      company: {
        findMany: jest.fn(),
      },
    },
  }
}

const mockRate = {
  id: 'rate-1',
  companyId: 'company-1',
  fromCurrency: 'USD',
  toCurrency: 'IQD',
  rate: 1308.5,
  isManual: true,
  validFrom: new Date('2026-05-01'),
  validTo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
}

describe('ExchangeRateService', () => {
  let service: ExchangeRateService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangeRateService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<ExchangeRateService>(ExchangeRateService)
  })

  describe('findAll', () => {
    it('should list all rates for a company', async () => {
      prisma.tenant.exchangeRate.findMany.mockResolvedValue([mockRate])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
      expect(prisma.tenant.exchangeRate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: 'company-1', deletedAt: null }),
        }),
      )
    })

    it('should filter by from currency', async () => {
      prisma.tenant.exchangeRate.findMany.mockResolvedValue([mockRate])
      await service.findAll('company-1', 'USD')
      expect(prisma.tenant.exchangeRate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ fromCurrency: 'USD' }),
        }),
      )
    })
  })

  describe('findCurrent', () => {
    it('should return the current active rate', async () => {
      prisma.tenant.exchangeRate.findFirst.mockResolvedValue(mockRate)
      const result = await service.findCurrent('company-1', 'USD', 'IQD')
      expect(result).toEqual(mockRate)
      expect(prisma.tenant.exchangeRate.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: 'company-1',
            fromCurrency: 'USD',
            toCurrency: 'IQD',
          }),
        }),
      )
    })

    it('should return null if no active rate', async () => {
      prisma.tenant.exchangeRate.findFirst.mockResolvedValue(null)
      const result = await service.findCurrent('company-1', 'USD', 'EUR')
      expect(result).toBeNull()
    })
  })

  describe('setManual', () => {
    it('should create a manual rate', async () => {
      prisma.tenant.exchangeRate.create.mockResolvedValue(mockRate)
      const result = await service.setManual('company-1', 'user-1', {
        fromCurrency: 'USD',
        toCurrency: 'IQD',
        rate: 1308.5,
      })
      expect(result).toEqual(mockRate)
      expect(prisma.tenant.exchangeRate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 'company-1',
            fromCurrency: 'USD',
            toCurrency: 'IQD',
            rate: 1308.5,
            isManual: true,
          }),
        }),
      )
    })
  })

  describe('update', () => {
    it('should update an existing rate', async () => {
      prisma.tenant.exchangeRate.findFirst.mockResolvedValue(mockRate)
      prisma.tenant.exchangeRate.update.mockResolvedValue({ ...mockRate, rate: 1310.0 })

      const result = await service.update('company-1', 'rate-1', 'user-1', { rate: 1310.0 })
      expect(result.rate).toBe(1310.0)
    })

    it('should throw if rate not found', async () => {
      prisma.tenant.exchangeRate.findFirst.mockResolvedValue(null)
      await expect(service.update('company-1', 'invalid', 'user-1', { rate: 100 })).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should soft delete a rate', async () => {
      prisma.tenant.exchangeRate.findFirst.mockResolvedValue(mockRate)
      prisma.tenant.exchangeRate.update.mockResolvedValue({ ...mockRate, deletedAt: new Date() })

      await service.remove('company-1', 'rate-1', 'user-1')
      expect(prisma.tenant.exchangeRate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rate-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })

    it('should throw if rate not found', async () => {
      prisma.tenant.exchangeRate.findFirst.mockResolvedValue(null)
      await expect(service.remove('company-1', 'invalid', 'user-1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
