import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type {
  CreatePerformanceReviewDto,
  UpdatePerformanceReviewDto,
} from './performance-review.dto'

@Injectable()
export class PerformanceReviewService {
  private readonly logger = new Logger(PerformanceReviewService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, userId: string, employeeId?: string) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }

    if (employeeId) {
      where['employeeId'] = employeeId
    } else {
      const employee = await this.prisma.tenant.employee.findFirst({
        where: { companyId, userId, deletedAt: null },
      })
      if (employee) where['employeeId'] = employee.id
    }

    return this.prisma.tenant.performanceReview.findMany({
      where: where as never,
      include: {
        employee: {
          select: { id: true, fullNameAr: true, fullNameEn: true, employeeCode: true },
        },
        reviewer: {
          select: { id: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const review = await this.prisma.tenant.performanceReview.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        employee: {
          select: {
            id: true,
            fullNameAr: true,
            fullNameEn: true,
            employeeCode: true,
            position: true,
          },
        },
        reviewer: {
          select: { id: true, email: true },
        },
      },
    })
    if (!review) throw new NotFoundException('Performance review not found')
    return review
  }

  async create(companyId: string, userId: string, dto: CreatePerformanceReviewDto) {
    const scores = dto.kpis.map((k) => k.score)
    const overall = scores.reduce((a, b) => a + b, 0) / scores.length

    const review = await this.prisma.tenant.performanceReview.create({
      data: {
        companyId,
        employeeId: dto.employeeId,
        reviewerId: userId,
        reviewDate: new Date(dto.reviewDate),
        overallScore: overall,
        kpis: dto.kpis as unknown as Record<string, unknown>[],
        strengths: dto.strengths ?? null,
        improvements: dto.improvements ?? null,
        notes: dto.notes ?? null,
        createdBy: userId,
      },
      include: {
        employee: {
          select: { id: true, fullNameAr: true, fullNameEn: true, employeeCode: true },
        },
        reviewer: {
          select: { id: true, email: true },
        },
      },
    })

    this.logger.log(`Performance review created: ${review.id}`)
    return review
  }

  async update(companyId: string, id: string, userId: string, dto: UpdatePerformanceReviewDto) {
    await this.findOne(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }

    if (dto.reviewDate) updateData['reviewDate'] = new Date(dto.reviewDate)
    if (dto.kpis) {
      const scores = dto.kpis.map((k) => k.score)
      updateData['overallScore'] = scores.reduce((a, b) => a + b, 0) / scores.length
      updateData['kpis'] = dto.kpis as unknown as Record<string, unknown>[]
    }
    if (dto.strengths !== undefined) updateData['strengths'] = dto.strengths
    if (dto.improvements !== undefined) updateData['improvements'] = dto.improvements
    if (dto.notes !== undefined) updateData['notes'] = dto.notes

    const updated = await this.prisma.tenant.performanceReview.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: { id: true, fullNameAr: true, fullNameEn: true, employeeCode: true },
        },
        reviewer: {
          select: { id: true, email: true },
        },
      },
    })

    this.logger.log(`Performance review updated: ${id}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.performanceReview.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Performance review deleted: ${id}`)
  }
}
