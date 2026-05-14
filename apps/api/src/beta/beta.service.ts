import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../database/prisma.service'
import type { CreateBetaInviteDto } from './beta.dto'
import type { Env } from '../config/env.validation'
import * as argon2 from 'argon2'

const BETA_DURATION_DAYS = 30

@Injectable()
export class BetaService {
  private readonly logger = new Logger(BetaService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env>,
  ) {}

  async createInvite(dto: CreateBetaInviteDto) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + BETA_DURATION_DAYS)

    const invite = await this.prisma.system.betaInvite.upsert({
      where: { email: dto.email },
      update: {
        companyName: dto.companyName,
        type: dto.type,
        status: 'sent',
        notes: dto.notes ?? null,
        expiresAt,
        acceptedAt: null,
      },
      create: {
        email: dto.email,
        companyName: dto.companyName,
        type: dto.type,
        notes: dto.notes ?? null,
        expiresAt,
      },
    })

    // Send welcome email via Resend
    await this.sendInviteEmail(invite.email, invite.companyName, invite.token)

    this.logger.log(`Beta invite sent to ${invite.email}`)
    return invite
  }

  async acceptInvite(token: string, ownerName: string, password: string) {
    const invite = await this.prisma.system.betaInvite.findUnique({ where: { token } })

    if (!invite) throw new NotFoundException('Invite not found')
    if (invite.status === 'accepted') throw new BadRequestException('Invite already used')
    if (new Date() > invite.expiresAt) throw new BadRequestException('Invite expired')

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    })

    // Create company + owner in a transaction
    const result = await this.prisma.system.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: invite.companyName,
          slug: this.slugify(invite.companyName),
        },
      })

      const user = await tx.user.create({
        data: {
          email: invite.email,
          passwordHash: hashedPassword,
          companyId: company.id,
        },
      })

      await tx.betaInvite.update({
        where: { id: invite.id },
        data: { status: 'accepted', acceptedAt: new Date() },
      })

      return { company, user }
    })

    this.logger.log(`Beta invite accepted: ${invite.email} → company ${result.company.id}`)
    return { companyId: result.company.id, userId: result.user.id }
  }

  async listInvites() {
    return this.prisma.system.betaInvite.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .slice(0, 50)
  }

  private async sendInviteEmail(email: string, companyName: string, token: string) {
    const resendKey = this.config.get('RESEND_API_KEY', { infer: true })
    const appUrl = this.config.get('APP_URL', { infer: true }) ?? 'https://app.agencyos.app'

    if (!resendKey) {
      this.logger.warn('RESEND_API_KEY not set — skipping invite email')
      return
    }

    const link = `${appUrl}/beta/accept?token=${token}`

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Vision OS <noreply@agencyos.app>',
          to: email,
          subject: `دعوتك لـ Vision OS Beta — ${companyName}`,
          html: buildInviteEmailHtml(companyName, link),
        }),
      })
    } catch (err) {
      this.logger.error('Failed to send invite email', err)
    }
  }
}

function buildInviteEmailHtml(companyName: string, acceptLink: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;color:#e5e7eb">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">
  <tr>
    <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700">Vision OS</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px">نظام إدارة الوكالات الإبداعية</p>
    </td>
  </tr>
  <tr>
    <td style="padding:32px">
      <h2 style="color:#fff;font-size:20px;margin:0 0 16px">مرحباً بك في Vision OS Beta 🎉</h2>
      <p style="color:#9ca3af;line-height:1.8;margin:0 0 24px">
        تم قبول طلب شركة <strong style="color:#fff">${companyName}</strong> في برنامج Beta الحصري.
        معك 30 يومًا مجانًا لتجربة النظام الكامل.
      </p>

      <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#a5b4fc;font-size:14px;margin:0 0 12px;font-weight:600">3 خطوات للبدء:</p>
        <p style="color:#9ca3af;font-size:14px;margin:0 0 8px">١. انقر الزر أدناه لإنشاء حسابك</p>
        <p style="color:#9ca3af;font-size:14px;margin:0 0 8px">٢. أضف موظفيك وعملاءك</p>
        <p style="color:#9ca3af;font-size:14px;margin:0">٣. جرّب AI tools والتقارير</p>
      </div>

      <div style="text-align:center;margin:32px 0">
        <a href="${acceptLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:600">
          ابدأ الآن →
        </a>
      </div>

      <p style="color:#6b7280;font-size:12px;text-align:center;margin:0">
        للدعم: واتساب <a href="https://wa.me/9647XXXXXXXXX" style="color:#a5b4fc">+964 7XX XXX XXXX</a>
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
      <p style="color:#4b5563;font-size:11px;margin:0">Vision OS — فريق رؤية للإنتاج الفني</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
