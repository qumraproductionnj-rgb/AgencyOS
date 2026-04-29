import { Injectable } from '@nestjs/common'
import { HealthIndicator, type HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import type { Env } from '../../config/env.validation'

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly config: ConfigService<Env>) {
    super()
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const url = this.config.get('REDIS_URL', { infer: true }) ?? 'redis://localhost:6379'
    const client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 })
    try {
      await client.connect()
      await client.ping()
      return this.getStatus(key, true)
    } catch (error) {
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { error: String(error) }),
      )
    } finally {
      client.disconnect()
    }
  }
}
