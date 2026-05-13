import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import type { Subscription } from '@prisma/client'
import { PrismaService } from '../database/prisma.service'
import { EmailService } from '../auth/services/email.service'
import { NotificationService } from '../notifications/notification.service'
import type { Env } from '../config/env.validation'

/**
 * Tenant lifecycle state machine (MasterSpec §4):
 *
 *   TRIAL/ACTIVE ─(period_end past, no payment)─► PAST_DUE
 *   PAST_DUE     ─(+grace_past_due days)────────► READ_ONLY
 *   READ_ONLY    ─(+grace_read_only days)───────► SUSPENDED
 *   SUSPENDED    ─(+grace_suspended days)───────► ANONYMIZED
 *
 * Trial warnings fire at 3 days, 1 day, expiry day. `lastWarningStage` prevents duplicates
 * across cron retries.
 *
 * Anonymization scrubs PII from the company record (name, address, phone, website) and the
 * owner user (email rewritten, password cleared). Data retained for legal compliance but no
 * longer usable for login or contact.
 */

const WARNING_STAGE_3_DAY = 3
const WARNING_STAGE_1_DAY = 1
const WARNING_STAGE_EXPIRED = 0

@Injectable()
export class LifecycleService {
  private readonly logger = new Logger(LifecycleService.name)
  private readonly gracePastDueDays: number
  private readonly graceReadOnlyDays: number
  private readonly graceSuspendedDays: number
  private readonly cronEnabled: boolean

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationService,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.gracePastDueDays = this.config.get('LIFECYCLE_GRACE_PAST_DUE_DAYS', { infer: true })
    this.graceReadOnlyDays = this.config.get('LIFECYCLE_GRACE_READ_ONLY_DAYS', { infer: true })
    this.graceSuspendedDays = this.config.get('LIFECYCLE_GRACE_SUSPENDED_DAYS', { infer: true })
    this.cronEnabled = this.config.get('LIFECYCLE_CRON_ENABLED', { infer: true })
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runDailySweep(): Promise<void> {
    if (!this.cronEnabled) return
    this.logger.log('Lifecycle daily sweep starting')
    const trialWarnings = await this.sendTrialWarnings()
    const pastDue = await this.transitionExpiredToPastDue()
    const readOnly = await this.transitionPastDueToReadOnly()
    const suspended = await this.transitionReadOnlyToSuspended()
    const anonymized = await this.transitionSuspendedToAnonymized()
    this.logger.log(
      `Lifecycle sweep done — warnings:${trialWarnings} pastDue:${pastDue} readOnly:${readOnly} suspended:${suspended} anonymized:${anonymized}`,
    )
  }

