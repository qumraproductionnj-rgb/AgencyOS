import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

export interface DateRange {
  from: Date
  to: Date
}

/**
 * Tenant-level reporting aggregations.
 *
 * Read-only; uses `prisma.tenant` so RLS isolates results to the caller's company.
 * Returns plain shapes that can be serialized to JSON / Excel / PDF by the controller.
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async financial(range: DateRange) {
    const dateFilter = { gte: range.from, lte: range.to }
    const [paidInvoices, expenses, openInvoices] = await Promise.all([
      this.prisma.tenant.invoice.findMany({
        where: { status: 'PAID', issuedDate: dateFilter as never, deletedAt: null },
        select: { total: true, currency: true, issuedDate: true },
      }),
      this.prisma.tenant.expense.findMany({
        where: { status: 'APPROVED', expenseDate: dateFilter as never, deletedAt: null },
        select: { amount: true, currency: true, category: true },
      }),
      this.prisma.tenant.invoice.findMany({
        where: {
          status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
          deletedAt: null,
        },
        select: { total: true, currency: true, dueDate: true, status: true },
      }),
    ])

    const revenue = sumByCurrency(
      paidInvoices.map((i) => ({ amount: i.total, currency: i.currency })),
    )
    const totalExpenses = sumByCurrency(
      expenses.map((e) => ({ amount: e.amount, currency: e.currency })),
    )
    const expensesByCategory: Record<string, Record<string, number>> = {}
    for (const e of expenses) {
      const cat = e.category ?? 'uncategorized'
      expensesByCategory[cat] = expensesByCategory[cat] ?? {}
      expensesByCategory[cat][e.currency] =
        (expensesByCategory[cat][e.currency] ?? 0) + Number(e.amount)
    }
    const profitability: Record<string, number> = {}
    for (const cur of Object.keys(revenue)) {
      profitability[cur] = revenue[cur]! - (totalExpenses[cur] ?? 0)
    }
    const aging = bucketAging(openInvoices)

    return { revenue, expenses: totalExpenses, profitability, expensesByCategory, aging }
  }

  async operations(range: DateRange) {
    const dateFilter = { gte: range.from, lte: range.to }
    const [tasksDone, tasksOverdue, totalTasks, revisions] = await Promise.all([
      this.prisma.tenant.task.count({
        where: { status: 'DONE', completedAt: dateFilter as never, deletedAt: null },
      }),
      this.prisma.tenant.task.count({
        where: {
          status: { notIn: ['DONE', 'CANCELLED'] },
          dueDate: { lt: new Date() },
          deletedAt: null,
        },
      }),
      this.prisma.tenant.task.count({
        where: { createdAt: dateFilter as never, deletedAt: null },
      }),
      this.prisma.tenant.revision.count({
        where: { createdAt: dateFilter as never, deletedAt: null },
      }),
    ])
    const completionRate = totalTasks > 0 ? (tasksDone / totalTasks) * 100 : 0
    return {
      tasksDone,
      tasksOverdue,
      totalTasks,
      completionRatePct: Math.round(completionRate * 100) / 100,
      revisions,
    }
  }

  async hr(range: DateRange) {
    const dateFilter = { gte: range.from, lte: range.to }
    const [byStatus, leavesByType, reviews] = await Promise.all([
      this.prisma.tenant.attendanceRecord.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { checkInTime: dateFilter as never, deletedAt: null },
      }),
      this.prisma.tenant.leave.groupBy({
        by: ['leaveType'],
        _count: { _all: true },
        where: { startDate: dateFilter as never, deletedAt: null },
      }),
      this.prisma.tenant.performanceReview.count({
        where: { reviewDate: dateFilter as never, deletedAt: null },
      }),
    ])
    const attendance: Record<string, number> = {}
    for (const row of byStatus) attendance[row.status] = row._count._all
    const leaves: Record<string, number> = {}
    for (const row of leavesByType) leaves[row.leaveType] = row._count._all
    return { attendance, leaves, performanceReviews: reviews }
  }

  async sales(range: DateRange) {
    const dateFilter = { gte: range.from, lte: range.to }
    const [byStage, byStatus, won, lost] = await Promise.all([
      this.prisma.tenant.lead.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { createdAt: dateFilter as never, deletedAt: null },
      }),
      this.prisma.tenant.deal.groupBy({
        by: ['stage'],
        _count: { _all: true },
        _sum: { value: true },
        where: { createdAt: dateFilter as never, deletedAt: null },
      }),
      this.prisma.tenant.deal.count({
        where: { stage: 'CLOSED_WON', createdAt: dateFilter as never, deletedAt: null },
      }),
      this.prisma.tenant.deal.count({
        where: { stage: 'CLOSED_LOST', createdAt: dateFilter as never, deletedAt: null },
      }),
    ])
    const pipeline: Record<string, number> = {}
    for (const row of byStage as { status: string; _count: { _all: number } }[])
      pipeline[row.status] = row._count._all
    const dealsByStatus: Record<string, { count: number; value: number }> = {}
    for (const row of byStatus as {
      stage: string
      _count: { _all: number }
      _sum: { value: bigint | null }
    }[])
      dealsByStatus[row.stage] = {
        count: row._count._all,
        value: Number(row._sum.value ?? 0),
      }
    const conversionRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0
    return {
      pipeline,
      dealsByStatus,
      won,
      lost,
      conversionRatePct: Math.round(conversionRate * 100) / 100,
    }
  }
}

function sumByCurrency(
  rows: { amount: bigint | number; currency: string }[],
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) out[r.currency] = (out[r.currency] ?? 0) + Number(r.amount)
  return out
}

function bucketAging(
  invoices: { total: bigint | number; currency: string; dueDate: Date | null }[],
): Record<string, Record<string, number>> {
  const now = Date.now()
  const buckets: Record<string, Record<string, number>> = {
    current: {},
    '1-30': {},
    '31-60': {},
    '61-90': {},
    '90+': {},
  }
  for (const inv of invoices) {
    if (!inv.dueDate) continue
    const days = Math.floor((now - inv.dueDate.getTime()) / 86400000)
    const bucket =
      days <= 0
        ? 'current'
        : days <= 30
          ? '1-30'
          : days <= 60
            ? '31-60'
            : days <= 90
              ? '61-90'
              : '90+'
    buckets[bucket]![inv.currency] = (buckets[bucket]![inv.currency] ?? 0) + Number(inv.total)
  }
  return buckets
}
