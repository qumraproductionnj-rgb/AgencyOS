import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { CreateDepartmentDto, UpdateDepartmentDto } from './department.dto'

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.tenant.department.findMany({
      where: { companyId, deletedAt: null },
      include: {
        manager: { select: { id: true, email: true } },
        _count: { select: { employees: true, children: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findTree(companyId: string) {
    const all = await this.prisma.tenant.department.findMany({
      where: { companyId, deletedAt: null },
      include: {
        manager: { select: { id: true, email: true } },
        _count: { select: { employees: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    type Node = (typeof all)[number] & { children: Node[] }
    const byId = new Map<string, Node>()
    all.forEach((d) => byId.set(d.id, { ...d, children: [] }))
    const roots: Node[] = []
    byId.forEach((node) => {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    })
    return roots
  }

  async findOne(companyId: string, id: string) {
    const dept = await this.prisma.tenant.department.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        manager: { select: { id: true, email: true } },
        parent: { select: { id: true, nameAr: true, nameEn: true } },
        children: { where: { deletedAt: null }, select: { id: true, nameAr: true, nameEn: true } },
      },
    })
    if (!dept) throw new NotFoundException('Department not found')
    return dept
  }

  async create(companyId: string, dto: CreateDepartmentDto, userId: string) {
    if (dto.parentId) await this.assertParentInCompany(companyId, dto.parentId)
    const dept = await this.prisma.tenant.department.create({
      data: {
        companyId,
        nameAr: dto.nameAr,
        nameEn: dto.nameEn ?? null,
        description: dto.description ?? null,
        managerUserId: dto.managerUserId ?? null,
        parentId: dto.parentId ?? null,
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        createdBy: userId,
      },
    })
    if (dto.managerUserId) await this.syncManagerFlag(dto.managerUserId, true)
    this.logger.log(`Department created: ${dept.id} in company ${companyId}`)
    return dept
  }

  async update(companyId: string, id: string, dto: UpdateDepartmentDto, userId: string) {
    const current = await this.findOne(companyId, id)
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('Department cannot be its own parent')
      }
      await this.assertParentInCompany(companyId, dto.parentId)
      await this.assertNoCycle(id, dto.parentId)
    }

    const data: Record<string, unknown> = { updatedBy: userId }
    if (dto.nameAr !== undefined) data['nameAr'] = dto.nameAr
    if (dto.nameEn !== undefined) data['nameEn'] = dto.nameEn
    if (dto.description !== undefined) data['description'] = dto.description
    if (dto.managerUserId !== undefined) data['managerUserId'] = dto.managerUserId
    if (dto.parentId !== undefined) data['parentId'] = dto.parentId
    if (dto.icon !== undefined) data['icon'] = dto.icon
    if (dto.color !== undefined) data['color'] = dto.color

    const dept = await this.prisma.tenant.department.update({
      where: { id },
      data: data as never,
    })

    if (dto.managerUserId !== undefined) {
      if (current.managerUserId && current.managerUserId !== dto.managerUserId) {
        await this.recomputeManagerFlag(current.managerUserId)
      }
      if (dto.managerUserId) await this.syncManagerFlag(dto.managerUserId, true)
    }

    this.logger.log(`Department updated: ${id}`)
    return dept
  }

  async remove(companyId: string, id: string, userId: string) {
    const current = await this.findOne(companyId, id)
    const dept = await this.prisma.tenant.department.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    if (current.managerUserId) await this.recomputeManagerFlag(current.managerUserId)
    this.logger.log(`Department soft-deleted: ${id}`)
    return dept
  }

  private async assertParentInCompany(companyId: string, parentId: string) {
    const parent = await this.prisma.tenant.department.findFirst({
      where: { id: parentId, companyId, deletedAt: null },
      select: { id: true },
    })
    if (!parent) throw new BadRequestException('Parent department not found in this company')
  }

  /// Walk up from the proposed parent. If we encounter `selfId`, the move would create a cycle.
  private async assertNoCycle(selfId: string, proposedParentId: string) {
    let cursor: string | null = proposedParentId
    const visited = new Set<string>()
    while (cursor) {
      if (cursor === selfId) {
        throw new BadRequestException('Move would create a cycle in the department hierarchy')
      }
      if (visited.has(cursor)) break
      visited.add(cursor)
      const next: { parentId: string | null } | null =
        await this.prisma.tenant.department.findUnique({
          where: { id: cursor },
          select: { parentId: true },
        })
      cursor = next?.parentId ?? null
    }
  }

  private async syncManagerFlag(userId: string, isManager: boolean) {
    await this.prisma.tenant.user.update({
      where: { id: userId },
      data: { isManager },
    })
  }

  private async recomputeManagerFlag(userId: string) {
    const stillManaging = await this.prisma.tenant.department.count({
      where: { managerUserId: userId, deletedAt: null },
    })
    await this.prisma.tenant.user.update({
      where: { id: userId },
      data: { isManager: stillManaging > 0 },
    })
  }

  async getOrgStructure(companyId: string) {
    const company = await this.prisma.tenant.company.findUnique({
      where: { id: companyId },
      select: { id: true, orgStructureType: true },
    })
    if (!company) throw new NotFoundException('Company not found')
    return company
  }

  async setOrgStructure(
    companyId: string,
    type: 'FLAT' | 'HIERARCHICAL' | 'HYBRID',
    userId: string,
  ) {
    return this.prisma.tenant.company.update({
      where: { id: companyId },
      data: { orgStructureType: type, updatedBy: userId },
      select: { id: true, orgStructureType: true },
    })
  }
}
