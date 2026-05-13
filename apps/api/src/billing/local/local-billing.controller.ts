import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentIntentService } from './payment-intent.service'
import { ManualPaymentService } from './manual-payment.service'
import { GatewayRegistryService } from './gateways/gateway-registry.service'
import { CreateLocalIntentSchema, SubmitManualReceiptSchema } from './local-billing.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequireTier } from '../../common/decorators/require-tier.decorator'
import { RequireRole } from '../../common/decorators/require-role.decorator'
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../common/decorators/current-user.decorator'
import type { Env } from '../../config/env.validation'

@Controller({ path: 'billing/iqd', version: '1' })
@UseGuards(JwtAuthGuard)
@RequireTier('TENANT')
@RequireRole('owner')
export class LocalBillingController {
  constructor(
    private readonly intents: PaymentIntentService,
    private readonly manual: ManualPaymentService,
    private readonly gateways: GatewayRegistryService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Get('gateways')
  async listGateways() {
    return this.gateways.listAvailable()
  }

  @Post('checkout')
  async createCheckout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: Record<string, unknown>,
  ) {
    const dto = CreateLocalIntentSchema.parse(body)
    const callbackUrl = `${this.config.get('APP_URL', { infer: true })}/api/v1/billing/webhooks/${dto.provider}`
    return this.intents.create({
      companyId: user.companyId!,
      userId: user.sub,
      planKey: dto.planKey,
      interval: dto.interval,
      provider: dto.provider,
      callbackUrl,
    })
  }

  @Get('intent/:id')
  async getIntent(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.intents.findById(id, user.companyId!)
  }

  @Post('manual/:id/submit')
  async submitManualReceipt(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') intentId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const dto = SubmitManualReceiptSchema.parse(body)
    return this.manual.submitReceipt({
      intentId,
      companyId: user.companyId!,
      userId: user.sub,
      receiptFileId: dto.receiptFileId,
      bankReference: dto.bankReference,
    })
  }
}
