import { z } from 'zod'

export const CreateContentPillarSchema = z.object({
  clientId: z.string().uuid(),
  nameAr: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(100).optional(),
  percentageTarget: z.number().int().min(0).max(100).optional(),
  exampleTopics: z.array(z.string().max(200)).max(20).optional(),
  recommendedFormats: z.array(z.string().max(50)).max(10).optional(),
})

export const UpdateContentPillarSchema = z.object({
  nameAr: z.string().min(1).max(200).optional(),
  nameEn: z.string().max(200).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  icon: z.string().max(100).nullable().optional(),
  percentageTarget: z.number().int().min(0).max(100).nullable().optional(),
  exampleTopics: z.array(z.string().max(200)).max(20).optional(),
  recommendedFormats: z.array(z.string().max(50)).max(10).optional(),
})

export const ContentPillarQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
})

export type CreateContentPillarDto = z.infer<typeof CreateContentPillarSchema>
export type UpdateContentPillarDto = z.infer<typeof UpdateContentPillarSchema>
export type ContentPillarQueryDto = z.infer<typeof ContentPillarQuerySchema>
