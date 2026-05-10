import { Test, type TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { TaskService } from './task.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      task: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      taskComment: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      taskTimeLog: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
    },
  }
}

const mockTask = {
  id: 'task-1',
  companyId: 'company-1',
  projectId: 'project-1',
  parentTaskId: null,
  title: 'Write script',
  description: 'Write the video script',
  status: 'TODO',
  priority: 'HIGH',
  assignedTo: 'user-1',
  startDate: null,
  dueDate: new Date('2026-06-01'),
  completedAt: null,
  estimatedHours: 8,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
  project: { id: 'project-1', name: 'TV Ad' },
  assignee: { id: 'user-1', email: 'user@test.com' },
  parentTask: null,
  subTasks: [],
  comments: [],
  timeLogs: [],
  _count: { comments: 0, timeLogs: 0 },
}

describe('TaskService', () => {
  let service: TaskService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get<TaskService>(TaskService)
  })

  describe('findAll', () => {
    it('should return all top-level tasks for company', async () => {
      prisma.tenant.task.findMany.mockResolvedValue([mockTask])
      const result = await service.findAll('company-1')
      expect(result).toEqual([mockTask])
      expect(prisma.tenant.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: 'company-1',
            parentTaskId: null,
            deletedAt: null,
          }),
        }),
      )
    })

    it('should filter by projectId', async () => {
      prisma.tenant.task.findMany.mockResolvedValue([mockTask])
      await service.findAll('company-1', { projectId: 'project-1' })
      expect(prisma.tenant.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ projectId: 'project-1' }),
        }),
      )
    })

    it('should filter by status', async () => {
      prisma.tenant.task.findMany.mockResolvedValue([mockTask])
      await service.findAll('company-1', { status: 'IN_PROGRESS' })
      expect(prisma.tenant.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'IN_PROGRESS' }),
        }),
      )
    })

    it('should filter by search', async () => {
      prisma.tenant.task.findMany.mockResolvedValue([mockTask])
      await service.findAll('company-1', { search: 'script' })
      const where = prisma.tenant.task.findMany.mock.calls[0][0].where
      expect(where.OR).toBeDefined()
    })
  })

  describe('findOne', () => {
    it('should return a task by id', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(mockTask)
      const result = await service.findOne('company-1', 'task-1')
      expect(result).toEqual(mockTask)
    })

    it('should throw NotFoundException when not found', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'task-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a task', async () => {
      prisma.tenant.task.create.mockResolvedValue(mockTask)
      const dto = {
        projectId: 'project-1',
        title: 'Write script',
        priority: 'HIGH' as const,
        assignedTo: 'user-1',
        dueDate: '2026-06-01',
        estimatedHours: 8,
      }
      const result = await service.create('company-1', 'user-1', dto)
      expect(result).toEqual(mockTask)
      expect(prisma.tenant.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Write script', companyId: 'company-1' }),
        }),
      )
    })
  })

  describe('update', () => {
    it('should update a task', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(mockTask)
      prisma.tenant.task.update.mockResolvedValue({ ...mockTask, title: 'Updated script' })
      const result = await service.update('company-1', 'task-1', 'user-1', {
        title: 'Updated script',
      })
      expect(result).toBeDefined()
      expect(prisma.tenant.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1' },
          data: expect.objectContaining({ title: 'Updated script' }),
        }),
      )
    })
  })

  describe('updateStatus', () => {
    it('should transition TODO → IN_PROGRESS', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(mockTask)
      prisma.tenant.task.update.mockResolvedValue({ ...mockTask, status: 'IN_PROGRESS' })
      const result = await service.updateStatus('company-1', 'task-1', 'user-1', 'IN_PROGRESS')
      expect(result).toBeDefined()
    })

    it('should reject backward transition from DONE', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue({ ...mockTask, status: 'DONE' })
      await expect(service.updateStatus('company-1', 'task-1', 'user-1', 'TODO')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should set completedAt when moving to DONE', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue({ ...mockTask, status: 'IN_REVIEW' })
      prisma.tenant.task.update.mockResolvedValue({
        ...mockTask,
        status: 'DONE',
        completedAt: new Date(),
      })
      await service.updateStatus('company-1', 'task-1', 'user-1', 'DONE')
      expect(prisma.tenant.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'DONE', completedAt: expect.any(Date) }),
        }),
      )
    })

    it('should reject CANCELLED → anything', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue({ ...mockTask, status: 'CANCELLED' })
      await expect(service.updateStatus('company-1', 'task-1', 'user-1', 'TODO')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('addComment', () => {
    it('should add a comment to a task', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(mockTask)
      const mockComment = {
        id: 'comment-1',
        taskId: 'task-1',
        userId: 'user-1',
        content: 'Looks good',
        mentions: [],
        companyId: 'company-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: 'user-1',
        updatedBy: null,
        user: { id: 'user-1', email: 'user@test.com' },
      }
      prisma.tenant.taskComment.create.mockResolvedValue(mockComment)
      const result = await service.addComment('company-1', 'task-1', 'user-1', 'Looks good')
      expect(result).toEqual(mockComment)
    })
  })

  describe('deleteComment', () => {
    it('should delete own comment', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue({
        ...mockTask,
        comments: [{ id: 'comment-1', userId: 'user-1' }],
      })
      prisma.tenant.taskComment.update.mockResolvedValue({} as never)
      await expect(
        service.deleteComment('company-1', 'task-1', 'comment-1', 'user-1'),
      ).resolves.not.toThrow()
    })

    it("should reject deleting another user's comment", async () => {
      prisma.tenant.task.findFirst.mockResolvedValue({
        ...mockTask,
        comments: [{ id: 'comment-1', userId: 'other-user' }],
      })
      await expect(
        service.deleteComment('company-1', 'task-1', 'comment-1', 'user-1'),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('timer', () => {
    it('should start a timer', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(mockTask)
      prisma.tenant.taskTimeLog.findFirst.mockResolvedValue(null)
      const mockLog = {
        id: 'log-1',
        taskId: 'task-1',
        userId: 'user-1',
        startTime: new Date(),
        endTime: null,
        duration: null,
        notes: null,
        companyId: 'company-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: 'user-1',
        updatedBy: null,
        user: { id: 'user-1', email: 'user@test.com' },
      }
      prisma.tenant.taskTimeLog.create.mockResolvedValue(mockLog)
      const result = await service.startTimer('company-1', 'task-1', 'user-1')
      expect(result).toEqual(mockLog)
    })

    it('should reject starting a second timer', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(mockTask)
      prisma.tenant.taskTimeLog.findFirst.mockResolvedValue({
        id: 'log-1',
        endTime: null,
      } as never)
      await expect(service.startTimer('company-1', 'task-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should stop a timer and calculate duration', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(mockTask)
      const startTime = new Date(Date.now() - 3600000) // 1 hour ago
      prisma.tenant.taskTimeLog.findFirst.mockResolvedValue({
        id: 'log-1',
        startTime,
        endTime: null,
      } as never)
      prisma.tenant.taskTimeLog.update.mockResolvedValue({
        id: 'log-1',
        duration: 60,
        endTime: new Date(),
        user: { id: 'user-1', email: 'user@test.com' },
      } as never)
      const result = await service.stopTimer('company-1', 'task-1', 'user-1')
      expect(result).toBeDefined()
    })

    it('should reject stopping when no active timer', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(mockTask)
      prisma.tenant.taskTimeLog.findFirst.mockResolvedValue(null)
      await expect(service.stopTimer('company-1', 'task-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('getWorkload', () => {
    it('should return workload grouped by user', async () => {
      prisma.tenant.task.findMany.mockResolvedValue([
        {
          ...mockTask,
          assignee: { id: 'user-1', email: 'user@test.com' },
          timeLogs: [{ duration: 60 }],
          project: { name: 'TV Ad' },
        },
      ])
      const result = await service.getWorkload('company-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.totalTasks).toBe(1)
      expect(result[0]!.loggedHours).toBe(1)
    })
  })

  describe('remove', () => {
    it('should soft delete a task', async () => {
      prisma.tenant.task.findFirst.mockResolvedValue(mockTask)
      prisma.tenant.task.update.mockResolvedValue({ ...mockTask, deletedAt: new Date() })
      await service.remove('company-1', 'task-1', 'user-1')
      expect(prisma.tenant.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })
  })
})
