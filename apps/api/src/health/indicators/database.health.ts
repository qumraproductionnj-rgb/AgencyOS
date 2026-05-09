import { Injectable } from '@nestjs/common'
import { HealthIndicator, type HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.system.$queryRaw`SELECT 1`
      return this.getStatus(key, true)
    } catch (error) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, { error: String(error) }),
      )
    }
  }
}
