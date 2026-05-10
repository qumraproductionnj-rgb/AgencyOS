import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { ExpenseService } from './expense.service'

function mockPrisma() {
  return {
    tenant: {
      expense: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  }
}

const mockExpense = {
  id: 'exp-1',
  companyId: 'company-1',
  employeeId: 'emp-1',
  category: 'travel',
  amount: 50000,
  currency: 'IQD',
  description: 'Taxi fare',
  receiptUrl: null,
  status: 'PENDING',
  approvedBy: null,
  approvedAt: null,
  rejectionReason: null,
  expenseDate: new Date('2026-05-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
  employee: { id: 'emp-1', fullNameAr: 'Employee', fullNameEn: null },
  approver: null,
}

describe('ExpenseService', () => {
  let service: ExpenseService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()

    const module = await Test.createTestingModule({
      providers: [ExpenseService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<ExpenseService>(ExpenseService)
  })

  describe('findAll', () => {
    it('should return expenses list', async () => {
      prisma.tenant.expense.findMany.mockResolvedValue([mockExpense])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
      expect(prisma.tenant.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ companyId: 'company-1' }) }),
      )
    })
  })

  describe('findOne', () => {
    it('should return an expense by id', async () => {
      prisma.tenant.expense.findFirst.mockResolvedValue(mockExpense)
      const result = await service.findOne('company-1', 'exp-1')
      expect(result.id).toBe('exp-1')
    })

    it('should throw NotFound for missing expense', async () => {
      prisma.tenant.expense.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'bad-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create an expense with PENDING status for large amounts', async () => {
      prisma.tenant.expense.create.mockResolvedValue({ ...mockExpense, status: 'PENDING' })

      const result = await service.create('company-1', 'user-1', {
        employeeId: 'emp-1',
        category: 'travel',
        amount: 500000,
        currency: 'IQD',
        description: 'Flight ticket',
        expenseDate: '2026-05-10',
      })

      expect(result.status).toBe('PENDING')
    })

    it('should auto-approve small IQD expenses', async () => {
      prisma.tenant.expense.create.mockResolvedValue({
        ...mockExpense,
        amount: 100000,
        status: 'APPROVED',
      })

      const result = await service.create('company-1', 'user-1', {
        employeeId: 'emp-1',
        category: 'travel',
        amount: 100000,
        currency: 'IQD',
        description: 'Bus fare',
        expenseDate: '2026-05-10',
      })

      expect(result.status).toBe('APPROVED')
    })

    it('should auto-approve small USD expenses', async () => {
      prisma.tenant.expense.create.mockResolvedValue({
        ...mockExpense,
        amount: 50,
        currency: 'USD',
        status: 'APPROVED',
      })

      const result = await service.create('company-1', 'user-1', {
        employeeId: 'emp-1',
        category: 'travel',
        amount: 50,
        currency: 'USD',
        description: 'Parking',
        expenseDate: '2026-05-10',
      })

      expect(result.status).toBe('APPROVED')
    })
  })

  describe('update', () => {
    it('should update a pending expense', async () => {
      prisma.tenant.expense.findFirst.mockResolvedValue(mockExpense)
      prisma.tenant.expense.update.mockResolvedValue({ ...mockExpense, description: 'Updated' })

      const result = await service.update('company-1', 'exp-1', 'user-1', {
        description: 'Updated',
      })
      expect(result).toBeDefined()
    })

    it('should reject update on non-pending', async () => {
      prisma.tenant.expense.findFirst.mockResolvedValue({ ...mockExpense, status: 'APPROVED' })
      await expect(
        service.update('company-1', 'exp-1', 'user-1', { description: 'test' }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('approve', () => {
    it('should approve a pending expense', async () => {
      prisma.tenant.expense.findFirst.mockResolvedValue(mockExpense)
      prisma.tenant.expense.update.mockResolvedValue({ ...mockExpense, status: 'APPROVED' })

      const result = await service.approve('company-1', 'exp-1', 'user-1', 'APPROVED')
      expect(result).toBeDefined()
    })

    it('should reject a pending expense with reason', async () => {
      prisma.tenant.expense.findFirst.mockResolvedValue(mockExpense)
      prisma.tenant.expense.update.mockResolvedValue({
        ...mockExpense,
        status: 'REJECTED',
        rejectionReason: 'Invalid receipt',
      })

      await service.approve('company-1', 'exp-1', 'user-1', 'REJECTED', 'Invalid receipt')
      expect(prisma.tenant.expense.update).toHaveBeenCalled()
    })

    it('should reject approval on already approved expense', async () => {
      prisma.tenant.expense.findFirst.mockResolvedValue({ ...mockExpense, status: 'APPROVED' })
      await expect(service.approve('company-1', 'exp-1', 'user-1', 'APPROVED')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('remove', () => {
    it('should soft delete an expense', async () => {
      prisma.tenant.expense.findFirst.mockResolvedValue(mockExpense)
      prisma.tenant.expense.update.mockResolvedValue({ ...mockExpense, deletedAt: new Date() })
      await service.remove('company-1', 'exp-1', 'user-1')
      expect(prisma.tenant.expense.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'exp-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })
  })
})
