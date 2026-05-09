import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import { AuditService } from './audit.service'
import { Request } from 'express'

const SENSITIVE_ACTIONS = new Set(['login', 'logout', 'refresh'])

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>()
    const method = req.method ?? 'GET'
    if (!WRITE_METHODS.has(method)) return next.handle()

    const user = (req as unknown as Record<string, unknown>)['user'] as
      | Record<string, unknown>
      | undefined
    const entityType = this.guessEntityType(req.url ?? '')
    const action = `${method} ${entityType}`.toLowerCase()

    if (SENSITIVE_ACTIONS.has(action) || entityType === 'auth') return next.handle()

    return next.handle().pipe(
      tap(() => {
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip
        const logParams: Record<string, unknown> = { action, entityType }
        if (user?.['companyId']) logParams['companyId'] = user['companyId']
        if (user?.['sub']) logParams['userId'] = user['sub']
        if (ip) logParams['ipAddress'] = ip
        if (req.headers['user-agent']) logParams['userAgent'] = req.headers['user-agent']
        this.audit.log(logParams as never).catch(() => {
          void 0
        })
      }),
      catchError((err) => {
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip
        const logParams: Record<string, unknown> = { action: `${action}_failed`, entityType }
        if (user?.['companyId']) logParams['companyId'] = user['companyId']
        if (user?.['sub']) logParams['userId'] = user['sub']
        if (ip) logParams['ipAddress'] = ip
        if (err?.message) logParams['metadata'] = { error: err.message }
        if (req.headers['user-agent']) logParams['userAgent'] = req.headers['user-agent']
        this.audit.log(logParams as never).catch(() => {
          void 0
        })
        return throwError(() => err)
      }),
    )
  }

  private guessEntityType(url: string): string {
    const clean = url.split('?')[0]?.replace(/^\/api\/v\d+\//, '') ?? url
    const parts = clean.split('/')
    for (const part of parts) {
      if (
        part &&
        !part.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) &&
        !part.match(/^\d+$/) &&
        part !== 'check-in' &&
        part !== 'check-out'
      ) {
        return part
      }
    }
    return clean
  }
}
