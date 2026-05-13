import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserTier } from '@prisma/client'
import { PrismaService } from '../database/prisma.service'
import { PasswordService } from '../auth/services/password.service'
import { TokenService } from '../auth/services/token.service'
import { SessionService, type DeviceInfo } from '../auth/services/session.service'
import { VerificationService } from '../auth/services/verification.service'
import { EmailService } from '../auth/services/email.service'
import type { Env } from '../config/env.validation'
import type {
  PortalLoginDto,
  PortalRefreshDto,
  PortalForgotPasswordDto,
  PortalResetPasswordDto,
} from './portal-auth.dto'

interface AuthContext {
  ipAddress: string | null
  deviceInfo: DeviceInfo | null
}

interface TokenPair {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: Date
}

@Injectable()
export class PortalAuthService {
  private readonly logger = new Logger(PortalAuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
    private readonly tokens: TokenService,
    private readonly sessions: SessionService,
    private readonly verification: VerificationService,
    private readonly email: EmailService,
    config: ConfigService<Env>,
  ) {
    void config
  }

  async login(
    dto: PortalLoginDto,
    ctx: AuthContext,
  ): Promise<TokenPair & { userId: string; clientId: string }> {
    const user = await this.prisma.system.user.findUnique({ where: { email: dto.email } })
    if (!user || !user.isActive || user.deletedAt !== null || user.tier !== UserTier.EXTERNAL) {
      throw new UnauthorizedException('Invalid email or password')
    }
    if (user.accountLockedUntil && user.accountLockedUntil.getTime() > Date.now()) {
      throw new UnauthorizedException('Account temporarily locked')
    }

    const ok = await this.password.verify(user.passwordHash, dto.password)
    if (!ok) {
      await this.prisma.system.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
      })
      throw new UnauthorizedException('Invalid email or password')
    }

    await this.prisma.system.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, accountLockedUntil: null, lastLoginAt: new Date() },
    })

    const portalUser = await this.prisma.system.clientPortalUser.findUnique({
      where: { userId: user.id },
      include: { client: true },
    })
    if (!portalUser || !portalUser.isActive) {
      throw new ForbiddenException('Portal access not enabled for this account')
    }

    const accessToken = await this.tokens.signAccessToken({
      sub: user.id,
      companyId: user.companyId,
      tier: 'EXTERNAL',
    })
    const refresh = this.tokens.generateRefreshToken()
    const refreshTokenExpiresAt = new Date(Date.now() + this.tokens.getRefreshTtlSeconds() * 1000)
    await this.sessions.create({
      companyId: user.companyId!,
      userId: user.id,
      refreshTokenHash: refresh.hash,
      expiresAt: refreshTokenExpiresAt,
      ipAddress: ctx.ipAddress,
      deviceInfo: ctx.deviceInfo,
    })

    return {
      accessToken,
      refreshToken: refresh.raw,
      refreshTokenExpiresAt,
      userId: user.id,
      clientId: portalUser.clientId,
    }
  }

  async refresh(dto: PortalRefreshDto, ctx: AuthContext): Promise<TokenPair> {
    const hash = this.tokens.hashRefreshToken(dto.refreshToken)
    const session = await this.sessions.findByRefreshHash(hash)
    if (!session) throw new UnauthorizedException('Invalid refresh token')
    if (session.expiresAt.getTime() <= Date.now())
      throw new UnauthorizedException('Refresh token expired')

    const user = await this.prisma.system.user.findUnique({ where: { id: session.userId } })
    if (!user || !user.isActive || user.deletedAt !== null || user.tier !== UserTier.EXTERNAL) {
      throw new UnauthorizedException('User not found or inactive')
    }

    const next = this.tokens.generateRefreshToken()
    const refreshTokenExpiresAt = new Date(Date.now() + this.tokens.getRefreshTtlSeconds() * 1000)
    await this.sessions.rotate(session.id, {
      refreshTokenHash: next.hash,
      expiresAt: refreshTokenExpiresAt,
      ipAddress: ctx.ipAddress,
      deviceInfo: ctx.deviceInfo,
    })

    const accessToken = await this.tokens.signAccessToken({
      sub: user.id,
      companyId: user.companyId,
      tier: 'EXTERNAL',
    })
    return { accessToken, refreshToken: next.raw, refreshTokenExpiresAt }
  }

  async logout(refreshToken: string): Promise<void> {
    const hash = this.tokens.hashRefreshToken(refreshToken)
    const session = await this.sessions.findByRefreshHash(hash)
    if (!session) return
    await this.sessions.revoke(session.id)
  }

  async forgotPassword(dto: PortalForgotPasswordDto): Promise<void> {
    const user = await this.prisma.system.user.findUnique({ where: { email: dto.email } })
    if (!user || !user.isActive || user.deletedAt !== null || user.tier !== UserTier.EXTERNAL) {
      return
    }
    const token = await this.verification.createPasswordResetToken(user.id)
    const appUrl = process.env['APP_URL'] ?? 'http://localhost:3003'
    const url = `${appUrl}/${user.preferredLanguage}/auth/reset-password?token=${encodeURIComponent(token)}`
    await this.email.send({
      to: user.email,
      subject: 'Reset your portal password',
      html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    })
  }

  async resetPassword(dto: PortalResetPasswordDto): Promise<void> {
    const userId = await this.verification.consumePasswordResetToken(dto.token)
    if (!userId) throw new BadRequestException('Invalid or expired reset token')
    const passwordHash = await this.password.hash(dto.newPassword)
    await this.prisma.system.user.update({
      where: { id: userId },
      data: { passwordHash, failedLoginAttempts: 0, accountLockedUntil: null },
    })
    await this.sessions.revokeAllForUser(userId)
  }
}
