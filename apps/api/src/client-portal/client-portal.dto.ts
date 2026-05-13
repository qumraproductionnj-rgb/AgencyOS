import { z } from 'zod'

export const CreateAnnotationSchema = z.object({
  annotationType: z.enum(['timestamp', 'region', 'page_region', 'text']),
  content: z.string().min(1).max(5000),
  timestampSeconds: z.number().int().min(0).optional(),
  regionX: z.number().int().min(0).optional(),
  regionY: z.number().int().min(0).optional(),
  regionW: z.number().int().min(0).optional(),
  regionH: z.number().int().min(0).optional(),
  pageNumber: z.number().int().min(1).optional(),
  pageRegion: z
    .object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    })
    .optional(),
})

export const RequestRevisionSchema = z.object({
  feedback: z.string().min(1).max(5000),
})

export type CreateAnnotationDto = z.infer<typeof CreateAnnotationSchema>
export type RequestRevisionDto = z.infer<typeof RequestRevisionSchema>
