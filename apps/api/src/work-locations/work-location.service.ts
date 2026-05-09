import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { CreateWorkLocationDto, UpdateWorkLocationDto } from './work-location.dto'

@Injectable()
export class WorkLocationService {
  private readonly logger = new Logger(WorkLocationService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.tenant.workLocation.findMany({
      where: { companyId, deletedAt: null },
      include: {
        _count: { select: { workLocationEmployees: true } },
        workLocationEmployees: {
          include: { employee: { select: { id: true, fullNameAr: true, employeeCode: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const loc = await this.prisma.tenant.workLocation.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        workLocationEmployees: {
          include: {
            employee: {
              select: { id: true, fullNameAr: true, employeeCode: true, departmentId: true },
            },
          },
        },
      },
    })
    if (!loc) throw new NotFoundException('Work location not found')
    return loc
  }

  async create(companyId: string, dto: CreateWorkLocationDto, userId: string) {
    const { employeeIds, ...data } = dto
    const loc = await this.prisma.tenant.workLocation.create({
      data: {
        companyId,
        name: data.name,
        address: data.address ?? null,
        latitude: data.latitude,
        longitude: data.longitude,
        radiusMeters: data.radiusMeters,
        isActive: data.isActive,
        createdBy: userId,
        ...(employeeIds?.length
          ? {
              workLocationEmployees: {
                createMany: {
                  data: employeeIds.map((eId) => ({ companyId, employeeId: eId })),
                },
              },
            }
          : {}),
      },
      include: {
        workLocationEmployees: {
          include: { employee: { select: { id: true, fullNameAr: true, employeeCode: true } } },
        },
      },
    })
    this.logger.log(`Work location created: ${loc.id} in company ${companyId}`)
    return loc
  }

  async update(companyId: string, id: string, dto: UpdateWorkLocationDto, userId: string) {
    await this.findOne(companyId, id)
    const { employeeIds, ...fields } = dto
    const data: Record<string, unknown> = { updatedBy: userId }
    if (fields.name !== undefined) data['name'] = fields.name
    if (fields.address !== undefined) data['address'] = fields.address
    if (fields.latitude !== undefined) data['latitude'] = fields.latitude
    if (fields.longitude !== undefined) data['longitude'] = fields.longitude
    if (fields.radiusMeters !== undefined) data['radiusMeters'] = fields.radiusMeters
    if (fields.isActive !== undefined) data['isActive'] = fields.isActive

    await this.prisma.tenant.workLocation.update({
      where: { id },
      data: data as never,
    })

    if (employeeIds !== undefined) {
      await this.prisma.tenant.workLocationEmployee.deleteMany({
        where: { workLocationId: id, companyId },
      })
      if (employeeIds.length > 0) {
        await this.prisma.tenant.workLocationEmployee.createMany({
          data: employeeIds.map((eId) => ({ companyId, workLocationId: id, employeeId: eId })),
        })
      }
    }

    this.logger.log(`Work location updated: ${id}`)
    return this.findOne(companyId, id)
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    const loc = await this.prisma.tenant.workLocation.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Work location soft-deleted: ${id}`)
    return loc
  }

  async assignEmployees(companyId: string, id: string, employeeIds: string[]) {
    await this.findOne(companyId, id)
    const existing = await this.prisma.tenant.workLocationEmployee.findMany({
      where: { workLocationId: id, companyId, employeeId: { in: employeeIds } },
    })
    const existingIds = new Set(existing.map((e) => e.employeeId))
    const newIds = employeeIds.filter((eId) => !existingIds.has(eId))
    if (newIds.length > 0) {
      await this.prisma.tenant.workLocationEmployee.createMany({
        data: newIds.map((eId) => ({ companyId, workLocationId: id, employeeId: eId })),
      })
    }
    this.logger.log(`Assigned ${newIds.length} employees to location ${id}`)
    return this.findOne(companyId, id)
  }

  async unassignEmployee(companyId: string, id: string, employeeId: string) {
    const result = await this.prisma.tenant.workLocationEmployee.deleteMany({
      where: { workLocationId: id, companyId, employeeId },
    })
    if (result.count === 0) throw new NotFoundException('Employee not assigned to this location')
    this.logger.log(`Unassigned employee ${employeeId} from location ${id}`)
    return this.findOne(companyId, id)
  }
}
