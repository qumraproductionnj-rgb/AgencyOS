import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getWidgets(companyId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const where = (extra: Record<string, unknown>) =>
      ({ companyId, deletedAt: null, ...extra }) as never

    const [
      activeProjects,
      overdueTasks,
      pendingInvoices,
      monthlyInvoices,
      pipelineDeals,
      todayAttendance,
      topPerformers,
    ] = await Promise.all([
      this.prisma.tenant.project.count({
        where: where({ stage: { notIn: ['COMPLETED', 'DELIVERED', 'CANCELLED'] } }),
      }),
      this.prisma.tenant.task.count({
        where: where({ dueDate: { lt: now }, status: { notIn: ['DONE', 'CANCELLED'] } }),
      }),
      this.prisma.tenant.invoice.count({
        where: where({ status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] } }),
      }),
      this.prisma.tenant.invoice.findMany({
        where: where({ status: 'PAID', issuedDate: { gte: startOfMonth, lte: endOfMonth } }),
        select: { total: true, currency: true },
      }),
      this.prisma.tenant.deal.findMany({
        where: where({ stage: { notIn: ['WON', 'LOST'] } }),
        select: { value: true, currency: true, stage: true },
      }),
      this.prisma.tenant.attendanceRecord.groupBy({
        by: ['status'],
        where: where({ checkInTime: { gte: startOfToday, lte: endOfToday } }),
        _count: { id: true },
      }),
      this.prisma.tenant.task.groupBy({
        by: ['assignedTo'],
        where: where({
          status: 'DONE',
          completedAt: { gte: startOfMonth, lte: endOfMonth },
          assignedTo: { not: null },
        }),
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ])

    const revenueIqd = monthlyInvoices
      .filter((i) => i.currency === 'IQD')
      .reduce((sum, i) => sum + Number(i.total), 0)

    const revenueUsd = monthlyInvoices
      .filter((i) => i.currency === 'USD')
      .reduce((sum, i) => sum + Number(i.total), 0)

    const pipelineTotal = pipelineDeals.reduce(
      (acc, d) => {
        const key = d.currency === 'IQD' ? 'iqd' : 'usd'
        acc[key] += Number(d.value)
        return acc
      },
      { iqd: 0, usd: 0 },
    )

    const attendanceSummary = {
      present: todayAttendance.find((a) => a.status === 'PRESENT')?._count.id ?? 0,
      late: todayAttendance.find((a) => a.status === 'LATE')?._count.id ?? 0,
      absent: todayAttendance.find((a) => a.status === 'ABSENT')?._count.id ?? 0,
      remote: todayAttendance.find((a) => a.status === 'REMOTE')?._count.id ?? 0,
    }

    const performerIds = topPerformers.map((p) => p.assignedTo).filter(Boolean) as string[]

    const performerUsers =
      performerIds.length > 0
        ? await this.prisma.tenant.user.findMany({
            where: { id: { in: performerIds } },
            select: { id: true, email: true },
          })
        : []

    const performers = topPerformers.map((p) => ({
      userId: p.assignedTo,
      email: performerUsers.find((u) => u.id === p.assignedTo)?.email ?? 'Unknown',
      completedTasks: p._count.id,
    }))

    return {
      revenueThisMonth: { iqd: revenueIqd, usd: revenueUsd },
      activeProjects,
      overdueTasks,
      pendingInvoices,
      pipelineValue: pipelineTotal,
      todayAttendance: attendanceSummary,
      topPerformers: performers,
    }
  }
}
