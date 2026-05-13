import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import type { CurrentUserPayload } from '../decorators/current-user.decorator'
import {
  REQUIRE_PLAN_LIMIT_KEY,
  type RequirePlanLimitMetadata,
} from '../decorators/require-plan-limit.decorator'
import { SubscriptionService } from '../../subscriptions/subscription.service'

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequirePlanLimitMetadata>(
      REQUIRE_PLAN_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (!required) return true

    const req = context.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>()
    const user = req.user
    if (!user || !user.companyId) {
      return true
    }

    await this.subscriptionService.requireFeatureAccess(
      user.companyId,
      required.feature,
      required.label,
    )

    return true
  }
}
