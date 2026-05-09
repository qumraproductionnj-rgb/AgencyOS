import { SetMetadata } from '@nestjs/common'
import type { Tier } from '../../auth/services/token.service'

export const REQUIRED_TIERS_KEY = 'requiredTiers'

/** Restrict a route to one or more JWT tiers. */
export const RequireTier = (...tiers: Tier[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(REQUIRED_TIERS_KEY, tiers)
