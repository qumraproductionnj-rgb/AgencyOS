import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../database/prisma.service'
import type { Env } from '../config/env.validation'
import { buildOnboardingDay0Html } from '../email/templates/onboarding-day0'
import { buildTrialExpiryHtml } from '../email/templates/trial-expiry'

const APP_URL = 'https://app.agencyos.app'

@Injectable()
export class EmailSequencesJob {
  private readonly logger = new Logger(EmailSequencesJob.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env>,
  ) {}

  @Cron('0 10 * * *', { timeZone: 'Asia/Baghdad' })
  async runSequences() {
    const resendKey = this.config.get('RESEND_API_KEY', { infer: true })
    if (!resendKey) {
      this.logger.warn('RESEND_API_KEY not set — skipping email sequences')
      return
    }

    const now = new Date()

    // Trial expiry sequences — check beta invites accepted N days ago
    const invites = await this.prisma.system.betaInvite.findMany({
      where: { status: 'accepted', acceptedAt: { not: null } },
    })

    for (const invite of invites) {
      if (!invite.acceptedAt) continue
      const daysSince = Math.floor((now.getTime() - invite.acceptedAt.getTime()) / 86400000)

      // Day 25: 5 days warning
      if (daysSince === 25) {
        await this.sendEmail(
          resendKey,
          invite.email,
          'اشتراكك ينتهي خلال 5 أيام — Vision OS',
          buildTrialExpiryHtml(invite.companyName, 5, `${APP_URL}/billing`),
        )
      }
      // Day 30: expired
      if (daysSince === 30) {
        await this.sendEmail(
          resendKey,
          invite.email,
          'انتهت تجربتك المجانية — Vision OS',
          buildTrialExpiryHtml(invite.companyName, 0, `${APP_URL}/billing`),
        )
      }
      // Day 32: special offer
      if (daysSince === 32) {
        await this.sendEmail(
          resendKey,
          invite.email,
          '🎁 عرض خاص: 20% خصم لك — Vision OS',
          buildTrialExpiryHtml(invite.companyName, -2, `${APP_URL}/billing`),
        )
      }
    }

    this.logger.log('Email sequences processed')
  }

  async sendWelcomeEmail(email: string, name: string) {
    const resendKey = this.config.get('RESEND_API_KEY', { infer: true })
    if (!resendKey) return

    await this.sendEmail(
      resendKey,
      email,
      `مرحباً في Vision OS يا ${name} 🎉`,
      buildOnboardingDay0Html(name, `${APP_URL}/ar/dashboard`),
    )
  }

  private async sendEmail(key: string, to: string, subject: string, html: string) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Vision OS <noreply@agencyos.app>',
          to,
          subject,
          html,
        }),
      })
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err)
    }
  }
}
