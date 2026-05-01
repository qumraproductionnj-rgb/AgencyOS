import { Injectable } from '@nestjs/common'
import { randomBytes } from 'node:crypto'
import { RedisService } from '../../redis/redis.service'

const VERIFY_PREFIX = 'auth:verify-email:'
const RESET_PREFIX = 'auth:password-reset:'
const VERIFY_TTL_SECONDS = 60 * 60 * 24 // 24h
const RESET_TTL_SECONDS = 60 * 60 // 1h

@Injectable()
export class VerificationService {
  constructor(private readonly redis: RedisService) {}

  async createVerifyEmailToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('base64url')
    await this.redis.set(`${VERIFY_PREFIX}${token}`, userId, VERIFY_TTL_SECONDS)
    return token
  }

  async consumeVerifyEmailToken(token: string): Promise<string | null> {
    const key = `${VERIFY_PREFIX}${token}`
    const userId = await this.redis.get(key)
    if (userId === null) return null
    await this.redis.del(key)
    return userId
  }

  async createPasswordResetToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('base64url')
    await this.redis.set(`${RESET_PREFIX}${token}`, userId, RESET_TTL_SECONDS)
    return token
  }

  async consumePasswordResetToken(token: string): Promise<string | null> {
    const key = `${RESET_PREFIX}${token}`
    const userId = await this.redis.get(key)
    if (userId === null) return null
    await this.redis.del(key)
    return userId
  }
}
