import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { WorkLocationService } from './work-location.service'
import { PrismaService } from '../database/prisma.service'

describe('WorkLocationService', () => {
  let service: WorkLocationService
  const tenant: Record<string, jest.Mock> = {}
  const workLocationEmployee: Record<string, jest.Mock> = {}

  const mockLoc = {
    id: 'loc-1',
    companyId: 'company-1',
    name: 'Main Office',
    address: 'Baghdad',
    latitude: 33.3152,
    longitude: 44.3661,
    radiusMeters: 100,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: 'user-1',
    updatedBy: null,
    workLocationEmployees: [],
    _count: { workLocationEmployees: 0 },
  }

  beforeEach(async () => {
    tenant['findMany'] = jest.fn().mockResolvedValue([mockLoc])
    tenant['findFirst'] = jest.fn().mockResolvedValue(mockLoc)
    tenant['create'] = jest.fn().mockResolvedValue(mockLoc)
    tenant['update'] = jest.fn().mockResolvedValue(mockLoc)
    workLocationEmployee['deleteMany'] = jest.fn().mockResolvedValue({ count: 0 })
    workLocationEmployee['createMany'] = jest.fn().mockResolvedValue({ count: 0 })
    workLocationEmployee['findMany'] = jest.fn().mockResolvedValue([])

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkLocationService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { workLocation: tenant, workLocationEmployee },
          },
        },
      ],
    }).compile()

    service = module.get<WorkLocationService>(WorkLocationService)
  })

  it('findAll returns locations', async () => {
    const result = await service.findAll('company-1')
    expect(result).toHaveLength(1)
    expect(tenant['findMany']).toHaveBeenCalledWith({
      where: { companyId: 'company-1', deletedAt: null },
      include: {
        _count: { select: { workLocationEmployees: true } },
        workLocationEmployees: {
          include: { employee: { select: { id: true, fullNameAr: true, employeeCode: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  })

  it('findOne returns location or throws', async () => {
    const result = await service.findOne('company-1', 'loc-1')
    expect(result).toEqual(mockLoc)

    tenant['findFirst']!.mockResolvedValue(null)
    await expect(service.findOne('company-1', 'missing')).rejects.toThrow(NotFoundException)
  })

  it('create creates location', async () => {
    const dto = {
      name: 'New Office',
      latitude: 33.3,
      longitude: 44.4,
      radiusMeters: 200,
      isActive: true,
    }
    const result = await service.create('company-1', dto, 'user-1')
    expect(result).toEqual(mockLoc)
    expect(tenant['create']).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'New Office', companyId: 'company-1' }),
      }),
    )
  })

  it('update updates location', async () => {
    await service.update('company-1', 'loc-1', { name: 'Updated' }, 'user-1')
    expect(tenant['update']).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'loc-1' },
        data: expect.objectContaining({ name: 'Updated', updatedBy: 'user-1' }),
      }),
    )
  })

  it('remove soft-deletes location', async () => {
    await service.remove('company-1', 'loc-1', 'user-1')
    expect(tenant['update']).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'loc-1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date), updatedBy: 'user-1' }),
      }),
    )
  })
})
