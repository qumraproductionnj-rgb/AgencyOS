import { Test, type TestingModule } from '@nestjs/testing'
import { EquipmentService } from './equipment.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  const mockQuery = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  }
  return {
    tenant: {
      equipment: { ...mockQuery },
      equipmentBooking: { ...mockQuery },
      equipmentMaintenance: { ...mockQuery },
    },
  }
}

describe('EquipmentService', () => {
  let service: EquipmentService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()
    const module: TestingModule = await Test.createTestingModule({
      providers: [EquipmentService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get<EquipmentService>(EquipmentService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return paginated equipment', async () => {
      prisma.tenant.equipment.findMany.mockResolvedValue([{ id: 'eq-1', name: 'Camera' }])
      const result = await service.findAll('company-1', {})
      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.name).toBe('Camera')
    })

    it('should filter by category and status', async () => {
      prisma.tenant.equipment.findMany.mockResolvedValue([])
      await service.findAll('company-1', { category: 'CAMERA', status: 'AVAILABLE' })
      expect(prisma.tenant.equipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'CAMERA', currentStatus: 'AVAILABLE' }),
        }),
      )
    })

    it('should search by name/brand/model', async () => {
      prisma.tenant.equipment.findMany.mockResolvedValue([])
      await service.findAll('company-1', { search: 'sony' })
      const callArg = prisma.tenant.equipment.findMany.mock.calls[0]![0]!
      expect(callArg.where.OR).toBeDefined()
      expect(callArg.where.OR).toHaveLength(4)
    })
  })

  describe('findOne', () => {
    it('should return equipment with relations', async () => {
      prisma.tenant.equipment.findFirst.mockResolvedValue({ id: 'eq-1', name: 'Camera' })
      const result = await service.findOne('company-1', 'eq-1')
      expect(result.id).toBe('eq-1')
    })

    it('should throw if not found', async () => {
      prisma.tenant.equipment.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'bad-id')).rejects.toThrow('Equipment not found')
    })
  })

  describe('create', () => {
    it('should create equipment and generate QR code', async () => {
      prisma.tenant.equipment.create.mockResolvedValue({ id: 'eq-1', name: 'Camera' })
      prisma.tenant.equipment.findFirst.mockResolvedValue({
        id: 'eq-1',
        name: 'Camera',
        bookings: [],
        maintenance: [],
      })
      prisma.tenant.equipment.update.mockResolvedValue({
        id: 'eq-1',
        qrCodeUrl: 'data:image/png;base64,...',
      })

      const result = await service.create('company-1', 'user-1', {
        name: 'Sony A7III',
        category: 'CAMERA',
      })
      expect(result).toBeDefined()
      expect(prisma.tenant.equipment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Sony A7III' }),
        }),
      )
    })
  })

  describe('bookings conflict detection', () => {
    it('should reject overlapping bookings', async () => {
      prisma.tenant.equipment.findFirst.mockResolvedValue({
        id: 'eq-1',
        name: 'Camera',
        currentStatus: 'AVAILABLE',
      })
      prisma.tenant.equipmentBooking.findMany.mockResolvedValue([{ id: 'existing-booking' }])

      await expect(
        service.createBooking('company-1', 'user-1', {
          equipmentId: 'eq-1',
          bookingStart: '2026-06-01T10:00:00Z',
          bookingEnd: '2026-06-03T18:00:00Z',
        }),
      ).rejects.toThrow('Equipment is already booked')
    })

    it('should allow non-overlapping bookings', async () => {
      prisma.tenant.equipment.findFirst.mockResolvedValue({
        id: 'eq-1',
        name: 'Camera',
        currentStatus: 'AVAILABLE',
      })
      prisma.tenant.equipmentBooking.findMany.mockResolvedValue([])
      prisma.tenant.equipmentBooking.create.mockResolvedValue({
        id: 'booking-1',
        equipmentId: 'eq-1',
      })

      const result = await service.createBooking('company-1', 'user-1', {
        equipmentId: 'eq-1',
        bookingStart: '2026-06-01T10:00:00Z',
        bookingEnd: '2026-06-03T18:00:00Z',
      })
      expect(result).toBeDefined()
    })

    it('should reject past start date', async () => {
      await expect(
        service.createBooking('company-1', 'user-1', {
          equipmentId: 'eq-1',
          bookingStart: '2020-01-01T10:00:00Z',
          bookingEnd: '2020-01-03T18:00:00Z',
        }),
      ).rejects.toThrow('past')
    })
  })

  describe('suggestForContentType', () => {
    it('should return camera/audio/lighting for REEL', async () => {
      prisma.tenant.equipment.findMany.mockResolvedValue([{ id: 'eq-1', name: 'Sony Camera' }])
      const result = await service.suggestForContentType('company-1', 'REEL')
      expect(result).toHaveLength(1)
      expect(prisma.tenant.equipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { in: ['CAMERA', 'LENS', 'LIGHTING', 'AUDIO'] },
          }),
        }),
      )
    })
  })
})
