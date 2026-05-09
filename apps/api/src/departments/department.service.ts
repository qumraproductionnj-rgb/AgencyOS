import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { CreateDepartmentDto, UpdateDepartmentDto } from './department.dto'

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.tenant.department.findMany({
      where: { companyId, deletedAt: null },
      include: { manager: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const dept = await this.prisma.tenant.department.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { manager: { select: { id: true, email: true } } },
    })
    if (!dept) throw new NotFoundException('Department not found')
    return dept
  }

  async create(companyId: string, dto: CreateDepartmentDto, userId: string) {
    const dept = await this.prisma.tenant.department.create({
      data: {
        companyId,
        nameAr: dto.nameAr,
        nameEn: dto.nameEn ?? null,
        description: dto.description ?? null,
        managerUserId: dto.managerUserId ?? null,
        createdBy: userId,
      },
    })
    this.logger.log(`Department created: ${dept.id} in company ${companyId}`)
    return dept
  }

  async update(companyId: string, id: string, dto: UpdateDepartmentDto, userId: string) {
    await this.findOne(companyId, id)
    const data: Record<string, unknown> = { updatedBy: userId }
    if (dto.nameAr !== undefined) data['nameAr'] = dto.nameAr
    if (dto.nameEn !== undefined) data['nameEn'] = dto.nameEn
    if (dto.description !== undefined) data['description'] = dto.description
    if (dto.managerUserId !== undefined) data['managerUserId'] = dto.managerUserId
    const dept = await this.prisma.tenant.department.update({
      where: { id },
      data: data as never,
    })
    this.logger.log(`Department updated: ${id}`)
    return dept
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    const dept = await this.prisma.tenant.department.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Department soft-deleted: ${id}`)
    return dept
  }
}
