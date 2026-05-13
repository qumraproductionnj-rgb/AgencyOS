import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import { SubscriptionService } from './subscription.service'
import { ChangePlanSchema, CreateTrialSubscriptionSchema } from './subscription.dto'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('api/v1/subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  async listPlans() {
    return this.subscriptionService.findAllPlans()
  }

  @Get('current')
  @RequireTier('TENANT')
  async getCurrentSubscription(@CurrentUser() user: CurrentUserPayload) {
    const subscription = await this.subscriptionService.getCurrentSubscription(user.companyId!)
    if (!subscription) {
      const plan = await this.subscriptionService.getCurrentPlan(user.companyId!)
      return { plan, subscription: null, status: 'NO_SUBSCRIPTION' }
    }
    return subscription
  }

  @Post('trial')
  @RequireTier('TENANT')
  async createTrial(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: Record<string, unknown>,
  ) {
    const dto = CreateTrialSubscriptionSchema.parse(body)
    return this.subscriptionService.createTrialSubscription(
      user.companyId!,
      user.sub,
      undefined,
      dto.trialDays,
    )
  }

  @Patch('change-plan')
  @RequireTier('TENANT')
  @RequireRole('owner')
  async changePlan(@CurrentUser() user: CurrentUserPayload, @Body() body: Record<string, unknown>) {
    const dto = ChangePlanSchema.parse(body)
    return this.subscriptionService.changePlan(user.companyId!, dto.planId, user.sub)
  }

  @Patch('status')
  @RequireTier('TENANT')
  @RequireRole('owner')
  async updateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: Record<string, unknown>,
  ) {
    const { status } = body as { status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED' }
    if (!['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'].includes(status)) {
      throw new BadRequestException('Invalid subscription status')
    }
    return this.subscriptionService.updateStatus(user.companyId!, status, user.sub)
  }

  @Get('feature/:feature')
  @RequireTier('TENANT')
  async checkFeature(@CurrentUser() user: CurrentUserPayload, @Param('feature') feature: string) {
    const access = await this.subscriptionService.checkFeatureAccess(user.companyId!, feature)
    return { feature, accessible: access }
  }
}
