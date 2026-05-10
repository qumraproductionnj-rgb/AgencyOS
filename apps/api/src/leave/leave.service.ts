import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import type { LeaveType } from '@agencyos/database'
import { PrismaService } from '../database/prisma.service'
import type { CreateLeaveDto, RejectLeaveDto } from './leave.dto'

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name)

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateLeaveDto) {
    const employee = await this.prisma.tenant.employee.findFirst({
      where: { companyId, userId, deletedAt: null },
    })
    if (!employee) throw new NotFoundException('Employee not found for this user')

    const start = new Date(dto.startDate)
    const end = new Date(dto.endDate)
    if (end < start) throw new BadRequestException('End date must be after start date')

    const durationDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const overlapping = await this.prisma.tenant.leave.findFirst({
      where: {
        companyId,
        employeeId: employee.id,
        deletedAt: null,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    })
    if (overlapping)
      throw new ConflictException('Employee already has a leave request in this period')

    const leave = await this.prisma.tenant.leave.create({
      data: {
        companyId,
        employeeId: employee.id,
        leaveType: dto.leaveType,
        startDate: start,
        endDate: end,
        durationDays,
        reason: dto.reason ?? null,
        createdBy: userId,
      },
    })

    this.logger.log(`Leave created: ${leave.id} for employee ${employee.id}`)
    return leave
  }

  async findAll(companyId: string, userId: string, filters?: Record<string, string>) {
    const employee = await this.prisma.tenant.employee.findFirst({
      where: { companyId, userId, deletedAt: null },
    })

    const where: Record<string, unknown> = { companyId, deletedAt: null }

    if (employee) {
      if (filters?.['view'] === 'my') {
        where['employeeId'] = employee.id
      }
    }

    if (filters?.['employeeId']) where['employeeId'] = filters['employeeId']
    if (filters?.['status']) where['status'] = filters['status']
    if (filters?.['leaveType']) where['leaveType'] = filters['leaveType']

    const leaves = await this.prisma.tenant.leave.findMany({
      where: where as never,
      include: {
        employee: {
          select: { id: true, fullNameAr: true, fullNameEn: true, employeeCode: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return leaves
  }

  async findOne(companyId: string, id: string) {
    const leave = await this.prisma.tenant.leave.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        employee: {
          select: { id: true, fullNameAr: true, fullNameEn: true, employeeCode: true },
        },
      },
    })
    if (!leave) throw new NotFoundException('Leave not found')
    return leave
  }

  async approve(companyId: string, id: string, userId: string, userRoles: string[]) {
    const leave = await this.findOne(companyId, id)
    if (leave.status !== 'PENDING')
      throw new BadRequestException('Only pending leaves can be approved')

    if (leave.durationDays > 5 && !userRoles.includes('owner')) {
      throw new ForbiddenException('Leaves longer than 5 days require Owner approval')
    }

    const updated = await this.prisma.tenant.leave.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
        updatedBy: userId,
      },
    })

    await this.updateBalance(
      companyId,
      leave.employeeId,
      leave.leaveType,
      leave.durationDays,
      'add',
    )

    this.logger.log(`Leave approved: ${id}`)
    return updated
  }

  async reject(companyId: string, id: string, userId: string, dto: RejectLeaveDto) {
    const leave = await this.findOne(companyId, id)
    if (leave.status !== 'PENDING')
      throw new BadRequestException('Only pending leaves can be rejected')

    const updated = await this.prisma.tenant.leave.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: dto.rejectionReason,
        updatedBy: userId,
      },
    })

    this.logger.log(`Leave rejected: ${id}`)
    return updated
  }

  async cancel(companyId: string, id: string, userId: string) {
    const leave = await this.findOne(companyId, id)
    if (leave.status === 'APPROVED') {
      await this.updateBalance(
        companyId,
        leave.employeeId,
        leave.leaveType,
        leave.durationDays,
        'subtract',
      )
    }
    if (leave.status !== 'PENDING' && leave.status !== 'APPROVED') {
      throw new BadRequestException('Only pending or approved leaves can be cancelled')
    }

    const updated = await this.prisma.tenant.leave.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedBy: userId,
      },
    })

    this.logger.log(`Leave cancelled: ${id}`)
    return updated
  }

  async getBalances(companyId: string, userId: string) {
    const employee = await this.prisma.tenant.employee.findFirst({
      where: { companyId, userId, deletedAt: null },
    })
    if (!employee) throw new NotFoundException('Employee not found for this user')

    const year = new Date().getFullYear()
    const balances = await this.prisma.tenant.leaveBalance.findMany({
      where: { companyId, employeeId: employee.id, year },
    })

    if (balances.length === 0) {
      return this.seedDefaultBalances(companyId, employee.id, year)
    }

    return balances
  }

  private async updateBalance(
    companyId: string,
    employeeId: string,
    leaveType: LeaveType,
    days: number,
    op: 'add' | 'subtract',
  ) {
    const year = new Date().getFullYear()

    const balance = await this.prisma.tenant.leaveBalance.findUnique({
      where: {
        companyId_employeeId_leaveType_year: { companyId, employeeId, leaveType, year },
      },
    })

    if (balance) {
      const delta = op === 'add' ? days : -days
      await this.prisma.tenant.leaveBalance.update({
        where: { id: balance.id },
        data: { usedDays: balance.usedDays + delta },
      })
    }
  }

  private async seedDefaultBalances(companyId: string, employeeId: string, year: number) {
    const defaults: { leaveType: LeaveType; totalDays: number }[] = [
      { leaveType: 'ANNUAL', totalDays: 30 },
      { leaveType: 'SICK', totalDays: 15 },
      { leaveType: 'PERSONAL', totalDays: 5 },
      { leaveType: 'MATERNITY', totalDays: 90 },
      { leaveType: 'PATERNITY', totalDays: 3 },
      { leaveType: 'UNPAID', totalDays: 0 },
      { leaveType: 'OTHER', totalDays: 0 },
    ]

    const data = defaults.map((d) => ({
      companyId,
      employeeId,
      leaveType: d.leaveType,
      totalDays: d.totalDays,
      usedDays: 0,
      year,
    }))

    await this.prisma.tenant.leaveBalance.createMany({ data })
    return this.prisma.tenant.leaveBalance.findMany({
      where: { companyId, employeeId, year },
    })
  }
}
