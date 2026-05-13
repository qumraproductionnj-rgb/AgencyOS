import { z } from 'zod'

export const linkTelegramSchema = z.object({})

export const unlinkTelegramSchema = z.object({})

export class LinkTelegramResponseDto {
  token!: string
  botUsername!: string
  deepLink!: string
  expiresInSeconds!: number
}

export class TelegramStatusDto {
  linked!: boolean
  linkedAt!: string | null
  chatId!: string | null
}

export interface LinkTelegramResponse {
  token: string
  botUsername: string
  deepLink: string
  expiresInSeconds: number
}

export interface TelegramStatus {
  linked: boolean
  linkedAt: string | null
  chatId: string | null
}
