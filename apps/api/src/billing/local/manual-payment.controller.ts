import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ManualPaymentService } from './manual-payment.service'
import { PaymentIntentService } from './payment-intent.service'
import { RejectManualPaymentSchema } from './local-billing.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequireTier } from '../../common/decorators/require-tier.decorator'
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../common/decorators/current-user.decorator'

/**
 * Manual-payment admin endpoints — PLATFORM_ADMIN only.
 *
 * AgencyOS operators review bank-transfer receipts here. Tenant owners cannot self-approve;
 * the tier guard enforces this independent of role checks.
 */
@Controller({ path: 'billing/iqd/admin', version: '1' })
@UseGuards(JwtAuthGuard)
@RequireTier('PLATFORM_ADMIN')
export class ManualPaymentController {
  constructor(
    private readonly manual: ManualPaymentService,
    private readonly intents: PaymentIntentService,
  ) {}

  @Get('pending')
  async listPending(@Query('limit') limit?: string) {
    const parsed = limit ? Math.max(1, Math.min(parseInt(limit, 10) || 50, 200)) : 50
    return this.intents.listAwaitingVerification(parsed)
  }

  @Post('approve/:id')
  async approve(@CurrentUser() user: CurrentUserPayload, @Param('id') intentId: string) {
    return this.manual.approve({ intentId, adminUserId: user.sub })
  }

  @Post('reject/:id')
  async reject(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') intentId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const dto = RejectManualPaymentSchema.parse(body)
    return this.manual.reject({ intentId, adminUserId: user.sub, reason: dto.reason })
  }
}
