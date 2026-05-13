import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Telegraf } from 'telegraf'
import type { Env } from '../config/env.validation'
import { RedisService } from '../redis/redis.service'
import { PrismaService } from '../database/prisma.service'

const LINK_TOKEN_PREFIX = 'telegram:link:'
const LINK_TOKEN_TTL_SECONDS = 60 * 15 // 15 minutes

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name)
  private readonly bot: Telegraf | null = null
  private readonly botUsername: string

  constructor(
    private readonly config: ConfigService<Env>,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {
    const token = this.config.get('TELEGRAM_BOT_TOKEN', { infer: true })
    this.botUsername = this.config.get('TELEGRAM_BOT_USERNAME', { infer: true }) ?? 'AgencyOSBot'

    if (token) {
      this.bot = new Telegraf(token)
    } else {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set — Telegram bot disabled')
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.bot) return

    this.bot.start(async (ctx) => {
      const token = ctx.payload // everything after /start
      if (!token) {
        await ctx.reply(
          'Welcome to AgencyOS! Use a valid link from the app to connect your account.',
        )
        return
      }

      const userId = await this.redis.get(`${LINK_TOKEN_PREFIX}${token}`)
      if (!userId) {
        await ctx.reply(
          'This link has expired or is invalid. Please generate a new link from the app.',
        )
        return
      }

      const chatId = ctx.chat.id.toString()
      await this.prisma.system.user.update({
        where: { id: userId },
        data: { telegramChatId: chatId, telegramLinkedAt: new Date() },
      })

      // Clean up token
      await this.redis.del(`${LINK_TOKEN_PREFIX}${token}`)

      await ctx.reply(
        'Your Telegram account has been linked to AgencyOS! You will now receive notifications here.',
      )
      this.logger.log(`User ${userId} linked Telegram chat ${chatId}`)
    })

    // Graceful shutdown handler
    this.bot.catch((err) => {
      this.logger.error(`Telegram bot error: ${err instanceof Error ? err.message : String(err)}`)
    })

    // Use long-polling (suitable for development; webhook for production)
    await this.bot.launch().catch((err) => {
      this.logger.error(`Failed to launch Telegram bot: ${err.message}`)
    })

    this.logger.log(`Telegram bot started (username: ${this.botUsername})`)
  }

  async onModuleDestroy(): Promise<void> {
    if (this.bot) {
      this.bot.stop()
      this.logger.log('Telegram bot stopped')
    }
  }

  async generateLinkToken(userId: string): Promise<{
    token: string
    botUsername: string
    deepLink: string
    expiresInSeconds: number
  }> {
    const { randomBytes } = await import('node:crypto')
    const token = randomBytes(24).toString('base64url')
    await this.redis.set(`${LINK_TOKEN_PREFIX}${token}`, userId, LINK_TOKEN_TTL_SECONDS)

    return {
      token,
      botUsername: this.botUsername,
      deepLink: `https://t.me/${this.botUsername}?start=${token}`,
      expiresInSeconds: LINK_TOKEN_TTL_SECONDS,
    }
  }

  async getStatus(
    userId: string,
  ): Promise<{ linked: boolean; linkedAt: Date | null; chatId: string | null }> {
    const user = await this.prisma.system.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true, telegramLinkedAt: true },
    })
    if (!user) {
      return { linked: false, linkedAt: null, chatId: null }
    }
    return {
      linked: user.telegramChatId !== null,
      linkedAt: user.telegramLinkedAt,
      chatId: user.telegramChatId,
    }
  }

  async unlink(userId: string): Promise<void> {
    await this.prisma.system.user.update({
      where: { id: userId },
      data: { telegramChatId: null, telegramLinkedAt: null },
    })
    this.logger.log(`User ${userId} unlinked Telegram`)
  }

  async sendNotification(userId: string, title: string, body?: string): Promise<boolean> {
    if (!this.bot) return false

    const user = await this.prisma.system.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true },
    })
    if (!user?.telegramChatId) return false

    try {
      const text = body ? `*${title}*\n\n${body}` : `*${title}*`
      await this.bot.telegram.sendMessage(user.telegramChatId, text, {
        parse_mode: 'Markdown',
      })
      return true
    } catch (err) {
      this.logger.error(
        `Failed to send Telegram notification to user ${userId}: ${err instanceof Error ? err.message : String(err)}`,
      )
      // If bot was blocked or chat not found, unlink the user
      if (
        err instanceof Error &&
        (err.message.includes('blocked') || err.message.includes('chat not found'))
      ) {
        await this.unlink(userId)
      }
      return false
    }
  }
}
