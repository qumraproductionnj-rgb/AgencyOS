import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { IntegrationService } from './integration.service'

@UseGuards(JwtAuthGuard)
@Controller('v1/integrations')
export class IntegrationController {
  constructor(private readonly service: IntegrationService) {}

  @Get('calendar')
  async getCalendar(
    @Req() req: { user: { companyId: string } },
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.service.getCalendar(
      req.user.companyId,
      month ? parseInt(month, 10) : undefined,
      year ? parseInt(year, 10) : undefined,
    )
  }

  @Get('equipment-suggestions/:contentType')
  async getEquipmentSuggestions(@Param('contentType') contentType: string) {
    return this.service.getEquipmentSuggestions(contentType)
  }

  @Get('piece-equipment/:pieceId')
  async getPieceEquipmentSuggestions(
    @Req() req: { user: { companyId: string } },
    @Param('pieceId') pieceId: string,
  ) {
    return this.service.getPieceEquipmentSuggestions(req.user.companyId, pieceId)
  }
}
