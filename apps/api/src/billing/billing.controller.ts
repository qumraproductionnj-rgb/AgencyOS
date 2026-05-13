import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { BillingService } from './billing.service'
import {
  CancelSubscriptionSchema,
  ChangeBillingPlanSchema,
  CreateCheckoutSessionSchema,
} from './billing.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'

@Controller({ path: 'billing', version: '1' })
@UseGuards(JwtAuthGuard)
@RequireTier('TENANT')
@RequireRole('owner')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('usage')
  async getUsage(@CurrentUser() user: CurrentUserPayload) {
    return this.billing.getUsage(user.companyId!)
  }

  @Get('invoices')
  async listInvoices(@CurrentUser() user: CurrentUserPayload) {
    return this.billing.listInvoices(user.companyId!)
  }

  @Post('checkout-session')
  async createCheckout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: Record<string, unknown>,
  ) {
    const dto = CreateCheckoutSessionSchema.parse(body)
    return this.billing.startCheckout({
      companyId: user.companyId!,
      userId: user.sub,
      planKey: dto.planKey,
      interval: dto.interval,
    })
  }

  @Post('portal-session')
  async createPortalSession(@CurrentUser() user: CurrentUserPayload) {
    return this.billing.openBillingPortal(user.companyId!)
  }

  @Post('change-plan')
  async changePlan(@CurrentUser() user: CurrentUserPayload, @Body() body: Record<string, unknown>) {
    const dto = ChangeBillingPlanSchema.parse(body)
    return this.billing.changeBillingPlan({
      companyId: user.companyId!,
      userId: user.sub,
      planKey: dto.planKey,
      interval: dto.interval,
    })
  }

  @Post('cancel')
  async cancel(@CurrentUser() user: CurrentUserPayload, @Body() body: Record<string, unknown>) {
    const dto = CancelSubscriptionSchema.parse(body ?? {})
    return this.billing.cancelBilling({
      companyId: user.companyId!,
      userId: user.sub,
      atPeriodEnd: dto.atPeriodEnd,
    })
  }
}
