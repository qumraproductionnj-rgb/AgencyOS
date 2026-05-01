import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthModule } from './health/health.module'
import { DatabaseModule } from './database/database.module'
import { RedisModule } from './redis/redis.module'
import { AuthModule } from './auth/auth.module'
import { envSchema } from './config/env.validation'

@Module({
  imports: [
    // Config — validates env vars on startup via Zod.
    // envFilePath: monorepo root .env first, then api-local .env override (if any).
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validate: (config: Record<string, unknown>) => {
        const result = envSchema.safeParse(config)
        if (!result.success) {
          const errors = result.error.flatten().fieldErrors
          throw new Error(`Invalid environment variables:\n${JSON.stringify(errors, null, 2)}`)
        }
        return result.data
      },
    }),

    // Pino structured logger
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
        ...(process.env['NODE_ENV'] !== 'production' && {
          transport: { target: 'pino-pretty', options: { colorize: true, singleLine: false } },
        }),
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Feature modules
    DatabaseModule,
    RedisModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
