import { Test, type TestingModule } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { ExhibitionService } from './exhibition.service'
import { PrismaService } from '../database/prisma.service'

describe('ExhibitionService', () => {
  let service: ExhibitionService
  let prisma: PrismaService

  const companyId = 'company-1'
  const userId = 'user-1'
  const exhibitionId = 'exhibition-1'
  const now = new Date()
  const future = new Date(now.getTime() + 86400000)
  const later = new Date(now.getTime() + 172800000)

  const mockExhibition = (overrides: Record<string, unknown> = {}) => ({
    id: exhibitionId,
    companyId,
    name: 'Najaf Industries Expo',
    locationAddress: 'Najaf City Center',
    city: 'Najaf',
    country: 'Iraq',
    startDate: future,
    endDate: later,
    organizingClientId: null,
    managerId: null,
    status: 'PLANNING',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    createdBy: userId,
    updatedBy: null,
    manager: null,
    booths: [],
    financials: [],
    settlement: null,
    _count: { booths: 0, financials: 0 },
    ...overrides,
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExhibitionService,
        {
          provide: PrismaService,
          useValue: {
            tenant: {
              exhibition: {
                findMany: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
              },
              exhibitionBooth: {
                findMany: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
              },
              boothInventory: {
                findMany: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
              },
              exhibitionFinancial: {
                findMany: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
              },
              exhibitionSettlement: {
                create: jest.fn(),
                findFirst: jest.fn(),
              },
            },
          },
        },
      ],
    }).compile()

    service = module.get<ExhibitionService>(ExhibitionService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return paginated exhibitions', async () => {
      const items = [mockExhibition()]
      jest.spyOn(prisma.tenant.exhibition, 'findMany').mockResolvedValue(items as never)

      const result = await service.findAll(companyId, { limit: 50 })
      expect(result.items).toHaveLength(1)
      expect(result.nextCursor).toBeNull()
    })

    it('should filter by status', async () => {
      jest.spyOn(prisma.tenant.exhibition, 'findMany').mockResolvedValue([] as never)
      await service.findAll(companyId, { status: 'ACTIVE' })
      expect(prisma.tenant.exhibition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      )
    })
  })

  describe('findOne', () => {
    it('should return exhibition if found', async () => {
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(mockExhibition() as never)
      const result = await service.findOne(companyId, exhibitionId)
      expect(result.id).toBe(exhibitionId)
    })

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(null)
      await expect(service.findOne(companyId, 'nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create an exhibition', async () => {
      jest.spyOn(prisma.tenant.exhibition, 'create').mockResolvedValue(mockExhibition() as never)
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(mockExhibition() as never)

      const result = await service.create(companyId, userId, {
        name: 'Najaf Industries Expo',
        startDate: future.toISOString(),
        endDate: later.toISOString(),
      })
      expect(result.id).toBe(exhibitionId)
    })

    it('should reject start date after end date', async () => {
      await expect(
        service.create(companyId, userId, {
          name: 'Bad Expo',
          startDate: later.toISOString(),
          endDate: future.toISOString(),
        }),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('updateStatus', () => {
    it('should transition from PLANNING to ACTIVE', async () => {
      const exhibition = mockExhibition({ status: 'PLANNING' })
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(exhibition as never)
      jest
        .spyOn(prisma.tenant.exhibition, 'update')
        .mockResolvedValue({ ...exhibition, status: 'ACTIVE' } as never)

      const result = await service.updateStatus(companyId, exhibitionId, userId, 'ACTIVE')
      expect(result).toBeDefined()
    })

    it('should reject invalid transition', async () => {
      jest
        .spyOn(prisma.tenant.exhibition, 'findFirst')
        .mockResolvedValue(mockExhibition({ status: 'PLANNING' }) as never)
      await expect(
        service.updateStatus(companyId, exhibitionId, userId, 'SETTLED'),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('remove', () => {
    it('should soft-delete exhibition', async () => {
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(mockExhibition() as never)
      jest.spyOn(prisma.tenant.exhibition, 'update').mockResolvedValue({} as never)

      await service.remove(companyId, exhibitionId)
      expect(prisma.tenant.exhibition.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
      )
    })
  })

  describe('booths', () => {
    it('should create a booth', async () => {
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(mockExhibition() as never)
      jest.spyOn(prisma.tenant.exhibitionBooth, 'create').mockResolvedValue({
        id: 'booth-1',
        companyId,
        exhibitionId,
        brandName: 'Brand A',
        boothNumber: 'A1',
        brandLogoUrl: null,
        boothSize: null,
        clientCompanyId: null,
        designStatus: 'pending',
        setupStatus: 'pending',
        dailyVisitorsCount: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        createdBy: userId,
        updatedBy: null,
      } as never)

      const result = await service.createBooth(companyId, userId, exhibitionId, {
        brandName: 'Brand A',
        boothNumber: 'A1',
      })
      expect(result.brandName).toBe('Brand A')
    })

    it('should list booths for an exhibition', async () => {
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(mockExhibition() as never)
      jest.spyOn(prisma.tenant.exhibitionBooth, 'findMany').mockResolvedValue([] as never)

      const result = await service.findBooths(companyId, exhibitionId)
      expect(result).toEqual([])
    })
  })

  describe('inventory', () => {
    it('should create inventory item', async () => {
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(mockExhibition() as never)
      jest
        .spyOn(prisma.tenant.exhibitionBooth, 'findMany')
        .mockResolvedValue([{ id: 'booth-1' }] as never)
      jest.spyOn(prisma.tenant.boothInventory, 'create').mockResolvedValue({
        id: 'inv-1',
        companyId,
        boothId: 'booth-1',
        itemName: 'Banner',
        category: 'SIGNAGE',
        quantitySent: 10,
        quantityConsumed: 8,
        quantityReturned: 2,
        quantityDamaged: 0,
        unitCost: null,
        currency: 'IQD',
        totalCost: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        createdBy: userId,
        updatedBy: null,
      } as never)

      const result = await service.createInventory(companyId, userId, exhibitionId, 'booth-1', {
        itemName: 'Banner',
        category: 'SIGNAGE',
        quantitySent: 10,
      })
      expect(result.itemName).toBe('Banner')
    })
  })

  describe('financials', () => {
    it('should create financial entry', async () => {
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(mockExhibition() as never)
      jest.spyOn(prisma.tenant.exhibitionFinancial, 'create').mockResolvedValue({
        id: 'fin-1',
        companyId,
        exhibitionId,
        type: 'INCOME',
        category: 'CLIENT_PAYMENT',
        description: 'Client payment',
        amount: BigInt(5000000),
        currency: 'IQD',
        transactionDate: now,
        receiptUrl: null,
        recordedBy: userId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        createdBy: userId,
        updatedBy: null,
      } as never)

      const result = await service.createFinancial(companyId, userId, exhibitionId, {
        type: 'INCOME',
        category: 'CLIENT_PAYMENT',
        amount: 5000000,
        transactionDate: now.toISOString(),
      })
      expect(result.amount).toBe(BigInt(5000000))
    })
  })

  describe('settlement', () => {
    it('should create settlement for CONCLUDED exhibition', async () => {
      const exhibition = mockExhibition({
        status: 'CONCLUDED',
        financials: [
          { type: 'INCOME', amount: BigInt(10000000), currency: 'IQD', category: 'CLIENT_PAYMENT' },
          { type: 'EXPENSE', amount: BigInt(3000000), currency: 'IQD', category: 'VENUE_RENTAL' },
        ],
      })
      jest.spyOn(prisma.tenant.exhibition, 'findFirst').mockResolvedValue(exhibition as never)
      jest.spyOn(prisma.tenant.exhibitionSettlement, 'create').mockResolvedValue({
        id: 'settlement-1',
        companyId,
        exhibitionId,
        totalIncomeIqd: BigInt(10000000),
        totalIncomeUsd: BigInt(0),
        totalExpenseIqd: BigInt(3000000),
        totalExpenseUsd: BigInt(0),
        netProfitIqd: BigInt(7000000),
        netProfitUsd: BigInt(0),
        clientOutstanding: null,
        settledAt: now,
        settledBy: userId,
        settlementDocumentUrl: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        createdBy: userId,
        updatedBy: null,
      } as never)
      jest.spyOn(prisma.tenant.exhibition, 'update').mockResolvedValue(exhibition as never)

      const result = await service.createSettlement(companyId, userId, exhibitionId)
      expect(result).toBeDefined()
    })

    it('should reject settlement before CONCLUDED', async () => {
      jest
        .spyOn(prisma.tenant.exhibition, 'findFirst')
        .mockResolvedValue(mockExhibition({ status: 'PLANNING' }) as never)
      await expect(service.createSettlement(companyId, userId, exhibitionId)).rejects.toThrow(
        ConflictException,
      )
    })
  })
})
