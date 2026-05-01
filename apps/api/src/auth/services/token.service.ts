import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose'
import { randomBytes, createHash } from 'node:crypto'
import type { Env } from '../../config/env.validation'

export type Tier = 'TENANT' | 'PLATFORM_ADMIN' | 'EXTERNAL'

export interface AccessTokenClaims {
  sub: string
  companyId: string | null
  tier: Tier
  jti: string
  iat?: number
  exp?: number
  iss?: string
  aud?: string | string[]
}

type SigningKey = Awaited<ReturnType<typeof importPKCS8>>
type VerifyKey = Awaited<ReturnType<typeof importSPKI>>

const ALG = 'RS256'

@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name)
  private readonly accessExpiry: string
  private readonly refreshTtlSeconds: number
  private privateKeys = new Map<Tier, SigningKey>()
  private publicKeys = new Map<Tier, VerifyKey>()

  constructor(private readonly config: ConfigService<Env>) {
    this.accessExpiry = config.get('JWT_ACCESS_EXPIRY', { infer: true }) ?? '15m'
    this.refreshTtlSeconds = parseDurationToSeconds(
      config.get('JWT_REFRESH_EXPIRY', { infer: true }) ?? '7d',
    )
  }

  async onModuleInit(): Promise<void> {
    await this.loadKeys('TENANT', 'JWT_TENANT_PRIVATE_KEY', 'JWT_TENANT_PUBLIC_KEY', true)
    await this.loadKeys(
      'PLATFORM_ADMIN',
      'JWT_PLATFORM_PRIVATE_KEY',
      'JWT_PLATFORM_PUBLIC_KEY',
      false,
    )
    await this.loadKeys('EXTERNAL', 'JWT_EXTERNAL_PRIVATE_KEY', 'JWT_EXTERNAL_PUBLIC_KEY', false)
  }

  private async loadKeys(
    tier: Tier,
    privEnv: keyof Env,
    pubEnv: keyof Env,
    required: boolean,
  ): Promise<void> {
    const privB64 = this.config.get(privEnv, { infer: true })
    const pubB64 = this.config.get(pubEnv, { infer: true })

    if (!privB64 || !pubB64) {
      if (required) {
        throw new Error(`${tier} JWT keys are required`)
      }
      this.logger.warn(`${tier} JWT keys not configured — that tier will be unusable`)
      return
    }

    const privPem = Buffer.from(privB64 as string, 'base64').toString('utf8')
    const pubPem = Buffer.from(pubB64 as string, 'base64').toString('utf8')
    this.privateKeys.set(tier, await importPKCS8(privPem, ALG))
    this.publicKeys.set(tier, await importSPKI(pubPem, ALG))
  }

  async signAccessToken(payload: {
    sub: string
    companyId: string | null
    tier: Tier
  }): Promise<string> {
    const key = this.requirePrivate(payload.tier)
    const jti = randomBytes(16).toString('hex')
    return new SignJWT({
      sub: payload.sub,
      companyId: payload.companyId,
      tier: payload.tier,
      jti,
    })
      .setProtectedHeader({ alg: ALG })
      .setIssuedAt()
      .setExpirationTime(this.accessExpiry)
      .setIssuer('agencyos-api')
      .setAudience(`agencyos:${payload.tier.toLowerCase()}`)
      .sign(key)
  }

  async verifyAccessToken(token: string, tier: Tier): Promise<AccessTokenClaims> {
    const key = this.requirePublic(tier)
    const { payload } = await jwtVerify(token, key, {
      issuer: 'agencyos-api',
      audience: `agencyos:${tier.toLowerCase()}`,
    })
    return payload as unknown as AccessTokenClaims
  }

  /** Generate a 256-bit random refresh token (raw + sha256 hash). */
  generateRefreshToken(): { raw: string; hash: string } {
    const raw = randomBytes(32).toString('base64url')
    const hash = createHash('sha256').update(raw).digest('hex')
    return { raw, hash }
  }

  hashRefreshToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex')
  }

  getRefreshTtlSeconds(): number {
    return this.refreshTtlSeconds
  }

  private requirePrivate(tier: Tier): SigningKey {
    const key = this.privateKeys.get(tier)
    if (!key) throw new Error(`${tier} JWT private key not loaded`)
    return key
  }

  private requirePublic(tier: Tier): VerifyKey {
    const key = this.publicKeys.get(tier)
    if (!key) throw new Error(`${tier} JWT public key not loaded`)
    return key
  }
}

function parseDurationToSeconds(input: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(input)
  if (!match) throw new Error(`Invalid duration: ${input}`)
  const n = Number(match[1])
  const unit = match[2]
  switch (unit) {
    case 's':
      return n
    case 'm':
      return n * 60
    case 'h':
      return n * 3600
    case 'd':
      return n * 86400
    default:
      throw new Error(`Unknown unit: ${unit as string}`)
  }
}
