import { z } from 'zod'

export const AssetTypeEnum = z.enum([
  'IMAGE',
  'VIDEO',
  'LOGO',
  'BRAND_KIT',
  'MUSIC',
  'FONT',
  'TEMPLATE',
  'DOCUMENT',
])

// ─── Folders ───────────────────────────────────────────

export const CreateFolderSchema = z.object({
  name: z.string().min(1).max(200),
  parentFolderId: z.string().uuid().nullable().optional(),
})

export const UpdateFolderSchema = z.object({
  name: z.string().min(1).max(200),
})

// ─── Asset query ───────────────────────────────────────

export const AssetQuerySchema = z.object({
  folderId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  type: AssetTypeEnum.optional(),
  tags: z.string().optional(),
  isVisibleToClients: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  cursor: z.string().uuid().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => {
      const n = v ? parseInt(v, 10) : 20
      return Math.min(Math.max(n, 1), 100)
    }),
})

// ─── Assets ────────────────────────────────────────────

export const CreateAssetSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  type: AssetTypeEnum,
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  mimeType: z.string().max(100).optional(),
  durationSeconds: z.number().nonnegative().optional(),
  widthPx: z.number().int().nonnegative().optional(),
  heightPx: z.number().int().nonnegative().optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
  linkedProjectIds: z.array(z.string().uuid()).max(50).optional(),
  linkedClientIds: z.array(z.string().uuid()).max(50).optional(),
  isVisibleToClients: z.boolean().optional(),
  folderId: z.string().uuid().nullable().optional(),
})

export const UpdateAssetSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).nullable().optional(),
  type: AssetTypeEnum.optional(),
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  previewUrl: z.string().url().nullable().optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  mimeType: z.string().max(100).nullable().optional(),
  durationSeconds: z.number().nonnegative().nullable().optional(),
  widthPx: z.number().int().nonnegative().nullable().optional(),
  heightPx: z.number().int().nonnegative().nullable().optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
  linkedProjectIds: z.array(z.string().uuid()).max(50).optional(),
  linkedClientIds: z.array(z.string().uuid()).max(50).optional(),
  isVisibleToClients: z.boolean().optional(),
  folderId: z.string().uuid().nullable().optional(),
})

export const MoveAssetSchema = z.object({
  folderId: z.string().uuid().nullable(),
})

// ─── Versions ──────────────────────────────────────────

export const CreateVersionSchema = z.object({
  fileUrl: z.string().url(),
  fileSize: z.number().int().nonnegative(),
  changeNotes: z.string().max(2000).optional(),
})

export const UpdateVersionSchema = z.object({
  changeNotes: z.string().max(2000).optional(),
})

// ─── Types ─────────────────────────────────────────────

export type CreateFolderDto = z.infer<typeof CreateFolderSchema>
export type UpdateFolderDto = z.infer<typeof UpdateFolderSchema>
export type AssetQueryDto = z.infer<typeof AssetQuerySchema>
export type CreateAssetDto = z.infer<typeof CreateAssetSchema>
export type UpdateAssetDto = z.infer<typeof UpdateAssetSchema>
export type MoveAssetDto = z.infer<typeof MoveAssetSchema>
export type CreateVersionDto = z.infer<typeof CreateVersionSchema>
export type UpdateVersionDto = z.infer<typeof UpdateVersionSchema>
