import { Test, type TestingModule } from '@nestjs/testing'
import { AuditService } from './audit.service'
import { PrismaService } from '../database/prisma.service'

describe('AuditService', () => {
  let service: AuditService
  let prisma: { system: { auditLog: Record<string, jest.Mock> } }

  beforeEach(async () => {
    prisma = {
      system: {
        auditLog: {
          create: jest.fn(),
          findMany: jest.fn(),
        },
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile()

    service = module.get<AuditService>(AuditService)
  })

  describe('log', () => {
    it('writes audit log entry', async () => {
      prisma.system.auditLog['create']!.mockResolvedValue({ id: 'log-1' })

      await service.log({
        action: 'post attendance',
        entityType: 'attendance',
        companyId: 'c1',
        userId: 'u1',
      })

      expect(prisma.system.auditLog['create']).toHaveBeenCalledWith({
        data: expect.objectContaining({ action: 'post attendance', companyId: 'c1', userId: 'u1' }),
      })
    })

    it('handles errors gracefully without throwing', async () => {
      prisma.system.auditLog['create']!.mockRejectedValue(new Error('DB down'))

      await expect(service.log({ action: 'test' })).resolves.toBeUndefined()
    })
  })

  describe('findAll', () => {
    const mockLogs = [
      {
        id: '1',
        action: 'post attendance',
        companyId: 'c1',
        entityType: 'attendance',
        userId: 'u1',
        createdAt: new Date(),
        ipAddress: null,
        userAgent: null,
        changes: null,
        metadata: null,
        entityId: null,
        user: { id: 'u1', email: 'user@test.com' },
      },
      {
        id: '2',
        action: 'put employee',
        companyId: 'c1',
        entityType: 'employee',
        userId: 'u2',
        createdAt: new Date(),
        ipAddress: null,
        userAgent: null,
        changes: null,
        metadata: null,
        entityId: null,
        user: { id: 'u2', email: 'user2@test.com' },
      },
    ]

    it('returns logs with cursor pagination', async () => {
      prisma.system.auditLog['findMany']!.mockResolvedValue(mockLogs)

      const result = await service.findAll('c1', { limit: 10 })

      expect(result.items).toHaveLength(2)
      expect(result.nextCursor).toBeNull()
      expect(prisma.system.auditLog['findMany']).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'c1' },
          take: 11,
          orderBy: { createdAt: 'desc' },
        }),
      )
    })

    it('applies entityType filter', async () => {
      prisma.system.auditLog['findMany']!.mockResolvedValue([mockLogs[0]])

      await service.findAll('c1', { entityType: 'attendance' })

      expect(prisma.system.auditLog['findMany']).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'c1', entityType: 'attendance' },
        }),
      )
    })

    it('applies userId filter', async () => {
      prisma.system.auditLog['findMany']!.mockResolvedValue([mockLogs[0]])

      await service.findAll('c1', { userId: 'u1' })

      expect(prisma.system.auditLog['findMany']).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'c1', userId: 'u1' },
        }),
      )
    })

    it('caps limit at 200', async () => {
      prisma.system.auditLog['findMany']!.mockResolvedValue([])

      await service.findAll('c1', { limit: 999 })

      expect(prisma.system.auditLog['findMany']).toHaveBeenCalledWith(
        expect.objectContaining({ take: 201 }),
      )
    })

    it('returns nextCursor when more results exist', async () => {
      const extra = {
        id: '3',
        action: 'delete department',
        companyId: 'c1',
        entityType: 'department',
        userId: 'u3',
        createdAt: new Date(),
        ipAddress: null,
        userAgent: null,
        changes: null,
        metadata: null,
        entityId: null,
        user: { id: 'u3', email: 'user3@test.com' },
      }
      prisma.system.auditLog['findMany']!.mockResolvedValue([...mockLogs, extra])

      const result = await service.findAll('c1', { limit: 2 })

      expect(result.items).toHaveLength(2)
      expect(result.nextCursor).toBe('2')
    })
  })
})
