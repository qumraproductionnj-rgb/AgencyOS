import { z } from 'zod'

export const CreateBetaInviteSchema = z.object({
  email: z.string().email(),
  companyName: z.string().min(2).max(100),
  type: z.enum(['agency', 'production', 'photography', 'social-media']).default('agency'),
  notes: z.string().max(500).optional(),
})

export type CreateBetaInviteDto = z.infer<typeof CreateBetaInviteSchema>

export const AcceptBetaInviteSchema = z.object({
  token: z.string(),
  ownerName: z.string().min(2).max(100),
  password: z.string().min(8).max(100),
})

export type AcceptBetaInviteDto = z.infer<typeof AcceptBetaInviteSchema>
