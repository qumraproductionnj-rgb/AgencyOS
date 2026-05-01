import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import type { Env } from '../config/env.validation'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private readonly client: Redis

  constructor(config: ConfigService<Env>) {
    const url = config.get('REDIS_URL', { infer: true }) ?? 'redis://localhost:6379'
    this.client = new Redis(url, { maxRetriesPerRequest: 3 })
    this.client.on('error', (err) => {
      this.logger.error(`Redis error: ${err.message}`)
    })
  }

  getClient(): Redis {
    return this.client
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds === undefined) {
      await this.client.set(key, value)
    } else {
      await this.client.set(key, value, 'EX', ttlSeconds)
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  async onModuleDestroy(): Promise<void> {
    this.client.disconnect()
  }
}
