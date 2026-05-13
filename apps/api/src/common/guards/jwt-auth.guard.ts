import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { TokenService, type Tier } from '../../auth/services/token.service'
import type { CurrentUserPayload } from '../decorators/current-user.decorator'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { REQUIRED_TIERS_KEY } from '../decorators/require-tier.decorator'

const VALID_TIERS: Tier[] = ['TENANT', 'PLATFORM_ADMIN', 'EXTERNAL']

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const req = context.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>()
    const auth = req.headers.authorization
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header')
    }
    const token = auth.slice(7).trim()
    if (!token) throw new UnauthorizedException('Empty bearer token')

    // Detect tier from X-Tier header (set by portal/admin apps), fallback to TENANT
    const rawTier = (req.headers['x-tier'] as string | undefined) ?? 'TENANT'
    const tier: Tier = VALID_TIERS.includes(rawTier as Tier) ? (rawTier as Tier) : 'TENANT'

    let claims
    try {
      claims = await this.tokens.verifyAccessToken(token, tier)
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }

    req.user = {
      sub: claims.sub,
      companyId: claims.companyId,
      tier: claims.tier,
      jti: claims.jti,
    }

    const requiredTiers = this.reflector.getAllAndOverride<Tier[]>(REQUIRED_TIERS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (requiredTiers && requiredTiers.length > 0 && !requiredTiers.includes(claims.tier)) {
      throw new ForbiddenException(
        `Tier '${claims.tier}' not permitted for this endpoint (requires ${requiredTiers.join(' | ')})`,
      )
    }

    return true
  }
}
