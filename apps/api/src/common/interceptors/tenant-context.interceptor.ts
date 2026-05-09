import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common'
import type { Request } from 'express'
import { Observable } from 'rxjs'
import { TenantContextService } from '../../database/tenant-context.service'
import type { CurrentUserPayload } from '../decorators/current-user.decorator'

/**
 * Wraps the handler in `AsyncLocalStorage.run()` so the tenant Prisma client
 * (PrismaService.tenant) sees the correct `app.current_company_id` for every
 * downstream query. Must run AFTER JwtAuthGuard so `req.user` is populated.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>()
    const user = req.user
    if (!user || !user.companyId) {
      return next.handle()
    }
    return new Observable((subscriber) => {
      this.tenantContext.run(
        { companyId: user.companyId as string, userId: user.sub, tier: user.tier },
        () => {
          next.handle().subscribe(subscriber)
        },
      )
    })
  }
}
