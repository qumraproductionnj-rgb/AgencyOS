import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { UserTier } from '@prisma/client'
import { PrismaService } from '../database/prisma.service'
import { PasswordService } from '../auth/services/password.service'
import { TokenService } from '../auth/services/token.service'
import { SessionService, type DeviceInfo } from '../auth/services/session.service'
import type { PlatformLoginDto, PlatformRefreshDto } from './platform-auth.dto'

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
export class PlatformAuthService {
  private readonly logger = new Logger(PlatformAuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
    private readonly tokens: TokenService,
    private readonly sessions: SessionService,
  ) {}

  async login(dto: PlatformLoginDto, ctx: AuthContext): Promise<TokenPair & { userId: string }> {
    const user = await this.prisma.system.user.findUnique({ where: { email: dto.email } })
    if (
      !user ||
      !user.isActive ||
      user.deletedAt !== null ||
      user.tier !== UserTier.PLATFORM_ADMIN
    ) {
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

    const accessToken = await this.tokens.signAccessToken({
      sub: user.id,
      companyId: null,
      tier: 'PLATFORM_ADMIN',
    })
    const refresh = this.tokens.generateRefreshToken()
    const refreshTokenExpiresAt = new Date(Date.now() + this.tokens.getRefreshTtlSeconds() * 1000)
    // Platform admin sessions are not tied to a company; companyId is null.
    await this.sessions.create({
      companyId: null,
      userId: user.id,
      refreshTokenHash: refresh.hash,
      expiresAt: refreshTokenExpiresAt,
      ipAddress: ctx.ipAddress,
      deviceInfo: ctx.deviceInfo,
    })

    this.logger.log(`Platform admin login: ${user.email}`)
    return { accessToken, refreshToken: refresh.raw, refreshTokenExpiresAt, userId: user.id }
  }

  async refresh(dto: PlatformRefreshDto, ctx: AuthContext): Promise<TokenPair> {
    const hash = this.tokens.hashRefreshToken(dto.refreshToken)
    const session = await this.sessions.findByRefreshHash(hash)
    if (!session) throw new UnauthorizedException('Invalid refresh token')
    if (session.expiresAt.getTime() <= Date.now())
      throw new UnauthorizedException('Refresh token expired')

    const user = await this.prisma.system.user.findUnique({ where: { id: session.userId } })
    if (
      !user ||
      !user.isActive ||
      user.deletedAt !== null ||
      user.tier !== UserTier.PLATFORM_ADMIN
    ) {
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
      companyId: null,
      tier: 'PLATFORM_ADMIN',
    })
    return { accessToken, refreshToken: next.raw, refreshTokenExpiresAt }
  }

  async logout(refreshToken: string): Promise<void> {
    const hash = this.tokens.hashRefreshToken(refreshToken)
    const session = await this.sessions.findByRefreshHash(hash)
    if (session) await this.sessions.revoke(session.id)
  }
}
