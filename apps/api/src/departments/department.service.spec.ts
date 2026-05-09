import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { DepartmentService } from './department.service'
import { PrismaService } from '../database/prisma.service'

describe('DepartmentService', () => {
  let service: DepartmentService
  const tenant: Record<string, jest.Mock> = {}

  const mockDept = {
    id: 'dept-1',
    companyId: 'company-1',
    nameAr: 'قسم التصميم',
    nameEn: 'Design Dept',
    description: null,
    managerUserId: null,
    manager: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: 'user-1',
    updatedBy: null,
  }

  beforeEach(async () => {
    tenant['findMany'] = jest.fn().mockResolvedValue([mockDept])
    tenant['findFirst'] = jest.fn().mockResolvedValue(mockDept)
    tenant['create'] = jest.fn().mockResolvedValue(mockDept)
    tenant['update'] = jest.fn().mockResolvedValue(mockDept)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { department: tenant },
          },
        },
      ],
    }).compile()

    service = module.get<DepartmentService>(DepartmentService)
  })

  it('findAll returns departments', async () => {
    const result = await service.findAll('company-1')
    expect(result).toHaveLength(1)
    expect(tenant['findMany']).toHaveBeenCalledWith({
      where: { companyId: 'company-1', deletedAt: null },
      include: { manager: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })
  })

  it('findOne returns department or throws', async () => {
    const result = await service.findOne('company-1', 'dept-1')
    expect(result).toEqual(mockDept)

    tenant['findFirst']!.mockResolvedValue(null)
    await expect(service.findOne('company-1', 'missing')).rejects.toThrow(NotFoundException)
  })

  it('create creates department', async () => {
    const result = await service.create('company-1', { nameAr: 'New Dept' }, 'user-1')
    expect(result).toEqual(mockDept)
    expect(tenant['create']).toHaveBeenCalledWith({
      data: {
        companyId: 'company-1',
        nameAr: 'New Dept',
        nameEn: null,
        description: null,
        managerUserId: null,
        createdBy: 'user-1',
      },
    })
  })

  it('update updates department', async () => {
    await service.update('company-1', 'dept-1', { nameAr: 'Updated' }, 'user-1')
    expect(tenant['update']).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'dept-1' },
        data: expect.objectContaining({ nameAr: 'Updated', updatedBy: 'user-1' }),
      }),
    )
  })

  it('remove soft-deletes department', async () => {
    await service.remove('company-1', 'dept-1', 'user-1')
    expect(tenant['update']).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'dept-1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date), updatedBy: 'user-1' }),
      }),
    )
  })
})
