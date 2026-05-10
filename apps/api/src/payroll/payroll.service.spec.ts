import { Test, type TestingModule } from '@nestjs/testing'
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { PayrollService } from './payroll.service'
import { PrismaService } from '../database/prisma.service'

describe('PayrollService', () => {
  let service: PayrollService
  let run: Record<string, jest.Mock>
  let entry: Record<string, jest.Mock>
  let emp: Record<string, jest.Mock>
  let att: Record<string, jest.Mock>
  let lev: Record<string, jest.Mock>

  const mockRun = {
    id: 'run-1',
    companyId: 'company-1',
    month: 6,
    year: 2026,
    status: 'DRAFT',
    totalAmount: BigInt(1500000),
    currency: 'IQD',
    processedBy: null,
    processedAt: null,
    finalizedAt: null,
    createdAt: new Date(),
    entries: [
      {
        id: 'entry-1',
        employeeId: 'emp-1',
        baseSalary: BigInt(1000000),
        additions: BigInt(0),
        deductions: BigInt(50000),
        netAmount: BigInt(950000),
        attendanceDays: 20,
        lateDays: 0,
        absentDays: 1,
        notes: null,
        employee: { id: 'emp-1', fullNameAr: 'موظف', fullNameEn: 'Employee', employeeCode: 'E001' },
      },
    ],
  }

  const mockEmployee = {
    id: 'emp-1',
    companyId: 'company-1',
    salaryAmount: BigInt(1000000),
    salaryCurrency: 'IQD',
    salaryType: 'MONTHLY',
    weeklyOffDays: ['Friday', 'Saturday'],
    status: 'ACTIVE',
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    run = {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }

    entry = {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    }

    emp = {
      findMany: jest.fn(),
    }

    att = {
      findMany: jest.fn(),
    }

    lev = {
      findMany: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: PrismaService,
          useValue: {
            tenant: {
              payrollRun: run,
              payrollEntry: entry,
              employee: emp,
              attendanceRecord: att,
              leave: lev,
            },
          },
        },
      ],
    }).compile()

    service = module.get<PayrollService>(PayrollService)
  })

  describe('findAll', () => {
    it('returns payroll runs', async () => {
      run['findMany'] = jest.fn().mockResolvedValue([mockRun])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
    })

    it('filters by year', async () => {
      run['findMany'] = jest.fn().mockResolvedValue([])
      await service.findAll('company-1', { year: 2025 })
      expect(run['findMany']!).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('returns a payroll run with entries', async () => {
      run['findFirst'] = jest.fn().mockResolvedValue(mockRun)
      const result = await service.findOne('company-1', 'run-1')
      expect(result).toBeDefined()
      expect(result.id).toBe('run-1')
    })

    it('throws when not found', async () => {
      run['findFirst'] = jest.fn().mockResolvedValue(null)
      await expect(service.findOne('company-1', 'not-found')).rejects.toThrow(NotFoundException)
    })
  })

  describe('generate', () => {
    it('creates a draft payroll run', async () => {
      run['findUnique'] = jest.fn().mockResolvedValue(null)
      emp['findMany'] = jest.fn().mockResolvedValue([mockEmployee])
      att['findMany'] = jest.fn().mockResolvedValue([])
      lev['findMany'] = jest.fn().mockResolvedValue([])
      run['create'] = jest.fn().mockResolvedValue(mockRun)

      const result = await service.generate('company-1', 'user-1', 6, 2026)
      expect(result).toBeDefined()
      expect(run['create']!).toHaveBeenCalled()
    })

    it('rejects if draft already exists', async () => {
      run['findUnique'] = jest.fn().mockResolvedValue({ id: 'existing', status: 'DRAFT' })
      await expect(service.generate('company-1', 'user-1', 6, 2026)).rejects.toThrow(
        ConflictException,
      )
    })

    it('rejects if finalized already exists', async () => {
      run['findUnique'] = jest.fn().mockResolvedValue({ id: 'existing', status: 'FINALIZED' })
      await expect(service.generate('company-1', 'user-1', 6, 2026)).rejects.toThrow(
        ConflictException,
      )
    })

    it('throws if no active employees', async () => {
      run['findUnique'] = jest.fn().mockResolvedValue(null)
      emp['findMany'] = jest.fn().mockResolvedValue([])
      await expect(service.generate('company-1', 'user-1', 6, 2026)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('updateEntry', () => {
    it('updates additions and recalculates net', async () => {
      entry['findFirst'] = jest.fn().mockResolvedValue({
        id: 'entry-1',
        companyId: 'company-1',
        payrollRunId: 'run-1',
        baseSalary: BigInt(1000000),
        additions: BigInt(0),
        deductions: BigInt(0),
        netAmount: BigInt(1000000),
        payrollRun: { status: 'DRAFT' },
      })
      entry['update'] = jest.fn().mockResolvedValue({ id: 'entry-1' })
      entry['findMany'] = jest.fn().mockResolvedValue([{ netAmount: BigInt(1050000) }])
      run['update'] = jest.fn()

      await service.updateEntry('company-1', 'entry-1', 'user-1', { additions: 50000 })
      expect(entry['update']!).toHaveBeenCalled()
    })

    it('rejects if payroll is not draft', async () => {
      entry['findFirst'] = jest.fn().mockResolvedValue({
        id: 'entry-1',
        companyId: 'company-1',
        payrollRun: { status: 'FINALIZED' },
      })
      await expect(
        service.updateEntry('company-1', 'entry-1', 'user-1', { additions: 50000 }),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws if entry not found', async () => {
      entry['findFirst'] = jest.fn().mockResolvedValue(null)
      await expect(
        service.updateEntry('company-1', 'not-found', 'user-1', { additions: 50000 }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('finalize', () => {
    it('finalizes a draft run', async () => {
      run['findFirst'] = jest.fn().mockResolvedValue({ ...mockRun, status: 'DRAFT' })
      run['update'] = jest.fn().mockResolvedValue({ ...mockRun, status: 'FINALIZED' })
      const result = await service.finalize('company-1', 'run-1', 'user-1')
      expect(result.status).toBe('FINALIZED')
    })

    it('throws if run is not draft', async () => {
      run['findFirst'] = jest.fn().mockResolvedValue({ ...mockRun, status: 'FINALIZED' })
      await expect(service.finalize('company-1', 'run-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('markPaid', () => {
    it('marks a finalized run as paid', async () => {
      run['findFirst'] = jest.fn().mockResolvedValue({ ...mockRun, status: 'FINALIZED' })
      run['update'] = jest.fn().mockResolvedValue({ ...mockRun, status: 'PAID' })
      const result = await service.markPaid('company-1', 'run-1', 'user-1')
      expect(result.status).toBe('PAID')
    })

    it('throws if run is not finalized', async () => {
      run['findFirst'] = jest.fn().mockResolvedValue({ ...mockRun, status: 'DRAFT' })
      await expect(service.markPaid('company-1', 'run-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
