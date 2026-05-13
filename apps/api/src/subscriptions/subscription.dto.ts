import { z } from 'zod'

export const SubscriptionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  cursor: z.string().uuid().optional(),
})

export const ChangePlanSchema = z.object({
  planId: z.string().uuid(),
})

export const CreateTrialSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  trialDays: z.number().int().min(1).max(90).optional().default(14),
})

export const UpdateSubscriptionSchema = z.object({
  planId: z.string().uuid().optional(),
  status: z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED']).optional(),
  trialEndsAt: z.string().optional(),
  currentPeriodStart: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
})
