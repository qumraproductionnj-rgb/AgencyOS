import { z } from 'zod'

export const FrameworkQuerySchema = z.object({
  category: z.string().optional(),
  contentType: z.string().optional(),
  objective: z.string().optional(),
  search: z.string().optional(),
})

export type FrameworkQueryDto = z.infer<typeof FrameworkQuerySchema>
