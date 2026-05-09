import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { CheckInDto, CheckOutDto } from './attendance.dto'

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name)

  constructor(private readonly prisma: PrismaService) {}

  async checkIn(companyId: string, userId: string, dto: CheckInDto) {
    const employee = await this.prisma.tenant.employee.findFirst({
      where: { companyId, userId, deletedAt: null, status: 'ACTIVE' },
      select: { id: true, scheduledStartTime: true },
    })
    if (!employee) throw new NotFoundException('Active employee record not found')

    const assignedLocations = await this.prisma.tenant.workLocation.findMany({
      where: {
        companyId,
        isActive: true,
        deletedAt: null,
        workLocationEmployees: { some: { employeeId: employee.id } },
      },
    })
    if (!assignedLocations.length) throw new ForbiddenException('No work locations assigned')

    let nearest: { id: string; name: string; distance: number; radiusMeters: number } | null = null
    for (const loc of assignedLocations) {
      const dist = this.haversine(
        dto.latitude,
        dto.longitude,
        Number(loc.latitude),
        Number(loc.longitude),
      )
      if (!nearest || dist < nearest.distance) {
        nearest = { id: loc.id, name: loc.name, distance: dist, radiusMeters: loc.radiusMeters }
      }
    }

    if (!nearest || nearest.distance > nearest.radiusMeters) {
      throw new ForbiddenException({
        status: 'OUT_OF_RANGE',
        distanceMeters: Math.round(nearest?.distance ?? 0),
        allowedRadius: nearest?.radiusMeters ?? 0,
        nearestLocation: nearest?.name ?? 'unknown',
      })
    }

    const graceMinutes = 15
    const now = new Date()
    const parts = employee.scheduledStartTime.split(':')
    const sh = Number(parts[0]) || 9
    const sm = Number(parts[1]) || 0
    const scheduled = new Date(now)
    scheduled.setHours(sh, sm + graceMinutes, 0, 0)
    const status = now <= scheduled ? 'PRESENT' : 'LATE'

    const record = await this.prisma.tenant.attendanceRecord.create({
      data: {
        companyId,
        employeeId: employee.id,
        workLocationId: nearest.id,
        checkInTime: now,
        checkInLat: dto.latitude,
        checkInLng: dto.longitude,
        checkInDistanceM: Math.round(nearest.distance),
        ...(dto.deviceInfo ? { deviceInfo: dto.deviceInfo } : {}),
        status,
        createdBy: userId,
      },
    })
    this.logger.log(`Check-in: ${employee.id} at ${nearest.name} (${status})`)
    return record
  }

  async checkOut(companyId: string, userId: string, dto: CheckOutDto) {
    const employee = await this.prisma.tenant.employee.findFirst({
      where: { companyId, userId, deletedAt: null },
      select: { id: true },
    })
    if (!employee) throw new NotFoundException('Employee not found')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const record = await this.prisma.tenant.attendanceRecord.findFirst({
      where: {
        companyId,
        employeeId: employee.id,
        checkInTime: { gte: today },
        checkOutTime: null,
      },
    })
    if (!record) throw new NotFoundException('No active check-in found for today')

    const now = new Date()
    const hours = (now.getTime() - record.checkInTime.getTime()) / 3_600_000

    const updated = await this.prisma.tenant.attendanceRecord.update({
      where: { id: record.id },
      data: {
        checkOutTime: now,
        checkOutLat: dto.latitude ?? null,
        checkOutLng: dto.longitude ?? null,
        workHoursCalculated: Math.round(hours * 100) / 100,
        updatedBy: userId,
      },
    })
    this.logger.log(`Check-out: ${employee.id} (${hours.toFixed(2)}h)`)
    return updated
  }

  async getToday(companyId: string, userId: string) {
    const employee = await this.prisma.tenant.employee.findFirst({
      where: { companyId, userId, deletedAt: null },
      select: { id: true },
    })
    if (!employee) throw new NotFoundException('Employee not found')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return this.prisma.tenant.attendanceRecord.findFirst({
      where: { companyId, employeeId: employee.id, checkInTime: { gte: today } },
      include: { workLocation: { select: { id: true, name: true } } },
      orderBy: { checkInTime: 'desc' },
    })
  }

  async getTodayAll(companyId: string, departmentId?: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const whereEmployee: Record<string, unknown> = { companyId, deletedAt: null }
    if (departmentId) whereEmployee['departmentId'] = departmentId

    return this.prisma.tenant.employee.findMany({
      where: whereEmployee as never,
      select: {
        id: true,
        employeeCode: true,
        fullNameAr: true,
        department: { select: { id: true, nameAr: true } },
        attendanceRecords: {
          where: { checkInTime: { gte: today } },
          orderBy: { checkInTime: 'desc' },
          take: 1,
          include: { workLocation: { select: { id: true, name: true } } },
        },
      },
      orderBy: { fullNameAr: 'asc' },
    })
  }

  async override(
    companyId: string,
    userId: string,
    recordId: string,
    status: string,
    reason: string,
  ) {
    const record = await this.prisma.tenant.attendanceRecord.findFirst({
      where: { id: recordId, companyId },
    })
    if (!record) throw new NotFoundException('Attendance record not found')
    const updated = await this.prisma.tenant.attendanceRecord.update({
      where: { id: recordId },
      data: {
        status: status as never,
        overrideReason: reason,
        overrideByUserId: userId,
        updatedBy: userId,
      },
    })
    this.logger.log(`Attendance override: ${recordId} → ${status} by ${userId}`)
    return updated
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6_371_000
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }
}
