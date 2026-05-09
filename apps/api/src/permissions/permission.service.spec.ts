import { Test, type TestingModule } from '@nestjs/testing'
import { PermissionService } from './permission.service'
import { PrismaService } from '../database/prisma.service'

describe('PermissionService', () => {
  let service: PermissionService
  let prisma: jest.Mocked<Pick<PrismaService, 'system'>>

  const mockQueryRaw = jest.fn()

  beforeEach(async () => {
    mockQueryRaw.mockReset()

    prisma = {
      system: {
        $queryRaw: mockQueryRaw,
        permission: {
          findMany: jest.fn(),
        },
      } as unknown as PrismaService['system'],
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<PermissionService>(PermissionService)
  })

  describe('userCan', () => {
    it('should return true when user has the exact permission', async () => {
      mockQueryRaw.mockResolvedValue([{ count: BigInt(1) }])

      const result = await service.userCan('user-1', 'company-1', 'employees', 'read')

      expect(result).toBe(true)
      expect(mockQueryRaw).toHaveBeenCalledTimes(1)
    })

    it('should return true when user has manage permission (manage implies all)', async () => {
      mockQueryRaw.mockResolvedValue([{ count: BigInt(1) }])

      const result = await service.userCan('user-1', 'company-1', 'employees', 'read')

      expect(result).toBe(true)
    })

    it('should return false when user lacks the permission', async () => {
      mockQueryRaw.mockResolvedValue([{ count: BigInt(0) }])

      const result = await service.userCan('user-1', 'company-1', 'billing', 'manage')

      expect(result).toBe(false)
    })

    it('should return false on query error (fail closed)', async () => {
      mockQueryRaw.mockRejectedValue(new Error('DB error'))

      const result = await service.userCan('user-1', 'company-1', 'employees', 'read')

      expect(result).toBe(false)
    })

    it('should return false when no rows returned', async () => {
      mockQueryRaw.mockResolvedValue([])

      const result = await service.userCan('user-1', 'company-1', 'employees', 'read')

      expect(result).toBe(false)
    })
  })

  describe('getUserPermissions', () => {
    it('should return list of permission keys', async () => {
      mockQueryRaw.mockResolvedValue([
        { resource: 'employees', action: 'read' },
        { resource: 'employees', action: 'manage' },
        { resource: 'projects', action: 'read_assigned' },
      ])

      const result = await service.getUserPermissions('user-1', 'company-1')

      expect(result).toEqual(['employees.read', 'employees.manage', 'projects.read_assigned'])
    })

    it('should return empty array on error', async () => {
      mockQueryRaw.mockRejectedValue(new Error('DB error'))

      const result = await service.getUserPermissions('user-1', 'company-1')

      expect(result).toEqual([])
    })
  })

  describe('getUserRoles', () => {
    it('should return list of role names', async () => {
      mockQueryRaw.mockResolvedValue([{ name: 'owner' }, { name: 'admin' }])

      const result = await service.getUserRoles('user-1', 'company-1')

      expect(result).toEqual(['owner', 'admin'])
    })

    it('should return empty array on error', async () => {
      mockQueryRaw.mockRejectedValue(new Error('DB error'))

      const result = await service.getUserRoles('user-1', 'company-1')

      expect(result).toEqual([])
    })
  })

  describe('userHasRole', () => {
    it('should return true when user has one of the roles', async () => {
      mockQueryRaw.mockResolvedValue([{ count: BigInt(1) }])

      const result = await service.userHasRole('user-1', 'company-1', ['hr_manager', 'admin'])

      expect(result).toBe(true)
    })

    it('should return true when user has all of the roles', async () => {
      mockQueryRaw.mockResolvedValue([{ count: BigInt(2) }])

      const result = await service.userHasRole('user-1', 'company-1', ['admin', 'hr_manager'])

      expect(result).toBe(true)
    })

    it('should return false when user has none of the roles', async () => {
      mockQueryRaw.mockResolvedValue([{ count: BigInt(0) }])

      const result = await service.userHasRole('user-1', 'company-1', ['owner', 'admin'])

      expect(result).toBe(false)
    })

    it('should return false on query error', async () => {
      mockQueryRaw.mockRejectedValue(new Error('DB error'))

      const result = await service.userHasRole('user-1', 'company-1', ['owner'])

      expect(result).toBe(false)
    })
  })
})
