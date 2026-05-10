import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, type User, UserTier } from '@prisma/client'
import { PrismaService } from '../database/prisma.service'
import { PermissionService } from '../permissions/permission.service'
import type {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  SignupDto,
  VerifyEmailDto,
} from './dto/auth.dto'
import { PasswordService } from './services/password.service'
import { SessionService, type DeviceInfo } from './services/session.service'
import { EmailService } from './services/email.service'
import { TokenService } from './services/token.service'
import { VerificationService } from './services/verification.service'
import {
  resetPasswordAr,
  resetPasswordEn,
  verifyEmailAr,
  verifyEmailEn,
} from './templates/auth-emails'
import type { Env } from '../config/env.validation'

const FAILED_LOGIN_LIMIT = 5
const LOCK_MINUTES = 15

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
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly appUrl: string
  private readonly appName = 'AgencyOS'

  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
    private readonly tokens: TokenService,
    private readonly sessions: SessionService,
    private readonly verification: VerificationService,
    private readonly email: EmailService,
    private readonly permissionService: PermissionService,
    config: ConfigService<Env>,
  ) {
    this.appUrl = config.get('APP_URL', { infer: true }) ?? 'http://localhost:3000'
  }

  async signup(dto: SignupDto, ctx: AuthContext): Promise<{ companyId: string; userId: string }> {
    const existing = await this.prisma.system.user.findUnique({ where: { email: dto.owner.email } })
    if (existing) {
      throw new ConflictException('An account with this email already exists')
    }

    const passwordHash = await this.password.hash(dto.owner.password)

    let createdCompanyId: string
    let createdUserId: string

    try {
      const result = await this.prisma.system.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name: dto.company.name,
            slug: dto.company.slug,
          },
        })
        const user = await tx.user.create({
          data: {
            companyId: company.id,
            email: dto.owner.email,
            passwordHash,
            tier: UserTier.TENANT,
            preferredLanguage: dto.owner.preferredLanguage,
            timezone: dto.owner.timezone,
          },
        })
        return { company, user }
      })
      createdCompanyId = result.company.id
      createdUserId = result.user.id

      await this.permissionService.seedCompanyDefaultRoles(createdCompanyId, createdUserId)

      const ownerRole = await this.prisma.system.role.findFirst({
        where: { companyId: createdCompanyId, name: 'owner' },
      })
      if (ownerRole) {
        await this.prisma.system.userRole.create({
          data: {
            companyId: createdCompanyId,
            userId: createdUserId,
            roleId: ownerRole.id,
            createdBy: createdUserId,
          },
        })
      }
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Company slug already taken')
      }
      throw err
    }

    const verifyToken = await this.verification.createVerifyEmailToken(createdUserId)
    await this.sendVerifyEmail(
      dto.owner.email,
      dto.owner.fullNameAr,
      verifyToken,
      dto.owner.preferredLanguage,
    )

    await this.audit({
      companyId: createdCompanyId,
      userId: createdUserId,
      action: 'auth.signup',
      entityType: 'user',
      entityId: createdUserId,
      ctx,
    })

    return { companyId: createdCompanyId, userId: createdUserId }
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const userId = await this.verification.consumeVerifyEmailToken(dto.token)
    if (!userId) {
      throw new BadRequestException('Invalid or expired verification token')
    }
    const user = await this.prisma.system.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    })
    await this.audit({
      companyId: user.companyId,
      userId: user.id,
      action: 'auth.email_verified',
      entityType: 'user',
      entityId: user.id,
      ctx: { ipAddress: null, deviceInfo: null },
    })
  }

  async login(dto: LoginDto, ctx: AuthContext): Promise<TokenPair & { userId: string }> {
    const user = await this.prisma.system.user.findUnique({ where: { email: dto.email } })

    if (!user || !user.isActive || user.deletedAt !== null) {
      await this.recordFailedLogin(null, dto.email, ctx)
      throw new UnauthorizedException('Invalid email or password')
    }

    if (user.accountLockedUntil && user.accountLockedUntil.getTime() > Date.now()) {
      throw new HttpException(
        {
          message: 'Account temporarily locked due to too many failed attempts',
          lockedUntil: user.accountLockedUntil.toISOString(),
        },
        423, // 423 Locked (RFC 4918) — not in HttpStatus enum but standard
      )
    }

    if (!user.companyId) {
      throw new ForbiddenException('Tenant login requires a company-scoped account')
    }

    const ok = await this.password.verify(user.passwordHash, dto.password)
    if (!ok) {
      await this.recordFailedLogin(user, dto.email, ctx)
      throw new UnauthorizedException('Invalid email or password')
    }

    if (user.emailVerifiedAt === null) {
      throw new ForbiddenException(
        'Email not verified — check your inbox for the verification link',
      )
    }

    await this.prisma.system.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, accountLockedUntil: null, lastLoginAt: new Date() },
    })

    const pair = await this.issueTokenPair(user.id, user.companyId, user.tier, ctx)

    await this.audit({
      companyId: user.companyId,
      userId: user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      ctx,
    })

    return { ...pair, userId: user.id }
  }

  async refresh(refreshToken: string, ctx: AuthContext): Promise<TokenPair> {
    const hash = this.tokens.hashRefreshToken(refreshToken)
    const session = await this.sessions.findByRefreshHash(hash)
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token')
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired')
    }

    const user = await this.prisma.system.user.findUnique({ where: { id: session.userId } })
    if (!user || !user.isActive || user.deletedAt !== null) {
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
      tier: user.tier,
    })

    return { accessToken, refreshToken: next.raw, refreshTokenExpiresAt }
  }

  async logout(refreshToken: string, ctx: AuthContext): Promise<void> {
    const hash = this.tokens.hashRefreshToken(refreshToken)
    const session = await this.sessions.findByRefreshHash(hash)
    if (!session) return // idempotent

    await this.sessions.revoke(session.id)
    await this.audit({
      companyId: session.companyId,
      userId: session.userId,
      action: 'auth.logout',
      entityType: 'session',
      entityId: session.id,
      ctx,
    })
  }

  async forgotPassword(dto: ForgotPasswordDto, ctx: AuthContext): Promise<void> {
    const user = await this.prisma.system.user.findUnique({ where: { email: dto.email } })
    // Do not reveal account existence
    if (!user || !user.isActive || user.deletedAt !== null) {
      this.logger.debug(`forgot-password requested for unknown email ${dto.email}`)
      return
    }

    const token = await this.verification.createPasswordResetToken(user.id)
    const url = `${this.appUrl}/${user.preferredLanguage}/auth/reset-password?token=${encodeURIComponent(token)}`
    const tpl =
      user.preferredLanguage === 'en'
        ? resetPasswordEn({
            appName: this.appName,
            recipientName: user.email,
            resetUrl: url,
            expiryHours: 1,
          })
        : resetPasswordAr({
            appName: this.appName,
            recipientName: user.email,
            resetUrl: url,
            expiryHours: 1,
          })

    await this.email.send({ to: user.email, subject: tpl.subject, html: tpl.html })
    await this.audit({
      companyId: user.companyId,
      userId: user.id,
      action: 'auth.password_reset_requested',
      entityType: 'user',
      entityId: user.id,
      ctx,
    })
  }

  async resetPassword(dto: ResetPasswordDto, ctx: AuthContext): Promise<void> {
    const userId = await this.verification.consumePasswordResetToken(dto.token)
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token')
    }
    const passwordHash = await this.password.hash(dto.newPassword)
    const user = await this.prisma.system.user.update({
      where: { id: userId },
      data: { passwordHash, failedLoginAttempts: 0, accountLockedUntil: null },
    })
    // Invalidate all existing sessions on password change
    await this.sessions.revokeAllForUser(userId)

    await this.audit({
      companyId: user.companyId,
      userId: user.id,
      action: 'auth.password_reset',
      entityType: 'user',
      entityId: user.id,
      ctx,
    })
  }

  // ---------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------

  private async issueTokenPair(
    userId: string,
    companyId: string,
    tier: UserTier,
    ctx: AuthContext,
  ): Promise<TokenPair> {
    const accessToken = await this.tokens.signAccessToken({ sub: userId, companyId, tier })
    const refresh = this.tokens.generateRefreshToken()
    const refreshTokenExpiresAt = new Date(Date.now() + this.tokens.getRefreshTtlSeconds() * 1000)
    await this.sessions.create({
      companyId,
      userId,
      refreshTokenHash: refresh.hash,
      expiresAt: refreshTokenExpiresAt,
      ipAddress: ctx.ipAddress,
      deviceInfo: ctx.deviceInfo,
    })
    return { accessToken, refreshToken: refresh.raw, refreshTokenExpiresAt }
  }

  private async recordFailedLogin(
    user: User | null,
    email: string,
    ctx: AuthContext,
  ): Promise<void> {
    if (user) {
      const next = user.failedLoginAttempts + 1
      const shouldLock = next >= FAILED_LOGIN_LIMIT
      await this.prisma.system.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: next,
          ...(shouldLock && {
            accountLockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000),
          }),
        },
      })
    }
    await this.audit({
      companyId: user?.companyId ?? null,
      userId: user?.id ?? null,
      action: 'auth.login_failed',
      entityType: 'user',
      entityId: user?.id ?? null,
      metadata: { email },
      ctx,
    })
  }

  private async sendVerifyEmail(
    to: string,
    name: string,
    token: string,
    locale: string,
  ): Promise<void> {
    const url = `${this.appUrl}/${locale}/auth/verify-email?token=${encodeURIComponent(token)}`
    const tpl =
      locale === 'en'
        ? verifyEmailEn({ appName: this.appName, recipientName: name, verifyUrl: url })
        : verifyEmailAr({ appName: this.appName, recipientName: name, verifyUrl: url })
    await this.email.send({ to, subject: tpl.subject, html: tpl.html })
  }

  private async audit(params: {
    companyId: string | null
    userId: string | null
    action: string
    entityType: string
    entityId: string | null
    metadata?: Record<string, unknown>
    ctx: AuthContext
  }): Promise<void> {
    try {
      await this.prisma.system.auditLog.create({
        data: {
          companyId: params.companyId,
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          ipAddress: params.ctx.ipAddress,
          userAgent: params.ctx.deviceInfo?.userAgent ?? null,
          metadata: (params.metadata ?? null) as never,
        },
      })
    } catch (err) {
      this.logger.warn(`audit log failed for ${params.action}: ${(err as Error).message}`)
    }
  }
}
