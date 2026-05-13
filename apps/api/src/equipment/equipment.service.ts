import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import * as QRCode from 'qrcode'

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ---- Equipment CRUD ----

  async findAll(
    companyId: string,
    query: {
      category?: string | undefined
      status?: string | undefined
      search?: string | undefined
      limit?: number | undefined
      cursor?: string | undefined
    },
  ) {
    const take = Math.min(query.limit ?? 50, 100)
    const where: Record<string, unknown> = { companyId }

    if (query.category) where['category'] = query.category
    if (query.status) where['currentStatus'] = query.status
    if (query.search) {
      where['OR'] = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
        { model: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    if (query.cursor) where['id'] = { lt: query.cursor }

    const items = await this.prisma.tenant.equipment.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      include: { holder: { select: { fullNameAr: true } } },
    })

    const hasMore = items.length > take
    const data = hasMore ? items.slice(0, take) : items
    const nextCursor = hasMore ? data[data.length - 1]!.id : null

    return { items: data, nextCursor }
  }

  async findOne(companyId: string, id: string) {
    const item = await this.prisma.tenant.equipment.findFirst({
      where: { id, companyId },
      include: {
        holder: { select: { fullNameAr: true, fullNameEn: true } },
        bookings: {
          include: { project: { select: { name: true } }, booker: { select: { email: true } } },
          orderBy: { bookingStart: 'desc' },
          take: 20,
        },
        maintenance: { orderBy: { maintenanceDate: 'desc' }, take: 20 },
      },
    })
    if (!item) throw new NotFoundException('Equipment not found')
    return item
  }

  async create(
    companyId: string,
    userId: string,
    dto: {
      name: string
      category: string
      brand?: string
      model?: string
      serialNumber?: string
      purchaseDate?: string
      purchasePrice?: number
      currency?: string
      condition?: string
    },
  ) {
    const equipment = await this.prisma.tenant.equipment.create({
      data: {
        companyId,
        name: dto.name,
        category: dto.category as never,
        brand: dto.brand ?? null,
        model: dto.model ?? null,
        serialNumber: dto.serialNumber ?? null,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        purchasePrice: dto.purchasePrice ? BigInt(dto.purchasePrice) : null,
        currency: dto.currency ?? 'IQD',
        condition: (dto.condition ?? 'GOOD') as never,
        createdBy: userId,
      },
    })

    // Generate QR code
    await this.generateQrCode(companyId, equipment.id)

    this.logger.log(`Equipment created: ${equipment.id} (${dto.name})`)
    return this.findOne(companyId, equipment.id)
  }

  async update(companyId: string, id: string, dto: Record<string, unknown>) {
    await this.findOne(companyId, id)
    const data: Record<string, unknown> = { ...dto }
    if (data['purchaseDate']) data['purchaseDate'] = new Date(data['purchaseDate'] as string)
    if (data['purchasePrice']) data['purchasePrice'] = BigInt(data['purchasePrice'] as number)

    await this.prisma.tenant.equipment.update({
      where: { id },
      data: data as never,
    })
    this.logger.log(`Equipment updated: ${id}`)
    return this.findOne(companyId, id)
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.equipment.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    this.logger.log(`Equipment soft-deleted: ${id}`)
  }

  // ---- QR Code ----

  async generateQrCode(companyId: string, id: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(`${companyId}:${id}`, {
        width: 256,
        margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' },
      })
      await this.prisma.tenant.equipment.update({
        where: { id },
        data: { qrCodeUrl: qrDataUrl },
      })
      return qrDataUrl
    } catch (err) {
      this.logger.warn(
        `QR code generation failed for ${id}: ${err instanceof Error ? err.message : String(err)}`,
      )
      return ''
    }
  }

  async getQrCodeDataUrl(companyId: string, id: string): Promise<string> {
    const item = await this.findOne(companyId, id)
    return item.qrCodeUrl ?? ''
  }

  // ---- Bookings ----

  async findBookings(companyId: string, equipmentId?: string, projectId?: string) {
    const where: Record<string, unknown> = { companyId }
    if (equipmentId) where['equipmentId'] = equipmentId
    if (projectId) where['projectId'] = projectId
    const now = new Date()
    // Mark overdue bookings
    await this.prisma.tenant.equipmentBooking.updateMany({
      where: {
        companyId,
        status: { in: ['CONFIRMED', 'CHECKED_OUT'] as never },
        bookingEnd: { lt: now },
      },
      data: { status: 'OVERDUE' as never },
    })

    return this.prisma.tenant.equipmentBooking.findMany({
      where: where as never,
      orderBy: { bookingStart: 'desc' },
      include: {
        equipment: { select: { name: true, category: true } },
        project: { select: { name: true } },
        booker: { select: { email: true } },
      },
    })
  }

  async createBooking(
    companyId: string,
    userId: string,
    dto: {
      equipmentId: string
      projectId?: string | null
      bookingStart: string
      bookingEnd: string
    },
  ) {
    const start = new Date(dto.bookingStart)
    const end = new Date(dto.bookingEnd)

    if (start >= end) throw new ConflictException('Booking start must be before end')
    if (start < new Date()) throw new ConflictException('Booking start cannot be in the past')

    // Check equipment exists
    const equipment = await this.prisma.tenant.equipment.findFirst({
      where: { id: dto.equipmentId, companyId },
    })
    if (!equipment) throw new NotFoundException('Equipment not found')
    if (equipment.currentStatus === 'RETIRED' || equipment.currentStatus === 'LOST') {
      throw new ConflictException('Equipment is not available for booking')
    }

    // Conflict detection: check overlapping bookings
    const conflicts = await this.prisma.tenant.equipmentBooking.findMany({
      where: {
        companyId,
        equipmentId: dto.equipmentId,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_OUT'] as never },
        bookingStart: { lt: end },
        bookingEnd: { gt: start },
      },
    })
    if (conflicts.length > 0) {
      throw new ConflictException('Equipment is already booked during this time period')
    }

    const booking = await this.prisma.tenant.equipmentBooking.create({
      data: {
        companyId,
        equipmentId: dto.equipmentId,
        projectId: dto.projectId ?? null,
        bookedBy: userId,
        bookingStart: start,
        bookingEnd: end,
      },
    })
    this.logger.log(`Booking created: ${booking.id} for equipment ${dto.equipmentId}`)
    return booking
  }

  async updateBookingStatus(
    companyId: string,
    id: string,
    dto: {
      status: string
      returnConditionNotes?: string
    },
  ) {
    const booking = await this.prisma.tenant.equipmentBooking.findFirst({
      where: { id, companyId },
    })
    if (!booking) throw new NotFoundException('Booking not found')

    const updateData: Record<string, unknown> = { status: dto.status as never }
    if (dto.status === 'CHECKED_OUT') updateData['checkoutAt'] = new Date()
    if (dto.status === 'RETURNED') {
      updateData['returnAt'] = new Date()
      updateData['returnConditionNotes'] = dto.returnConditionNotes ?? null
    }

    await this.prisma.tenant.equipmentBooking.update({
      where: { id },
      data: updateData as never,
    })

    // Sync equipment status
    if (dto.status === 'CONFIRMED' || dto.status === 'CHECKED_OUT') {
      await this.prisma.tenant.equipment.update({
        where: { id: booking.equipmentId },
        data: { currentStatus: 'IN_USE' as never },
      })
    }
    if (dto.status === 'RETURNED' || dto.status === 'CANCELLED') {
      await this.prisma.tenant.equipment.update({
        where: { id: booking.equipmentId },
        data: { currentStatus: 'AVAILABLE' as never },
      })
    }

    this.logger.log(`Booking ${id} status updated to ${dto.status}`)
    return this.prisma.tenant.equipmentBooking.findFirst({
      where: { id },
      include: {
        equipment: { select: { name: true } },
        project: { select: { name: true } },
      },
    })
  }

  async deleteBooking(companyId: string, id: string) {
    const booking = await this.prisma.tenant.equipmentBooking.findFirst({
      where: { id, companyId },
    })
    if (!booking) throw new NotFoundException('Booking not found')

    await this.prisma.tenant.equipmentBooking.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    this.logger.log(`Booking soft-deleted: ${id}`)
  }

  // ---- Maintenance ----

  async findMaintenance(companyId: string, equipmentId?: string) {
    const where: Record<string, unknown> = { companyId }
    if (equipmentId) where['equipmentId'] = equipmentId
    return this.prisma.tenant.equipmentMaintenance.findMany({
      where: where as never,
      orderBy: { maintenanceDate: 'desc' },
      include: { equipment: { select: { name: true, category: true } } },
    })
  }

  async createMaintenance(
    companyId: string,
    dto: {
      equipmentId: string
      maintenanceDate: string
      type: string
      description?: string
      cost?: number
      currency?: string
      performedBy?: string
      nextMaintenanceDate?: string
      receiptUrl?: string
    },
  ) {
    const equipment = await this.prisma.tenant.equipment.findFirst({
      where: { id: dto.equipmentId, companyId },
    })
    if (!equipment) throw new NotFoundException('Equipment not found')

    const maintenance = await this.prisma.tenant.equipmentMaintenance.create({
      data: {
        companyId,
        equipmentId: dto.equipmentId,
        maintenanceDate: new Date(dto.maintenanceDate),
        type: dto.type as never,
        description: dto.description ?? null,
        cost: dto.cost ? BigInt(dto.cost) : null,
        currency: dto.currency ?? 'IQD',
        performedBy: dto.performedBy ?? null,
        nextMaintenanceDate: dto.nextMaintenanceDate ? new Date(dto.nextMaintenanceDate) : null,
        receiptUrl: dto.receiptUrl ?? null,
      },
    })

    // Set equipment to maintenance status if repair
    if (dto.type === 'REPAIR') {
      await this.prisma.tenant.equipment.update({
        where: { id: dto.equipmentId },
        data: { currentStatus: 'MAINTENANCE' as never },
      })
    }

    this.logger.log(`Maintenance record created: ${maintenance.id}`)
    return maintenance
  }

  async deleteMaintenance(companyId: string, id: string) {
    const record = await this.prisma.tenant.equipmentMaintenance.findFirst({
      where: { id, companyId },
    })
    if (!record) throw new NotFoundException('Maintenance record not found')
    await this.prisma.tenant.equipmentMaintenance.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  // ---- Suggest Equipment ----

  async suggestForContentType(companyId: string, contentType: string) {
    const categoryMap: Record<string, string[]> = {
      VIDEO_LONG: ['CAMERA', 'LENS', 'AUDIO', 'LIGHTING', 'GRIP'],
      REEL: ['CAMERA', 'LENS', 'LIGHTING', 'AUDIO'],
      STORY: ['CAMERA', 'LENS', 'LIGHTING'],
      STATIC_DESIGN: ['COMPUTER'],
      CAROUSEL: ['COMPUTER', 'CAMERA'],
      PODCAST: ['AUDIO', 'CAMERA', 'LIGHTING'],
      BLOG_POST: ['COMPUTER'],
      GIF: ['CAMERA', 'COMPUTER'],
    }

    const categories = categoryMap[contentType] ?? ['CAMERA', 'OTHER']
    return this.prisma.tenant.equipment.findMany({
      where: {
        companyId,
        category: { in: categories } as never,
        currentStatus: 'AVAILABLE' as never,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: { holder: { select: { fullNameAr: true } } },
    })
  }
}
