import { Test, type TestingModule } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { EmployeeService } from './employee.service'
import { PrismaService } from '../database/prisma.service'
import { PasswordService } from '../auth/services/password.service'
import { EmailService } from '../auth/services/email.service'
import { RedisService } from '../redis/redis.service'

describe('EmployeeService', () => {
  let service: EmployeeService
  const system = { user: {} as Record<string, jest.Mock>, company: {} as Record<string, jest.Mock> }
  const tenant = { employee: {} as Record<string, jest.Mock> }
  const redis = {} as Record<string, jest.Mock>

  const mockEmp = {
    id: 'emp-1',
    companyId: 'company-1',
    userId: 'user-1',
    employeeCode: 'EMP-00001',
    fullNameAr: 'أحمد',
    email: 'ahmed@test.com',
    department: null,
    status: 'ACTIVE',
    startDate: new Date('2025-01-01'),
    createdAt: new Date(),
    deletedAt: null,
  }

  const createDto = {
    fullNameAr: 'أحمد',
    email: 'ahmed@test.com',
    startDate: '2025-01-01',
    employmentType: 'FULL_TIME' as const,
    salaryAmount: 0,
    salaryCurrency: 'IQD',
    salaryType: 'MONTHLY' as const,
    scheduledStartTime: '09:00',
    scheduledEndTime: '17:00',
    weeklyOffDays: ['Friday', 'Saturday'],
  }

  beforeEach(async () => {
    system.user = {
      create: jest.fn().mockResolvedValue({ id: 'user-1' }),
      update: jest.fn().mockResolvedValue({}),
    }
    system.company = { findUnique: jest.fn().mockResolvedValue({ name: 'Test Co' }) }
    tenant.employee = {
      findFirst: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(mockEmp),
      findMany: jest.fn().mockResolvedValue([mockEmp]),
      update: jest.fn().mockResolvedValue(mockEmp),
    }
    redis['set'] = jest.fn().mockResolvedValue('OK')
    redis['get'] = jest.fn()
    redis['del'] = jest.fn()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: { system, tenant } },
        { provide: PasswordService, useValue: { hash: jest.fn().mockResolvedValue('$hash') } },
        { provide: EmailService, useValue: { send: jest.fn().mockResolvedValue(undefined) } },
        { provide: RedisService, useValue: redis },
      ],
    }).compile()

    service = module.get<EmployeeService>(EmployeeService)
  })

  it('findAll returns employees', async () => {
    const result = await service.findAll('company-1')
    expect(result).toHaveLength(1)
  })

  it('findOne returns employee or throws', async () => {
    tenant.employee['findFirst']!.mockResolvedValue(mockEmp)
    const result = await service.findOne('company-1', 'emp-1')
    expect(result).toEqual(mockEmp)

    tenant.employee['findFirst']!.mockResolvedValue(null)
    await expect(service.findOne('company-1', 'missing')).rejects.toThrow(NotFoundException)
  })

  it('create creates employee + user + sends invite', async () => {
    const result = await service.create('company-1', createDto, 'user-admin')
    expect(result).toEqual(mockEmp)
    expect(system.user['create']!).toHaveBeenCalled()
    expect(tenant.employee['create']!).toHaveBeenCalled()
    expect(redis['set']!).toHaveBeenCalled()
    expect(redis['set']!).toHaveBeenCalledWith(
      expect.stringContaining('invite:'),
      'user-1',
      expect.any(Number),
    )
  })

  it('create throws ConflictException for duplicate email', async () => {
    tenant.employee['findFirst']!.mockResolvedValue(mockEmp)
    await expect(service.create('company-1', createDto, 'user-admin')).rejects.toThrow(
      ConflictException,
    )
  })

  it('remove soft-deletes employee', async () => {
    tenant.employee['findFirst']!.mockResolvedValue(mockEmp)
    await service.remove('company-1', 'emp-1', 'user-admin')
    expect(tenant.employee['update']!).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'emp-1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date), updatedBy: 'user-admin' }),
      }),
    )
  })

  it('acceptInvite validates token and sets password', async () => {
    redis['get']!.mockResolvedValue('user-1')
    await service.acceptInvite('valid-token', 'new-password')
    expect(redis['del']).toHaveBeenCalledWith('invite:valid-token')
    expect(system.user['update']!).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({ passwordHash: '$hash', emailVerifiedAt: expect.any(Date) }),
    })
  })

  it('acceptInvite throws on invalid token', async () => {
    redis['get']!.mockResolvedValue(null)
    await expect(service.acceptInvite('bad-token', 'pwd')).rejects.toThrow(NotFoundException)
  })
})
