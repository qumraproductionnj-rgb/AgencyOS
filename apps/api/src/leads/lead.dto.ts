import { z } from 'zod'

export const CreateLeadSchema = z.object({
  name: z.string().min(1).max(200),
  companyName: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  source: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
})

export const UpdateLeadSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  companyName: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  source: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
})

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
})

export type CreateLeadDto = z.infer<typeof CreateLeadSchema>
export type UpdateLeadDto = z.infer<typeof UpdateLeadSchema>
export type UpdateLeadStatusDto = z.infer<typeof UpdateLeadStatusSchema>
