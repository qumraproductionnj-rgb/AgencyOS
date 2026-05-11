import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { DashboardService } from './dashboard.service'

@ApiTags('dashboard')
@Controller()
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('v1/dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard widgets data' })
  @RequireTier('TENANT')
  async getWidgets(@CurrentUser() user: CurrentUserPayload) {
    return this.dashboard.getWidgets(user.companyId!)
  }
}
