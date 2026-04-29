import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthModule } from './health/health.module'
import { DatabaseModule } from './database/database.module'
import { envSchema } from './config/env.validation'

@Module({
  imports: [
    // Config — validates env vars on startup via Zod
    ConfigModule.forRoot({
      isGlobal: true,
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
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: false } }
            : undefined,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Feature modules
    HealthModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
