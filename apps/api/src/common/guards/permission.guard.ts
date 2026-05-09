import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import type { CurrentUserPayload } from '../decorators/current-user.decorator'
import {
  REQUIRE_PERMISSION_KEY,
  type RequirePermissionMetadata,
} from '../decorators/require-permission.decorator'
import { PermissionService } from '../../permissions/permission.service'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequirePermissionMetadata>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (!required) return true

    const req = context.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>()
    const user = req.user
    if (!user || !user.companyId) {
      throw new ForbiddenException('Authentication required for permission check')
    }

    const allowed = await this.permissionService.userCan(
      user.sub,
      user.companyId,
      required.resource,
      required.action,
    )
    if (!allowed) {
      throw new ForbiddenException(
        `Missing required permission: ${required.resource}.${required.action}`,
      )
    }

    return true
  }
}
