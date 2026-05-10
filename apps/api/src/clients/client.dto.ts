import { z } from 'zod'

export const CreateClientSchema = z.object({
  name: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  website: z.string().max(200).optional(),
  isVip: z.boolean().optional(),
  isBlacklisted: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
})

export const UpdateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameEn: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  website: z.string().max(200).optional(),
  isVip: z.boolean().optional(),
  isBlacklisted: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
})

export const CreateContactSchema = z.object({
  name: z.string().min(1).max(200),
  position: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  isPrimary: z.boolean().optional(),
})

export const UpdateContactSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  position: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  isPrimary: z.boolean().optional(),
})

export type CreateClientDto = z.infer<typeof CreateClientSchema>
export type UpdateClientDto = z.infer<typeof UpdateClientSchema>
export type CreateContactDto = z.infer<typeof CreateContactSchema>
export type UpdateContactDto = z.infer<typeof UpdateContactSchema>
