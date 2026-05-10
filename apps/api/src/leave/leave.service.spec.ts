import { Test, type TestingModule } from '@nestjs/testing'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { LeaveService } from './leave.service'
import { PrismaService } from '../database/prisma.service'

describe('LeaveService', () => {
  let service: LeaveService
  const emp: Record<string, jest.Mock> = {}
  const lev: Record<string, jest.Mock> = {}
  const bal: Record<string, jest.Mock> = {}

  const mockEmployee = {
    id: 'emp-1',
    fullNameAr: 'موظف',
    fullNameEn: 'Employee',
    employeeCode: 'E001',
  }
  const mockLeave = {
    id: 'leave-1',
    companyId: 'company-1',
    employeeId: 'emp-1',
    leaveType: 'ANNUAL',
    status: 'PENDING',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-05'),
    durationDays: 5,
    reason: 'Vacation',
    createdAt: new Date(),
    employee: mockEmployee,
  }

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks()

    emp['findFirst'] = jest.fn().mockResolvedValue(mockEmployee)

    lev['create'] = jest.fn().mockResolvedValue(mockLeave)
    lev['findFirst'] = jest.fn().mockResolvedValue(mockLeave)
    lev['findMany'] = jest.fn().mockResolvedValue([mockLeave])
    lev['update'] = jest.fn().mockImplementation((_args: unknown) => Promise.resolve(mockLeave))

    bal['findMany'] = jest.fn().mockResolvedValue([])
    bal['findUnique'] = jest.fn()
    bal['update'] = jest.fn()
    bal['createMany'] = jest.fn()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { employee: emp, leave: lev, leaveBalance: bal },
          },
        },
      ],
    }).compile()

    service = module.get<LeaveService>(LeaveService)
  })

  describe('create', () => {
    it('creates a leave successfully', async () => {
      const dto = {
        leaveType: 'ANNUAL' as const,
        startDate: '2026-06-01',
        endDate: '2026-06-05',
        reason: 'Vacation',
      }
      lev['findFirst'] = jest.fn().mockResolvedValue(null) // no overlap
      const result = await service.create('company-1', 'user-1', dto)
      expect(result).toBeDefined()
      expect(lev['create']!).toHaveBeenCalled()
    })

    it('throws when employee not found', async () => {
      emp['findFirst'] = jest.fn().mockResolvedValue(null)
      const dto = { leaveType: 'ANNUAL' as const, startDate: '2026-06-01', endDate: '2026-06-05' }
      await expect(service.create('company-1', 'user-1', dto)).rejects.toThrow(NotFoundException)
    })

    it('throws when end date before start date', async () => {
      const dto = { leaveType: 'ANNUAL' as const, startDate: '2026-06-10', endDate: '2026-06-05' }
      await expect(service.create('company-1', 'user-1', dto)).rejects.toThrow(BadRequestException)
    })

    it('throws on overlapping leave', async () => {
      lev['findFirst'] = jest.fn().mockResolvedValue(mockLeave) // overlap found
      const dto = { leaveType: 'ANNUAL' as const, startDate: '2026-06-02', endDate: '2026-06-08' }
      await expect(service.create('company-1', 'user-1', dto)).rejects.toThrow(ConflictException)
    })
  })

  describe('findAll', () => {
    it('returns all leaves for the company', async () => {
      const result = await service.findAll('company-1', 'user-1')
      expect(result).toHaveLength(1)
    })

    it('filters by view=my', async () => {
      await service.findAll('company-1', 'user-1', { view: 'my' })
      expect(lev['findMany']!).toHaveBeenCalled()
    })

    it('filters by status', async () => {
      await service.findAll('company-1', 'user-1', { status: 'APPROVED' })
      expect(lev['findMany']!).toHaveBeenCalled()
    })

    it('returns empty list when no leaves exist', async () => {
      lev['findMany'] = jest.fn().mockResolvedValue([])
      const result = await service.findAll('company-1', 'user-1')
      expect(result).toHaveLength(0)
    })
  })

  describe('findOne', () => {
    it('returns a leave by id', async () => {
      const result = await service.findOne('company-1', 'leave-1')
      expect(result).toBeDefined()
      expect(result.id).toBe('leave-1')
    })

    it('throws when leave not found', async () => {
      lev['findFirst'] = jest.fn().mockResolvedValue(null)
      await expect(service.findOne('company-1', 'not-found')).rejects.toThrow(NotFoundException)
    })
  })

  describe('approve', () => {
    it('approves a pending leave', async () => {
      lev['findFirst'] = jest
        .fn()
        .mockResolvedValue({ ...mockLeave, status: 'PENDING', durationDays: 3 })
      bal['findUnique'] = jest.fn().mockResolvedValue({ id: 'bal-1', usedDays: 5 })
      const result = await service.approve('company-1', 'leave-1', 'user-1', ['hr_manager'])
      expect(result).toBeDefined()
      expect(lev['update']!).toHaveBeenCalled()
    })

    it('throws when leave is not pending', async () => {
      lev['findFirst'] = jest.fn().mockResolvedValue({ ...mockLeave, status: 'APPROVED' })
      await expect(
        service.approve('company-1', 'leave-1', 'user-1', ['hr_manager']),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws when >5 days and user is not owner', async () => {
      lev['findFirst'] = jest
        .fn()
        .mockResolvedValue({ ...mockLeave, status: 'PENDING', durationDays: 7 })
      await expect(
        service.approve('company-1', 'leave-1', 'user-1', ['hr_manager']),
      ).rejects.toThrow(ForbiddenException)
    })

    it('allows owner to approve >5 days', async () => {
      lev['findFirst'] = jest
        .fn()
        .mockResolvedValue({ ...mockLeave, status: 'PENDING', durationDays: 10 })
      const result = await service.approve('company-1', 'leave-1', 'user-1', ['owner'])
      expect(result).toBeDefined()
      expect(lev['update']!).toHaveBeenCalled()
    })
  })

  describe('reject', () => {
    it('rejects a pending leave', async () => {
      lev['findFirst'] = jest.fn().mockResolvedValue({ ...mockLeave, status: 'PENDING' })
      const result = await service.reject('company-1', 'leave-1', 'user-1', {
        rejectionReason: 'Not enough balance',
      })
      expect(result).toBeDefined()
      expect(lev['update']!).toHaveBeenCalled()
    })

    it('throws when leave is not pending', async () => {
      lev['findFirst'] = jest.fn().mockResolvedValue({ ...mockLeave, status: 'APPROVED' })
      await expect(
        service.reject('company-1', 'leave-1', 'user-1', { rejectionReason: 'No' }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('cancel', () => {
    it('cancels a pending leave', async () => {
      lev['findFirst'] = jest.fn().mockResolvedValue({ ...mockLeave, status: 'PENDING' })
      const result = await service.cancel('company-1', 'leave-1', 'user-1')
      expect(result).toBeDefined()
      expect(lev['update']!).toHaveBeenCalled()
    })

    it('cancels an approved leave and subtracts balance', async () => {
      lev['findFirst'] = jest
        .fn()
        .mockResolvedValue({
          ...mockLeave,
          status: 'APPROVED',
          durationDays: 5,
          leaveType: 'ANNUAL',
        })
      bal['findUnique'] = jest.fn().mockResolvedValue({ id: 'bal-1', usedDays: 10 })
      const result = await service.cancel('company-1', 'leave-1', 'user-1')
      expect(result).toBeDefined()
      expect(bal['update']!).toHaveBeenCalled()
    })

    it('throws when leave is not pending or approved', async () => {
      lev['findFirst'] = jest.fn().mockResolvedValue({ ...mockLeave, status: 'REJECTED' })
      await expect(service.cancel('company-1', 'leave-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('getBalances', () => {
    it('returns existing balances', async () => {
      const mockBalances = [
        { id: 'bal-1', leaveType: 'ANNUAL', totalDays: 30, usedDays: 5, year: 2026 },
      ]
      bal['findMany'] = jest.fn().mockResolvedValue(mockBalances)
      const result = await service.getBalances('company-1', 'user-1')
      expect(result).toEqual(mockBalances)
    })

    it('seeds default balances when none exist', async () => {
      bal['findMany'] = jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { leaveType: 'ANNUAL', totalDays: 30, usedDays: 0, year: 2026 },
          { leaveType: 'SICK', totalDays: 15, usedDays: 0, year: 2026 },
        ])
      const result = await service.getBalances('company-1', 'user-1')
      expect(result).toHaveLength(2)
      expect(bal['createMany']!).toHaveBeenCalled()
    })

    it('throws when employee not found', async () => {
      emp['findFirst'] = jest.fn().mockResolvedValue(null)
      await expect(service.getBalances('company-1', 'user-1')).rejects.toThrow(NotFoundException)
    })
  })
})
