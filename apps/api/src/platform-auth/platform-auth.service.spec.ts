import { Test } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'

// jose is ESM-only and not transformed by ts-jest; stub before importing the service tree.
jest.mock('jose', () => ({
  SignJWT: jest.fn(),
  jwtVerify: jest.fn(),
  importPKCS8: jest.fn(),
  importSPKI: jest.fn(),
}))

import { PlatformAuthService } from './platform-auth.service'
import { PrismaService } from '../database/prisma.service'
import { PasswordService } from '../auth/services/password.service'
import { TokenService } from '../auth/services/token.service'
import { SessionService } from '../auth/services/session.service'

function mockPrisma() {
  return {
    system: {
      user: { findUnique: jest.fn(), update: jest.fn() },
    },
  }
}

const mockPwd = { verify: jest.fn() }
const mockTok = {
  signAccessToken: jest.fn().mockResolvedValue('access.jwt'),
  generateRefreshToken: jest.fn().mockReturnValue({ raw: 'rraw', hash: 'rhash' }),
  hashRefreshToken: jest.fn().mockReturnValue('rhash'),
  getRefreshTtlSeconds: jest.fn().mockReturnValue(86400),
}
const mockSess = {
  create: jest.fn().mockResolvedValue({}),
  findByRefreshHash: jest.fn(),
  rotate: jest.fn(),
  revoke: jest.fn(),
}

describe('PlatformAuthService', () => {
  let service: PlatformAuthService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      providers: [
        PlatformAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: PasswordService, useValue: mockPwd },
        { provide: TokenService, useValue: mockTok },
        { provide: SessionService, useValue: mockSess },
      ],
    }).compile()
    service = module.get(PlatformAuthService)
  })

  it('logs in a PLATFORM_ADMIN with correct credentials', async () => {
    prisma.system.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@x.com',
      passwordHash: 'h',
      tier: 'PLATFORM_ADMIN',
      isActive: true,
      deletedAt: null,
      accountLockedUntil: null,
      companyId: null,
    })
    mockPwd.verify.mockResolvedValue(true)
    const ctx = { ipAddress: null, deviceInfo: null }
    const res = await service.login({ email: 'a@x.com', password: 'p' }, ctx)
    expect(res.accessToken).toBe('access.jwt')
    expect(mockTok.signAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ tier: 'PLATFORM_ADMIN', companyId: null }),
    )
    expect(mockSess.create).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: null, userId: 'u1' }),
    )
  })

  it('rejects TENANT users attempting platform login', async () => {
    prisma.system.user.findUnique.mockResolvedValue({
      id: 'u1',
      tier: 'TENANT',
      isActive: true,
      deletedAt: null,
      passwordHash: 'h',
    })
    await expect(
      service.login({ email: 'a@x.com', password: 'p' }, { ipAddress: null, deviceInfo: null }),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('rejects invalid passwords and increments failure counter', async () => {
    prisma.system.user.findUnique.mockResolvedValue({
      id: 'u1',
      tier: 'PLATFORM_ADMIN',
      isActive: true,
      deletedAt: null,
      passwordHash: 'h',
      accountLockedUntil: null,
    })
    mockPwd.verify.mockResolvedValue(false)
    await expect(
      service.login({ email: 'a@x.com', password: 'wrong' }, { ipAddress: null, deviceInfo: null }),
    ).rejects.toThrow(UnauthorizedException)
    expect(prisma.system.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { failedLoginAttempts: { increment: 1 } } }),
    )
  })

  it('rejects locked accounts', async () => {
    prisma.system.user.findUnique.mockResolvedValue({
      id: 'u1',
      tier: 'PLATFORM_ADMIN',
      isActive: true,
      deletedAt: null,
      passwordHash: 'h',
      accountLockedUntil: new Date(Date.now() + 60_000),
    })
    await expect(
      service.login({ email: 'a@x.com', password: 'p' }, { ipAddress: null, deviceInfo: null }),
    ).rejects.toThrow(UnauthorizedException)
  })
})