  /** Send trial-ending emails at 3d, 1d, expiry. Returns count of emails sent. */
  async sendTrialWarnings(): Promise<number> {
    const now = new Date()
    const subs = await this.prisma.system.subscription.findMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: { not: null },
        deletedAt: null,
      },
      include: { company: { select: { id: true, name: true, nameEn: true } } },
    })

    let sent = 0
    for (const sub of subs) {
      if (!sub.trialEndsAt) continue
      const msUntilEnd = sub.trialEndsAt.getTime() - now.getTime()
      const daysUntilEnd = Math.ceil(msUntilEnd / (24 * 60 * 60 * 1000))

      let stage: number | null = null
      if (daysUntilEnd <= 0) stage = WARNING_STAGE_EXPIRED
      else if (daysUntilEnd <= 1) stage = WARNING_STAGE_1_DAY
      else if (daysUntilEnd <= 3) stage = WARNING_STAGE_3_DAY

      if (stage === null) continue
      // sub.lastWarningStage tracks the last stage we sent for. Lower stage number = closer to expiry.
      if (sub.lastWarningStage !== null && sub.lastWarningStage <= stage) continue

      await this.notifyOwner(sub.companyId, {
        type: 'trial_warning',
        title: `Trial ${daysUntilEnd > 0 ? `ends in ${daysUntilEnd} day(s)` : 'has ended'}`,
        body: `Your AgencyOS trial for "${sub.company.nameEn ?? sub.company.name}" ${
          daysUntilEnd > 0 ? `expires on ${sub.trialEndsAt.toDateString()}` : 'has expired'
        }. Subscribe to keep access.`,
      })
      await this.prisma.system.subscription.update({
        where: { id: sub.id },
        data: { lastWarningStage: stage },
      })
      sent++
    }
    return sent
  }

  /** TRIAL or ACTIVE with currentPeriodEnd in the past + no recent renewal → PAST_DUE. */
  async transitionExpiredToPastDue(): Promise<number> {
    const now = new Date()
    const candidates = await this.prisma.system.subscription.findMany({
      where: {
        status: { in: ['TRIAL', 'ACTIVE'] },
        currentPeriodEnd: { lt: now },
        deletedAt: null,
      },
      include: { company: true },
    })
    for (const sub of candidates) {
      await this.prisma.system.subscription.update({
        where: { id: sub.id },
        data: { status: 'PAST_DUE' },
      })
      await this.notifyOwner(sub.companyId, {
        type: 'subscription_past_due',
        title: 'Subscription past due',
        body: `Your subscription period has ended and no payment was received. You have ${this.gracePastDueDays} days to renew before access becomes read-only.`,
      })
    }
    return candidates.length
  }

  async transitionPastDueToReadOnly(): Promise<number> {
    const cutoff = this.daysAgo(this.gracePastDueDays)
    const candidates = await this.prisma.system.subscription.findMany({
      where: { status: 'PAST_DUE', updatedAt: { lt: cutoff }, deletedAt: null },
    })
    for (const sub of candidates) {
      await this.prisma.system.subscription.update({
        where: { id: sub.id },
        data: { status: 'READ_ONLY', readOnlyAt: new Date() },
      })
      await this.notifyOwner(sub.companyId, {
        type: 'subscription_read_only',
        title: 'Access restricted to read-only',
        body: `Your subscription is now read-only. Resubscribe within ${this.graceReadOnlyDays} days to restore full access.`,
      })
    }
    return candidates.length
  }

  async transitionReadOnlyToSuspended(): Promise<number> {
    const cutoff = this.daysAgo(this.graceReadOnlyDays)
    const candidates = await this.prisma.system.subscription.findMany({
      where: { status: 'READ_ONLY', readOnlyAt: { lt: cutoff }, deletedAt: null },
    })
    for (const sub of candidates) {
      await this.prisma.system.subscription.update({
        where: { id: sub.id },
        data: { status: 'SUSPENDED', suspendedAt: new Date() },
      })
      await this.notifyOwner(sub.companyId, {
        type: 'subscription_suspended',
        title: 'Account suspended',
        body: `Your account is suspended. Data is preserved for ${this.graceSuspendedDays} more days. Contact support to reactivate.`,
      })
    }
    return candidates.length
  }

  async transitionSuspendedToAnonymized(): Promise<number> {
    const cutoff = this.daysAgo(this.graceSuspendedDays)
    const candidates = await this.prisma.system.subscription.findMany({
      where: { status: 'SUSPENDED', suspendedAt: { lt: cutoff }, deletedAt: null },
    })
    for (const sub of candidates) {
      await this.anonymizeCompany(sub.companyId)
      await this.prisma.system.subscription.update({
        where: { id: sub.id },
        data: { status: 'ANONYMIZED', anonymizedAt: new Date() },
      })
    }
    return candidates.length
  }

  /** Scrub PII from the company record + owner user. Reversible only via backup restore. */
  async anonymizeCompany(companyId: string): Promise<void> {
    const tag = `anon-${companyId.slice(0, 8)}`
    await this.prisma.system.company.update({
      where: { id: companyId },
      data: {
        name: `[anonymized] ${tag}`,
        nameEn: `[anonymized] ${tag}`,
        address: null,
        phone: null,
        website: null,
        logoUrl: null,
      },
    })
    // Owner user(s): rewrite email + clear password so the account cannot be used.
    const owners = await this.prisma.system.user.findMany({
      where: { companyId },
      select: { id: true },
    })
    for (const u of owners) {
      await this.prisma.system.user.update({
        where: { id: u.id },
        data: {
          email: `anonymized+${u.id}@deleted.local`,
          passwordHash: 'ANONYMIZED',
          isActive: false,
        },
      })
    }
    this.logger.warn(`Anonymized company ${companyId} (${owners.length} user(s))`)
  }

  // ─── Manual admin overrides ─────────────────────────────────────────────

  async extendTrial(input: {
    companyId: string
    days: number
    adminUserId: string
  }): Promise<Subscription> {
    if (input.days < 1 || input.days > 90) {
      throw new Error('Trial extension must be between 1 and 90 days')
    }
    const sub = await this.prisma.system.subscription.findUnique({
      where: { companyId: input.companyId },
    })
    if (!sub) throw new Error('No subscription found for that company')
    const newEnd = new Date((sub.trialEndsAt ?? new Date()).getTime() + input.days * 86400000)
    return this.prisma.system.subscription.update({
      where: { id: sub.id },
      data: {
        trialEndsAt: newEnd,
        currentPeriodEnd: newEnd,
        status: 'TRIAL',
        lastWarningStage: null,
        updatedBy: input.adminUserId,
      },
    })
  }

  async suspend(companyId: string, adminUserId: string): Promise<Subscription> {
    return this.prisma.system.subscription.update({
      where: { companyId },
      data: { status: 'SUSPENDED', suspendedAt: new Date(), updatedBy: adminUserId },
    })
  }

  async reactivate(companyId: string, adminUserId: string): Promise<Subscription> {
    return this.prisma.system.subscription.update({
      where: { companyId },
      data: {
        status: 'ACTIVE',
        readOnlyAt: null,
        suspendedAt: null,
        lastWarningStage: null,
        updatedBy: adminUserId,
      },
    })
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  /**
   * Notify the owner(s) of a company via in-app notification + email.
   * `prisma.tenant` cannot be used here because the cron has no tenant context;
   * we use `prisma.system` directly + RLS-bypassing email/Telegram channels.
   */
  private async notifyOwner(
    companyId: string,
    payload: { type: string; title: string; body: string },
  ): Promise<void> {
    const owners = await this.prisma.system.user.findMany({
      where: { companyId, isActive: true },
      select: { id: true, email: true },
    })
    for (const owner of owners) {
      try {
        await this.prisma.system.notification.create({
          data: {
            companyId,
            userId: owner.id,
            type: payload.type as never,
            title: payload.title,
            body: payload.body,
          },
        })
      } catch (err) {
        this.logger.warn(`Failed to create in-app notification: ${(err as Error).message}`)
      }
      try {
        await this.email.send({
          to: owner.email,
          subject: payload.title,
          html: `<p>${payload.body}</p>`,
          text: payload.body,
        })
      } catch (err) {
        this.logger.warn(`Failed to send email to ${owner.email}: ${(err as Error).message}`)
      }
    }
  }

  private daysAgo(days: number): Date {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  }
}
