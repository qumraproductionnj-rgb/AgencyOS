import { z } from 'zod'

export const CreateCheckoutSessionSchema = z.object({
  planKey: z.enum(['starter', 'professional', 'agency']),
  interval: z.enum(['month', 'year']).default('month'),
})
export type CreateCheckoutSessionDto = z.infer<typeof CreateCheckoutSessionSchema>

export const ChangeBillingPlanSchema = z.object({
  planKey: z.enum(['starter', 'professional', 'agency']),
  interval: z.enum(['month', 'year']).default('month'),
})
export type ChangeBillingPlanDto = z.infer<typeof ChangeBillingPlanSchema>

export const CancelSubscriptionSchema = z.object({
  atPeriodEnd: z.boolean().default(true),
})
export type CancelSubscriptionDto = z.infer<typeof CancelSubscriptionSchema>
