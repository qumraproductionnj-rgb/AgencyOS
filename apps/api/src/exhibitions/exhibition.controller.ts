import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common'
import { ExhibitionService } from './exhibition.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'

@Controller('api/v1/exhibitions')
@UseGuards(JwtAuthGuard)
@RequireTier('TENANT')
export class ExhibitionController {
  constructor(private readonly exhibitionService: ExhibitionService) {}

  // ---- Exhibition CRUD ----

  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.exhibitionService.findAll(user.companyId!, {
      status: status ?? undefined,
      search: search ?? undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor: cursor ?? undefined,
    })
  }

  @Get(':id')
  async findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.exhibitionService.findOne(user.companyId!, id)
  }

  @Post()
  async create(@CurrentUser() user: CurrentUserPayload, @Body() body: Record<string, unknown>) {
    const { CreateExhibitionSchema } = await import('./exhibition.dto')
    const dto = CreateExhibitionSchema.parse(body)
    return this.exhibitionService.create(user.companyId!, user.sub, dto as never)
  }

  @Put(':id')
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { UpdateExhibitionSchema } = await import('./exhibition.dto')
    const dto = UpdateExhibitionSchema.parse(body)
    return this.exhibitionService.update(
      user.companyId!,
      id,
      user.sub,
      dto as Record<string, unknown>,
    )
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { UpdateExhibitionStatusSchema } = await import('./exhibition.dto')
    const dto = UpdateExhibitionStatusSchema.parse(body)
    return this.exhibitionService.updateStatus(user.companyId!, id, user.sub, dto.status)
  }

  @Delete(':id')
  async remove(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    await this.exhibitionService.remove(user.companyId!, id)
    return { message: 'Exhibition deleted successfully' }
  }

  // ---- Booths ----

  @Get(':exhibitionId/booths')
  async findBooths(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
  ) {
    return this.exhibitionService.findBooths(user.companyId!, exhibitionId)
  }

  @Post(':exhibitionId/booths')
  async createBooth(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { CreateBoothSchema } = await import('./exhibition.dto')
    const dto = CreateBoothSchema.parse(body)
    return this.exhibitionService.createBooth(user.companyId!, user.sub, exhibitionId, dto as never)
  }

  @Put(':exhibitionId/booths/:boothId')
  async updateBooth(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Param('boothId') boothId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { UpdateBoothSchema } = await import('./exhibition.dto')
    const dto = UpdateBoothSchema.parse(body)
    return this.exhibitionService.updateBooth(
      user.companyId!,
      exhibitionId,
      boothId,
      dto as Record<string, unknown>,
    )
  }

  @Delete(':exhibitionId/booths/:boothId')
  async deleteBooth(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Param('boothId') boothId: string,
  ) {
    await this.exhibitionService.deleteBooth(user.companyId!, exhibitionId, boothId)
    return { message: 'Booth deleted successfully' }
  }

  // ---- Inventory ----

  @Get(':exhibitionId/booths/:boothId/inventory')
  async findInventory(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Param('boothId') boothId: string,
  ) {
    return this.exhibitionService.findInventory(user.companyId!, exhibitionId, boothId)
  }

  @Post(':exhibitionId/booths/:boothId/inventory')
  async createInventory(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Param('boothId') boothId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { CreateInventorySchema } = await import('./exhibition.dto')
    const dto = CreateInventorySchema.parse(body)
    return this.exhibitionService.createInventory(
      user.companyId!,
      user.sub,
      exhibitionId,
      boothId,
      dto as never,
    )
  }

  @Put(':exhibitionId/booths/:boothId/inventory/:inventoryId')
  async updateInventory(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Param('boothId') boothId: string,
    @Param('inventoryId') inventoryId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { UpdateInventorySchema } = await import('./exhibition.dto')
    const dto = UpdateInventorySchema.parse(body)
    return this.exhibitionService.updateInventory(
      user.companyId!,
      exhibitionId,
      boothId,
      inventoryId,
      dto as Record<string, unknown>,
    )
  }

  @Delete(':exhibitionId/booths/:boothId/inventory/:inventoryId')
  async deleteInventory(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Param('boothId') boothId: string,
    @Param('inventoryId') inventoryId: string,
  ) {
    await this.exhibitionService.deleteInventory(
      user.companyId!,
      exhibitionId,
      boothId,
      inventoryId,
    )
    return { message: 'Inventory item deleted' }
  }

  // ---- Financials ----

  @Get(':exhibitionId/financials')
  async findFinancials(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
  ) {
    return this.exhibitionService.findFinancials(user.companyId!, exhibitionId)
  }

  @Post(':exhibitionId/financials')
  async createFinancial(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { CreateFinancialSchema } = await import('./exhibition.dto')
    const dto = CreateFinancialSchema.parse(body)
    return this.exhibitionService.createFinancial(
      user.companyId!,
      user.sub,
      exhibitionId,
      dto as never,
    )
  }

  @Put(':exhibitionId/financials/:financialId')
  async updateFinancial(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Param('financialId') financialId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { UpdateFinancialSchema } = await import('./exhibition.dto')
    const dto = UpdateFinancialSchema.parse(body)
    return this.exhibitionService.updateFinancial(
      user.companyId!,
      exhibitionId,
      financialId,
      dto as Record<string, unknown>,
    )
  }

  @Delete(':exhibitionId/financials/:financialId')
  async deleteFinancial(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
    @Param('financialId') financialId: string,
  ) {
    await this.exhibitionService.deleteFinancial(user.companyId!, exhibitionId, financialId)
    return { message: 'Financial entry deleted' }
  }

  // ---- Settlement ----

  @Get(':exhibitionId/settlement')
  async getSettlement(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
  ) {
    return this.exhibitionService.getSettlement(user.companyId!, exhibitionId)
  }

  @Post(':exhibitionId/settle')
  async createSettlement(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exhibitionId') exhibitionId: string,
  ) {
    return this.exhibitionService.createSettlement(user.companyId!, user.sub, exhibitionId)
  }
}
