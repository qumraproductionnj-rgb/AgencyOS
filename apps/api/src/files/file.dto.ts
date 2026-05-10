import { z } from 'zod'

export const FileQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  search: z.string().optional(),
})

export const UpdateFileSchema = z.object({
  isVisibleToClient: z.boolean().optional(),
})

export const InitUploadSchema = z.object({
  originalName: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(200),
  sizeBytes: z.number().int().nonnegative(),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
  isVisibleToClient: z.boolean().default(false),
})

export type FileQueryDto = z.infer<typeof FileQuerySchema>
export type UpdateFileDto = z.infer<typeof UpdateFileSchema>
export type InitUploadDto = z.infer<typeof InitUploadSchema>
