import { Test, type TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { DepartmentService } from './department.service'
import { PrismaService } from '../database/prisma.service'

describe('DepartmentService', () => {
  let service: DepartmentService
  const tenant: Record<string, jest.Mock> = {}
  const userTable: Record<string, jest.Mock> = {}
  const companyTable: Record<string, jest.Mock> = {}

  const mockDept = {
    id: 'dept-1',
    companyId: 'company-1',
    nameAr: 'قسم التصميم',
    nameEn: 'Design Dept',
    description: null,
    managerUserId: null,
    parentId: null,
    icon: null,
    color: null,
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
    tenant['findUnique'] = jest.fn().mockResolvedValue({ parentId: null })
    tenant['create'] = jest.fn().mockResolvedValue(mockDept)
    tenant['update'] = jest.fn().mockResolvedValue(mockDept)
    tenant['count'] = jest.fn().mockResolvedValue(0)
    userTable['update'] = jest.fn().mockResolvedValue({})
    companyTable['findUnique'] = jest
      .fn()
      .mockResolvedValue({ id: 'company-1', orgStructureType: 'FLAT' })
    companyTable['update'] = jest
      .fn()
      .mockResolvedValue({ id: 'company-1', orgStructureType: 'HIERARCHICAL' })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { department: tenant, user: userTable, company: companyTable },
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
      include: {
        manager: { select: { id: true, email: true } },
        _count: { select: { employees: true, children: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
  })

  it('findTree builds a tree from flat list', async () => {
    const parent = { ...mockDept, id: 'p1', parentId: null }
    const child = { ...mockDept, id: 'c1', parentId: 'p1' }
    tenant['findMany']!.mockResolvedValueOnce([parent, child])
    const tree = await service.findTree('company-1')
    expect(tree).toHaveLength(1)
    expect(tree[0]!.id).toBe('p1')
    expect(tree[0]!.children).toHaveLength(1)
    expect(tree[0]!.children[0]!.id).toBe('c1')
  })

  it('findOne returns department or throws', async () => {
    const result = await service.findOne('company-1', 'dept-1')
    expect(result).toEqual(mockDept)

    tenant['findFirst']!.mockResolvedValue(null)
    await expect(service.findOne('company-1', 'missing')).rejects.toThrow(NotFoundException)
  })

  it('create creates department with all fields', async () => {
    const result = await service.create('company-1', { nameAr: 'New Dept' }, 'user-1')
    expect(result).toEqual(mockDept)
    expect(tenant['create']).toHaveBeenCalledWith({
      data: {
        companyId: 'company-1',
        nameAr: 'New Dept',
        nameEn: null,
        description: null,
        managerUserId: null,
        parentId: null,
        icon: null,
        color: null,
        createdBy: 'user-1',
      },
    })
  })

  it('create with manager flips isManager flag on user', async () => {
    await service.create('company-1', { nameAr: 'X', managerUserId: 'u1' }, 'user-1')
    expect(userTable['update']).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { isManager: true },
    })
  })

  it('update rejects self-parent', async () => {
    await expect(
      service.update('company-1', 'dept-1', { parentId: 'dept-1' }, 'user-1'),
    ).rejects.toThrow(BadRequestException)
  })

  it('update rejects cycle in hierarchy', async () => {
    // dept-1 wants to set parent = dept-2; dept-2's parent = dept-1 => cycle
    tenant['findFirst']!.mockResolvedValueOnce(mockDept) // initial findOne for dept-1
    tenant['findFirst']!.mockResolvedValueOnce({ id: 'dept-2', companyId: 'company-1' }) // assertParentInCompany
    tenant['findUnique']!.mockResolvedValueOnce({ parentId: 'dept-1' }) // walk up from dept-2 finds dept-1
    await expect(
      service.update('company-1', 'dept-1', { parentId: 'dept-2' }, 'user-1'),
    ).rejects.toThrow(BadRequestException)
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

  it('setOrgStructure persists the type', async () => {
    const result = await service.setOrgStructure('company-1', 'HIERARCHICAL', 'user-1')
    expect(result.orgStructureType).toBe('HIERARCHICAL')
    expect(companyTable['update']).toHaveBeenCalledWith({
      where: { id: 'company-1' },
      data: { orgStructureType: 'HIERARCHICAL', updatedBy: 'user-1' },
      select: { id: true, orgStructureType: true },
    })
  })

  it('getOrgStructure returns the current type', async () => {
    const result = await service.getOrgStructure('company-1')
    expect(result.orgStructureType).toBe('FLAT')
  })
})
