import { SetMetadata } from '@nestjs/common'

export const REQUIRED_ROLES_KEY = 'requiredRoles'

export const RequireRole = (...roles: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(REQUIRED_ROLES_KEY, roles)
