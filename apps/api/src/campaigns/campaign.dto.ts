import { z } from 'zod'

export const CreateCampaignSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  budget: z.number().nonnegative().default(0),
  currency: z.string().default('IQD'),
  startDate: z.string(),
  endDate: z.string(),
})

export const UpdateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameEn: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  budget: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const UpdateCampaignStatusSchema = z.object({
  status: z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']),
})

export type CreateCampaignDto = z.infer<typeof CreateCampaignSchema>
export type UpdateCampaignDto = z.infer<typeof UpdateCampaignSchema>
export type UpdateCampaignStatusDto = z.infer<typeof UpdateCampaignStatusSchema>
