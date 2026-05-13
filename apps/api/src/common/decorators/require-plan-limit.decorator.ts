import { SetMetadata } from '@nestjs/common'

export const REQUIRE_PLAN_LIMIT_KEY = 'requirePlanLimit'

export interface RequirePlanLimitMetadata {
  feature: string
  label: string
}

/**
 * Restrict a route to require a specific plan feature.
 * Usage: @RequirePlanLimit('contentStudio', 'Content Studio')
 */
export const RequirePlanLimit = (feature: string, label: string): ReturnType<typeof SetMetadata> =>
  SetMetadata(REQUIRE_PLAN_LIMIT_KEY, { feature, label } as RequirePlanLimitMetadata)
