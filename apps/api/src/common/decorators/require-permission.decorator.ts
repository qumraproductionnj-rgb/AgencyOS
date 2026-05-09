import { SetMetadata } from '@nestjs/common'

export const REQUIRE_PERMISSION_KEY = 'requirePermission'

export interface RequirePermissionMetadata {
  resource: string
  action: string
}

export const RequirePermission = (
  resource: string,
  action: string,
): ReturnType<typeof SetMetadata> =>
  SetMetadata(REQUIRE_PERMISSION_KEY, { resource, action } satisfies RequirePermissionMetadata)
