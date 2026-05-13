import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import type { Request } from 'express'
import type { CurrentUserPayload } from '../decorators/current-user.decorator'
import { PrismaService } from '../../database/prisma.service'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const BLOCKED_STATUSES = new Set(['READ_ONLY', 'SUSPENDED', 'ANONYMIZED'])
const SUSPENDED_STATUSES = new Set(['SUSPENDED', 'ANONYMIZED'])

/**
 * Blocks write operations for tenants in non-active states (Phase 4.4 lifecycle):
 *   - READ_ONLY: writes blocked, reads allowed → returns 403 SUBSCRIPTION_READ_ONLY
 *   - SUSPENDED / ANONYMIZED: all requests blocked → returns 403 SUBSCRIPTION_SUSPENDED
 *
 * Billing endpoints + lifecycle admin endpoints bypass this guard via path allowlist so the
 * tenant can always resubscribe themselves out of a degraded state.
 */
@Injectable()
export class SubscriptionActiveGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>()
    const user = req.user
    if (!user?.companyId || user.tier !== 'TENANT') return true

    // Always allow billing + lifecycle paths so locked tenants can recover.
    const url = req.originalUrl ?? req.url ?? ''
    if (
      url.includes('/billing') ||
      url.includes('/lifecycle') ||
      url.includes('/auth') ||
      url.includes('/me') ||
      url.includes('/subscriptions')
    ) {
      return true
    }

    const sub = await this.prisma.system.subscription.findUnique({
      where: { companyId: user.companyId },
      select: { status: true },
    })
    if (!sub) return true

    if (SUSPENDED_STATUSES.has(sub.status)) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'SUBSCRIPTION_SUSPENDED',
        message: 'Your subscription is suspended. Contact support to reactivate.',
      })
    }

    if (BLOCKED_STATUSES.has(sub.status) && !SAFE_METHODS.has(req.method)) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'SUBSCRIPTION_READ_ONLY',
        message: 'Your subscription is read-only. Resubscribe to make changes.',
      })
    }

    return true
  }
}
