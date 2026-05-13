import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common'
import { z } from 'zod'
import { WhiteLabelService } from './white-label.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { Public } from '../common/decorators/public.decorator'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'

const UpdateSchema = z.object({
  customSubdomain: z.string().nullable().optional(),
  customDomain: z.string().nullable().optional(),
  brandPrimaryColor: z.string().nullable().optional(),
  brandSecondaryColor: z.string().nullable().optional(),
  hidePoweredBy: z.boolean().optional(),
})

@Controller({ path: 'white-label', version: '1' })
export class WhiteLabelController {
  constructor(private readonly service: WhiteLabelService) {}

  @Get('public')
  @Public()
  async public(@Query('host') host: string) {
    if (!host) return null
    return this.service.resolveByHost(host)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @RequireTier('TENANT')
  get(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getBranding(user.companyId!)
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @RequireTier('TENANT')
  @RequireRole('owner')
  update(@CurrentUser() user: CurrentUserPayload, @Body() body: Record<string, unknown>) {
    const dto = UpdateSchema.parse(body)
    return this.service.update({
      companyId: user.companyId!,
      userId: user.sub,
      ...(dto.customSubdomain !== undefined ? { customSubdomain: dto.customSubdomain } : {}),
      ...(dto.customDomain !== undefined ? { customDomain: dto.customDomain } : {}),
      ...(dto.brandPrimaryColor !== undefined ? { brandPrimaryColor: dto.brandPrimaryColor } : {}),
      ...(dto.brandSecondaryColor !== undefined
        ? { brandSecondaryColor: dto.brandSecondaryColor }
        : {}),
      ...(dto.hidePoweredBy !== undefined ? { hidePoweredBy: dto.hidePoweredBy } : {}),
    })
  }
}
