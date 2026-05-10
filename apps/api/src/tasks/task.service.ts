import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { CreateTaskDto, UpdateTaskDto } from './task.dto'

const VALID_TRANSITIONS: Record<string, string[]> = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['IN_REVIEW', 'TODO', 'CANCELLED'],
  IN_REVIEW: ['DONE', 'IN_PROGRESS', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
}

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    filters?: {
      search?: string
      status?: string
      priority?: string
      projectId?: string
      assignedTo?: string
      dueBefore?: string
    },
  ) {
    const where: Record<string, unknown> = { companyId, deletedAt: null, parentTaskId: null }
    if (filters?.status) where['status'] = filters.status
    if (filters?.priority) where['priority'] = filters.priority
    if (filters?.projectId) where['projectId'] = filters.projectId
    if (filters?.assignedTo) where['assignedTo'] = filters.assignedTo
    if (filters?.dueBefore) where['dueDate'] = { lte: new Date(filters.dueBefore) }
    if (filters?.search) {
      const s = filters.search
      where['OR'] = [
        { title: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
      ]
    }

    return this.prisma.tenant.task.findMany({
      where: where as never,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, email: true } },
        subTasks: {
          where: { deletedAt: null },
          select: { id: true, title: true, status: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { comments: true, timeLogs: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
  }

  async findOne(companyId: string, id: string) {
    const task = await this.prisma.tenant.task.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        project: { select: { id: true, name: true, stage: true } },
        assignee: { select: { id: true, email: true } },
        parentTask: { select: { id: true, title: true, status: true } },
        subTasks: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            assignee: { select: { id: true, email: true } },
          },
        },
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        timeLogs: {
          where: { deletedAt: null },
          orderBy: { startTime: 'desc' },
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    })
    if (!task) throw new NotFoundException('Task not found')
    return task
  }

  async create(companyId: string, userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.tenant.task.create({
      data: {
        companyId,
        projectId: dto.projectId ?? null,
        parentTaskId: dto.parentTaskId ?? null,
        title: dto.title,
        description: dto.description ?? null,
        priority: dto.priority as never,
        assignedTo: dto.assignedTo ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        estimatedHours: dto.estimatedHours ?? null,
        createdBy: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, email: true } },
        _count: { select: { comments: true, timeLogs: true } },
      },
    })
    this.logger.log(`Task created: ${task.id} "${task.title}"`)
    return task
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateTaskDto) {
    await this.findOne(companyId, id)
    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.title) updateData['title'] = dto.title
    if (dto.description !== undefined) updateData['description'] = dto.description
    if (dto.priority) updateData['priority'] = dto.priority as never
    if (dto.assignedTo !== undefined) updateData['assignedTo'] = dto.assignedTo
    if (dto.startDate !== undefined)
      updateData['startDate'] = dto.startDate ? new Date(dto.startDate) : null
    if (dto.dueDate !== undefined)
      updateData['dueDate'] = dto.dueDate ? new Date(dto.dueDate) : null
    if (dto.estimatedHours !== undefined) updateData['estimatedHours'] = dto.estimatedHours
    if (dto.sortOrder !== undefined) updateData['sortOrder'] = dto.sortOrder

    const updated = await this.prisma.tenant.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, email: true } },
        subTasks: {
          where: { deletedAt: null },
          select: { id: true, title: true, status: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { comments: true, timeLogs: true } },
      },
    })
    this.logger.log(`Task updated: ${id}`)
    return updated
  }

  async updateStatus(companyId: string, id: string, userId: string, status: string) {
    const existing = await this.findOne(companyId, id)
    const allowed = VALID_TRANSITIONS[existing.status]
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${existing.status} to ${status}. Allowed: ${(allowed ?? []).join(', ') || 'none'}`,
      )
    }
    const updateData: Record<string, unknown> = { status: status as never, updatedBy: userId }
    if (status === 'DONE') updateData['completedAt'] = new Date()
    if (status === 'TODO') updateData['completedAt'] = null

    const updated = await this.prisma.tenant.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, email: true } },
        subTasks: {
          where: { deletedAt: null },
          select: { id: true, title: true, status: true },
        },
        _count: { select: { comments: true, timeLogs: true } },
      },
    })
    this.logger.log(`Task ${id} → ${status}`)
    return updated
  }

  async addComment(
    companyId: string,
    taskId: string,
    userId: string,
    content: string,
    mentions?: string[],
  ) {
    await this.findOne(companyId, taskId)
    const comment = await this.prisma.tenant.taskComment.create({
      data: {
        companyId,
        taskId,
        userId,
        content,
        mentions: mentions ?? [],
        createdBy: userId,
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    })
    this.logger.log(`Comment added to task ${taskId} by user ${userId}`)
    return comment
  }

  async deleteComment(companyId: string, taskId: string, commentId: string, userId: string) {
    const task = await this.findOne(companyId, taskId)
    const comment = task.comments.find((c) => c.id === commentId)
    if (!comment) throw new NotFoundException('Comment not found')
    if (comment.userId !== userId) {
      throw new BadRequestException('You can only delete your own comments')
    }
    await this.prisma.tenant.taskComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Comment ${commentId} deleted from task ${taskId}`)
  }

  async startTimer(companyId: string, taskId: string, userId: string, notes?: string) {
    await this.findOne(companyId, taskId)

    const activeLog = await this.prisma.tenant.taskTimeLog.findFirst({
      where: { taskId, userId, endTime: null, deletedAt: null },
    })
    if (activeLog) {
      throw new BadRequestException(
        'You already have an active timer for this task. Stop it first.',
      )
    }

    const timeLog = await this.prisma.tenant.taskTimeLog.create({
      data: {
        companyId,
        taskId,
        userId,
        startTime: new Date(),
        notes: notes ?? null,
        createdBy: userId,
      },
      include: { user: { select: { id: true, email: true } } },
    })
    this.logger.log(`Timer started on task ${taskId} by user ${userId}`)
    return timeLog
  }

  async stopTimer(companyId: string, taskId: string, userId: string, notes?: string) {
    await this.findOne(companyId, taskId)

    const activeLog = await this.prisma.tenant.taskTimeLog.findFirst({
      where: { taskId, userId, endTime: null, deletedAt: null },
    })
    if (!activeLog) {
      throw new BadRequestException('No active timer found for this task.')
    }

    const endTime = new Date()
    const durationMinutes = Math.round((endTime.getTime() - activeLog.startTime.getTime()) / 60000)

    const timeLog = await this.prisma.tenant.taskTimeLog.update({
      where: { id: activeLog.id },
      data: {
        endTime,
        duration: durationMinutes,
        ...(notes ? { notes: activeLog.notes ? `${activeLog.notes}\n${notes}` : notes } : {}),
        updatedBy: userId,
      },
      include: { user: { select: { id: true, email: true } } },
    })
    this.logger.log(`Timer stopped on task ${taskId} by user ${userId} (${durationMinutes} min)`)
    return timeLog
  }

  async getWorkload(companyId: string) {
    const tasks = await this.prisma.tenant.task.findMany({
      where: { companyId, deletedAt: null, status: { notIn: ['DONE', 'CANCELLED'] } },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, email: true } },
        timeLogs: {
          where: { deletedAt: null },
          select: { duration: true },
        },
      },
    })

    const workloadMap = new Map<
      string,
      {
        user: { id: string; email: string }
        totalTasks: number
        estimatedHours: number
        loggedHours: number
        byProject: Record<string, { name: string; tasks: number }>
      }
    >()

    for (const task of tasks) {
      if (!task.assignee) continue
      const userId = task.assignee.id
      if (!workloadMap.has(userId)) {
        workloadMap.set(userId, {
          user: task.assignee,
          totalTasks: 0,
          estimatedHours: 0,
          loggedHours: 0,
          byProject: {},
        })
      }
      const entry = workloadMap.get(userId)!
      entry.totalTasks++
      entry.estimatedHours += Number(task.estimatedHours ?? 0)
      entry.loggedHours += task.timeLogs.reduce((sum, tl) => sum + (tl.duration ?? 0), 0) / 60

      const projectId = task.projectId ?? '__unassigned__'
      const projectName = task.project?.name ?? 'Unassigned'
      if (!entry.byProject[projectId]) {
        entry.byProject[projectId] = { name: projectName, tasks: 0 }
      }
      entry.byProject[projectId].tasks++
    }

    return Array.from(workloadMap.values()).sort((a, b) => b.totalTasks - a.totalTasks)
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.task.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Task deleted: ${id}`)
  }
}
