import { Test, type TestingModule } from '@nestjs/testing'
import { NotificationService } from './notification.service'
import { NotificationGateway } from './notification.gateway'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      notification: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    },
  }
}

function mockGateway() {
  return {
    sendToUser: jest.fn(),
    sendToCompany: jest.fn(),
  }
}

const mockNotification = {
  id: 'notif-1',
  companyId: 'company-1',
  userId: 'user-1',
  type: 'TASK_ASSIGNED',
  title: 'Task assigned',
  body: 'You have a new task',
  data: { taskId: 'task-1' },
  isRead: false,
  readAt: null,
  createdAt: new Date(),
}

describe('NotificationService', () => {
  let service: NotificationService
  let prisma: ReturnType<typeof mockPrisma>
  let gateway: ReturnType<typeof mockGateway>

  beforeEach(async () => {
    prisma = mockPrisma()
    gateway = mockGateway()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationGateway, useValue: gateway },
      ],
    }).compile()
    service = module.get<NotificationService>(NotificationService)
  })

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      prisma.tenant.notification.findMany.mockResolvedValue([mockNotification])
      const result = await service.findAll('company-1', 'user-1')
      expect(result.items).toEqual([mockNotification])
    })

    it('should filter unread only', async () => {
      prisma.tenant.notification.findMany.mockResolvedValue([mockNotification])
      await service.findAll('company-1', 'user-1', { unreadOnly: true })
      expect(prisma.tenant.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isRead: false }),
        }),
      )
    })

    it('should handle pagination with cursor', async () => {
      prisma.tenant.notification.findMany.mockResolvedValue([mockNotification])
      const result = await service.findAll('company-1', 'user-1', { limit: 1, cursor: 'prev-id' })
      expect(result).toBeDefined()
    })
  })

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      prisma.tenant.notification.count.mockResolvedValue(5)
      const result = await service.getUnreadCount('company-1', 'user-1')
      expect(result).toBe(5)
    })
  })

  describe('create', () => {
    it('should create a notification and emit via gateway', async () => {
      prisma.tenant.notification.create.mockResolvedValue(mockNotification)
      const result = await service.create('company-1', {
        userId: 'user-1',
        type: 'TASK_ASSIGNED',
        title: 'Task assigned',
      })
      expect(result).toEqual(mockNotification)
      expect(gateway.sendToUser).toHaveBeenCalledWith('user-1', 'notification', mockNotification)
    })
  })

  describe('markRead', () => {
    it('should mark notifications as read', async () => {
      prisma.tenant.notification.updateMany.mockResolvedValue({ count: 2 } as never)
      await service.markRead('company-1', 'user-1', ['notif-1', 'notif-2'])
      expect(prisma.tenant.notification.updateMany).toHaveBeenCalled()
    })
  })

  describe('markAllRead', () => {
    it('should mark all as read', async () => {
      prisma.tenant.notification.updateMany.mockResolvedValue({ count: 5 } as never)
      await service.markAllRead('company-1', 'user-1')
      expect(prisma.tenant.notification.updateMany).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('should delete a notification', async () => {
      prisma.tenant.notification.delete.mockResolvedValue(mockNotification)
      await service.remove('company-1', 'user-1', 'notif-1')
      expect(prisma.tenant.notification.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'notif-1' } }),
      )
    })
  })
})
