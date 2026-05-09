import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { AuditService } from './audit.service'

@ApiTags('audit-logs')
@ApiBearerAuth()
@Controller({ path: 'audit-logs', version: '1' })
@RequireTier('TENANT')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @RequireRole('owner', 'admin')
  @ApiOperation({ summary: 'List audit logs (Owner/Admin only)' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.audit.findAll(user.companyId!, {
      ...(entityType ? { entityType } : {}),
      ...(userId ? { userId } : {}),
      ...(limit ? { limit: Number(limit) } : {}),
      ...(cursor ? { cursor } : {}),
    })
  }
}
