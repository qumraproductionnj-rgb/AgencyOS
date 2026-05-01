import { Injectable } from '@nestjs/common'
import type { Session } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'

export interface DeviceInfo {
  userAgent?: string
  deviceId?: string
  appVersion?: string
}

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  create(params: {
    companyId: string
    userId: string
    refreshTokenHash: string
    expiresAt: Date
    ipAddress?: string | null
    deviceInfo?: DeviceInfo | null
  }): Promise<Session> {
    return this.prisma.session.create({
      data: {
        companyId: params.companyId,
        userId: params.userId,
        refreshTokenHash: params.refreshTokenHash,
        expiresAt: params.expiresAt,
        lastActiveAt: new Date(),
        ipAddress: params.ipAddress ?? null,
        deviceInfo: (params.deviceInfo ?? null) as never,
      },
    })
  }

  findByRefreshHash(hash: string): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: { refreshTokenHash: hash, revokedAt: null },
    })
  }

  async rotate(
    oldSessionId: string,
    next: {
      refreshTokenHash: string
      expiresAt: Date
      ipAddress?: string | null
      deviceInfo?: DeviceInfo | null
    },
  ): Promise<Session> {
    const old = await this.prisma.session.update({
      where: { id: oldSessionId },
      data: { revokedAt: new Date() },
    })
    return this.prisma.session.create({
      data: {
        companyId: old.companyId,
        userId: old.userId,
        refreshTokenHash: next.refreshTokenHash,
        expiresAt: next.expiresAt,
        lastActiveAt: new Date(),
        ipAddress: next.ipAddress ?? null,
        deviceInfo: (next.deviceInfo ?? null) as never,
      },
    })
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    })
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  async touchLastActive(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { lastActiveAt: new Date() },
    })
  }
}
