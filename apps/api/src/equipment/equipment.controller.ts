import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common'
import { EquipmentService } from './equipment.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'

@Controller('api/v1/equipment')
@UseGuards(JwtAuthGuard)
@RequireTier('TENANT')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.equipmentService.findAll(user.companyId!, {
      category: category ?? undefined,
      status: status ?? undefined,
      search: search ?? undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor: cursor ?? undefined,
    })
  }

  @Get(':id')
  async findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.equipmentService.findOne(user.companyId!, id)
  }

  @Post()
  async create(@CurrentUser() user: CurrentUserPayload, @Body() body: Record<string, unknown>) {
    const { CreateEquipmentSchema } = await import('./equipment.dto')
    const dto = CreateEquipmentSchema.parse(body)
    return this.equipmentService.create(user.companyId!, user.sub, dto as never)
  }

  @Put(':id')
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { UpdateEquipmentSchema } = await import('./equipment.dto')
    const dto = UpdateEquipmentSchema.parse(body)
    return this.equipmentService.update(user.companyId!, id, dto as Record<string, unknown>)
  }

  @Delete(':id')
  async remove(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    await this.equipmentService.remove(user.companyId!, id)
    return { message: 'Equipment deleted successfully' }
  }

  @Get(':id/qrcode')
  async getQrCode(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    const dataUrl = await this.equipmentService.getQrCodeDataUrl(user.companyId!, id)
    return { qrCodeUrl: dataUrl }
  }

  @Post(':id/regenerate-qrcode')
  async regenerateQrCode(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    const dataUrl = await this.equipmentService.generateQrCode(user.companyId!, id)
    return { qrCodeUrl: dataUrl }
  }

  @Get(':id/bookings')
  async findBookings(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.equipmentService.findBookings(user.companyId!, id, projectId)
  }

  @Post('bookings')
  async createBooking(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: Record<string, unknown>,
  ) {
    const { CreateBookingSchema } = await import('./equipment.dto')
    const dto = CreateBookingSchema.parse(body)
    return this.equipmentService.createBooking(user.companyId!, user.sub, dto as never)
  }

  @Put('bookings/:id/status')
  async updateBookingStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { UpdateBookingStatusSchema } = await import('./equipment.dto')
    const dto = UpdateBookingStatusSchema.parse(body)
    return this.equipmentService.updateBookingStatus(user.companyId!, id, dto as never)
  }

  @Delete('bookings/:id')
  async deleteBooking(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    await this.equipmentService.deleteBooking(user.companyId!, id)
    return { message: 'Booking deleted' }
  }

  @Get(':id/maintenance')
  async findMaintenance(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.equipmentService.findMaintenance(user.companyId!, id)
  }

  @Post('maintenance')
  async createMaintenance(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: Record<string, unknown>,
  ) {
    const { CreateMaintenanceSchema } = await import('./equipment.dto')
    const dto = CreateMaintenanceSchema.parse(body)
    return this.equipmentService.createMaintenance(user.companyId!, dto as never)
  }

  @Delete('maintenance/:id')
  async deleteMaintenance(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    await this.equipmentService.deleteMaintenance(user.companyId!, id)
    return { message: 'Maintenance record deleted' }
  }

  @Get('suggest/:contentType')
  async suggest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('contentType') contentType: string,
  ) {
    return this.equipmentService.suggestForContentType(user.companyId!, contentType)
  }

  @Get('bookings/all')
  async allBookings(@CurrentUser() user: CurrentUserPayload) {
    return this.equipmentService.findBookings(user.companyId!)
  }
}
