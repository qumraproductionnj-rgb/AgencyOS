import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common'
import { z } from 'zod'
import { LifecycleService } from './lifecycle.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'

const ExtendTrialSchema = z.object({
  days: z.number().int().min(1).max(90),
})

@Controller({ path: 'lifecycle', version: '1' })
@UseGuards(JwtAuthGuard)
@RequireTier('PLATFORM_ADMIN')
export class LifecycleController {
  constructor(private readonly lifecycle: LifecycleService) {}

  @Post('sweep')
  async runSweep(): Promise<{ ok: true }> {
    await this.lifecycle.runDailySweep()
    return { ok: true }
  }

  @Post(':companyId/extend-trial')
  async extendTrial(
    @CurrentUser() user: CurrentUserPayload,
    @Param('companyId') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const dto = ExtendTrialSchema.parse(body)
    return this.lifecycle.extendTrial({ companyId, days: dto.days, adminUserId: user.sub })
  }

  @Post(':companyId/suspend')
  async suspend(@CurrentUser() user: CurrentUserPayload, @Param('companyId') companyId: string) {
    return this.lifecycle.suspend(companyId, user.sub)
  }

  @Post(':companyId/reactivate')
  async reactivate(@CurrentUser() user: CurrentUserPayload, @Param('companyId') companyId: string) {
    return this.lifecycle.reactivate(companyId, user.sub)
  }
}
