import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { PlatformAdminService } from './platform-admin.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RequireTier } from '../common/decorators/require-tier.decorator'

@Controller({ path: 'platform/admin', version: '1' })
@UseGuards(JwtAuthGuard)
@RequireTier('PLATFORM_ADMIN')
export class PlatformAdminController {
  constructor(private readonly admin: PlatformAdminService) {}

  @Get('stats')
  async getStats() {
    return this.admin.getStats()
  }

  @Get('tenants')
  async listTenants(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.admin.listTenants({
      ...(cursor ? { cursor } : {}),
      ...(limit ? { limit: parseInt(limit, 10) } : {}),
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    })
  }

  @Get('tenants/:id')
  async getTenant(@Param('id') id: string) {
    return this.admin.getTenantDetail(id)
  }

  @Get('admins')
  async listAdmins() {
    return this.admin.listPlatformAdmins()
  }
}
