import { Injectable } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus'
import { ConfigService } from '@nestjs/config'
import { createClient } from 'redis'
import type { Env } from '../../config/env.validation'

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly config: ConfigService<Env>) {
    super()
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const client = createClient({ url: this.config.get('REDIS_URL', { infer: true }) })
    try {
      await client.connect()
      await client.ping()
      await client.quit()
      return this.getStatus(key, true)
    } catch (error) {
      try {
        await client.quit()
      } catch {
        // ignore cleanup errors
      }
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { error: String(error) }),
      )
    }
  }
}
