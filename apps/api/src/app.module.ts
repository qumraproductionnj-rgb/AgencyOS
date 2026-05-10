import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthModule } from './health/health.module'
import { DatabaseModule } from './database/database.module'
import { RedisModule } from './redis/redis.module'
import { AuthModule } from './auth/auth.module'
import { MeModule } from './me/me.module'
import { PermissionModule } from './permissions/permission.module'
import { DepartmentsModule } from './departments/department.module'
import { EmployeesModule } from './employees/employee.module'
import { WorkLocationsModule } from './work-locations/work-location.module'
import { AttendanceModule } from './attendance/attendance.module'
import { AuditModule } from './audit/audit.module'
import { LeadsModule } from './leads/lead.module'
import { LeavesModule } from './leave/leave.module'
import { PayrollModule } from './payroll/payroll.module'
import { PerformanceReviewsModule } from './performance-reviews/performance-review.module'
import { OnboardingModule } from './onboarding/onboarding.module'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { PermissionsGuard } from './common/guards/permission.guard'
import { RolesGuard } from './common/guards/role.guard'
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor'
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
    MeModule,
    PermissionModule,
    DepartmentsModule,
    EmployeesModule,
    WorkLocationsModule,
    AttendanceModule,
    AuditModule,
    LeadsModule,
    LeavesModule,
    PayrollModule,
    PerformanceReviewsModule,
    OnboardingModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
  ],
})
export class AppModule {}
