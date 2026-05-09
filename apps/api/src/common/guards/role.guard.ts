import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import type { CurrentUserPayload } from '../decorators/current-user.decorator'
import { REQUIRED_ROLES_KEY } from '../decorators/require-role.decorator'
import { PermissionService } from '../../permissions/permission.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(REQUIRED_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles || requiredRoles.length === 0) return true

    const req = context.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>()
    const user = req.user
    if (!user || !user.companyId) {
      throw new ForbiddenException('Authentication required for role check')
    }

    const allowed = await this.permissionService.userHasRole(
      user.sub,
      user.companyId,
      requiredRoles,
    )
    if (!allowed) {
      throw new ForbiddenException(`Missing required role: ${requiredRoles.join(' | ')}`)
    }

    return true
  }
}
