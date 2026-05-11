import { z } from 'zod'

// ─── Audience Persona ──────────────────────────────────

export const CreatePersonaSchema = z.object({
  name: z.string().min(1).max(200),
  ageRange: z.string().max(50).optional(),
  gender: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  occupation: z.string().max(200).optional(),
  incomeLevel: z.string().max(50).optional(),
  interests: z.array(z.string().max(100)).max(20).optional(),
  painPoints: z.array(z.string().max(200)).max(20).optional(),
  goals: z.array(z.string().max(200)).max(20).optional(),
  objections: z.array(z.string().max(200)).max(20).optional(),
  motivations: z.array(z.string().max(200)).max(20).optional(),
  preferredPlatforms: z.array(z.string().max(50)).max(10).optional(),
  contentConsumptionHabits: z.string().max(1000).optional(),
  avatarUrl: z.string().url().max(500).optional(),
})

export const UpdatePersonaSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  ageRange: z.string().max(50).nullable().optional(),
  gender: z.string().max(50).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  occupation: z.string().max(200).nullable().optional(),
  incomeLevel: z.string().max(50).nullable().optional(),
  interests: z.array(z.string().max(100)).max(20).optional(),
  painPoints: z.array(z.string().max(200)).max(20).optional(),
  goals: z.array(z.string().max(200)).max(20).optional(),
  objections: z.array(z.string().max(200)).max(20).optional(),
  motivations: z.array(z.string().max(200)).max(20).optional(),
  preferredPlatforms: z.array(z.string().max(50)).max(10).optional(),
  contentConsumptionHabits: z.string().max(1000).nullable().optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
})

// ─── Brand Brief ───────────────────────────────────────

export const CreateBrandBriefSchema = z.object({
  clientId: z.string().uuid(),
  brandNameAr: z.string().max(300).optional(),
  brandNameEn: z.string().max(300).optional(),
  brandStory: z.string().max(5000).optional(),
  mission: z.string().max(2000).optional(),
  vision: z.string().max(2000).optional(),
  toneOfVoice: z.array(z.string().max(50)).max(10).optional(),
  voiceDos: z.array(z.string().max(500)).max(20).optional(),
  voiceDonts: z.array(z.string().max(500)).max(20).optional(),
  brandKeywords: z.array(z.string().max(100)).max(50).optional(),
  bannedWords: z.array(z.string().max(100)).max(50).optional(),
  primaryColors: z.array(z.string().max(7)).max(20).optional(),
  secondaryColors: z.array(z.string().max(7)).max(20).optional(),
  fonts: z
    .object({
      heading: z.string().optional(),
      body: z.string().optional(),
      accent: z.string().optional(),
    })
    .optional(),
  visualStyle: z.array(z.string().max(200)).max(20).optional(),
  moodKeywords: z.array(z.string().max(100)).max(30).optional(),
  culturalContext: z.string().max(5000).optional(),
  religiousConsiderations: z.string().max(5000).optional(),
  activePlatforms: z.array(z.string().max(50)).max(10).optional(),
  postingFrequency: z.record(z.string(), z.number().int().nonnegative()).optional(),
  competitors: z
    .array(
      z.object({
        name: z.string(),
        socialHandles: z.record(z.string(), z.string()).optional(),
        whatWeDoBetter: z.string().optional(),
      }),
    )
    .max(20)
    .optional(),
  defaultPillarIds: z.array(z.string().uuid()).max(20).optional(),
  personas: z.array(CreatePersonaSchema).max(10).optional(),
})

export const UpdateBrandBriefSchema = z.object({
  brandNameAr: z.string().max(300).nullable().optional(),
  brandNameEn: z.string().max(300).nullable().optional(),
  brandStory: z.string().max(5000).nullable().optional(),
  mission: z.string().max(2000).nullable().optional(),
  vision: z.string().max(2000).nullable().optional(),
  toneOfVoice: z.array(z.string().max(50)).max(10).optional(),
  voiceDos: z.array(z.string().max(500)).max(20).optional(),
  voiceDonts: z.array(z.string().max(500)).max(20).optional(),
  brandKeywords: z.array(z.string().max(100)).max(50).optional(),
  bannedWords: z.array(z.string().max(100)).max(50).optional(),
  primaryColors: z.array(z.string().max(7)).max(20).optional(),
  secondaryColors: z.array(z.string().max(7)).max(20).optional(),
  fonts: z
    .object({
      heading: z.string().optional(),
      body: z.string().optional(),
      accent: z.string().optional(),
    })
    .nullable()
    .optional(),
  visualStyle: z.array(z.string().max(200)).max(20).optional(),
  moodKeywords: z.array(z.string().max(100)).max(30).optional(),
  culturalContext: z.string().max(5000).nullable().optional(),
  religiousConsiderations: z.string().max(5000).nullable().optional(),
  activePlatforms: z.array(z.string().max(50)).max(10).optional(),
  postingFrequency: z.record(z.string(), z.number().int().nonnegative()).nullable().optional(),
  competitors: z
    .array(
      z.object({
        name: z.string(),
        socialHandles: z.record(z.string(), z.string()).optional(),
        whatWeDoBetter: z.string().optional(),
      }),
    )
    .max(20)
    .nullable()
    .optional(),
  defaultPillarIds: z.array(z.string().uuid()).max(20).optional(),
})

export const BrandBriefQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
})

// ─── Types ─────────────────────────────────────────────

export type CreateBrandBriefDto = z.infer<typeof CreateBrandBriefSchema>
export type UpdateBrandBriefDto = z.infer<typeof UpdateBrandBriefSchema>
export type BrandBriefQueryDto = z.infer<typeof BrandBriefQuerySchema>
export type CreatePersonaDto = z.infer<typeof CreatePersonaSchema>
export type UpdatePersonaDto = z.infer<typeof UpdatePersonaSchema>
