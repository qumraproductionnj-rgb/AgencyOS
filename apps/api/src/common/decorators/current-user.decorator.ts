import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { Tier } from '../../auth/services/token.service'

export interface CurrentUserPayload {
  sub: string
  companyId: string | null
  tier: Tier
  jti: string
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload | undefined => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>()
    return req.user
  },
)
