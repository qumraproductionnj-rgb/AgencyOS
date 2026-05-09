import { Controller, Get, NotFoundException } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { PrismaService } from '../database/prisma.service'

@ApiTags('me')
@ApiBearerAuth()
@Controller({ path: 'me', version: '1' })
@RequireTier('TENANT')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Current user — JWT claims (no DB call)' })
  whoAmI(@CurrentUser() user: CurrentUserPayload) {
    return {
      userId: user.sub,
      companyId: user.companyId,
      tier: user.tier,
      jti: user.jti,
    }
  }

  @Get('company')
  @ApiOperation({
    summary:
      "Current user's company — RLS-scoped via tenant client (proves cross-tenant isolation)",
  })
  async myCompany() {
    // No companyId in WHERE — RLS policy enforces it via app.current_company_id.
    // If RLS is broken or context is missing, this should return null.
    const company = await this.prisma.tenant.company.findFirst({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true, createdAt: true },
    })
    if (!company) {
      throw new NotFoundException('Company not found (or RLS context missing)')
    }
    return company
  }
}
