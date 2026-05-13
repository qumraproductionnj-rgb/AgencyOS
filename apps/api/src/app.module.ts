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
import { ClientsModule } from './clients/client.module'
import { QuotationsModule } from './quotations/quotation.module'
import { InvoicesModule } from './invoices/invoice.module'
import { LeavesModule } from './leave/leave.module'
import { PayrollModule } from './payroll/payroll.module'
import { PerformanceReviewsModule } from './performance-reviews/performance-review.module'
import { CampaignsModule } from './campaigns/campaign.module'
import { ProjectsModule } from './projects/project.module'
import { TasksModule } from './tasks/task.module'
import { FilesModule } from './files/file.module'
import { NotificationsModule } from './notifications/notification.module'
import { ExpensesModule } from './expenses/expense.module'
import { ExchangeRatesModule } from './exchange-rates/exchange-rate.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { SearchModule } from './search/search.module'
import { OnboardingModule } from './onboarding/onboarding.module'
import { AssetsModule } from './assets/asset.module'
import { BrandBriefsModule } from './brand-briefs/brand-brief.module'
import { ContentPillarsModule } from './content-pillars/content-pillar.module'
import { AiModule } from './ai/ai.module'
import { ContentPlansModule } from './content-plans/content-plan.module'
import { FrameworksModule } from './frameworks/framework.module'
import { ContentPiecesModule } from './content-pieces/content-piece.module'
import { IntegrationModule } from './integrations/integration.module'
import { PortalAuthModule } from './portal-auth/portal-auth.module'
import { ClientPortalModule } from './client-portal/client-portal.module'
import { TelegramModule } from './telegram/telegram.module'
import { EquipmentModule } from './equipment/equipment.module'
import { ExhibitionsModule } from './exhibitions/exhibition.module'
import { SubscriptionsModule } from './subscriptions/subscription.module'
import { BillingModule } from './billing/billing.module'
import { LifecycleModule } from './lifecycle/lifecycle.module'
import { PlatformAuthModule } from './platform-auth/platform-auth.module'
import { PlatformAdminModule } from './platform-admin/platform-admin.module'
import { ReportsModule } from './reports/reports.module'
import { ExternalWebhookModule } from './external-webhooks/external-webhook.module'
import { WhiteLabelModule } from './white-label/white-label.module'
import { SupportModule } from './support/support.module'
import { SubscriptionActiveGuard } from './common/guards/subscription-active.guard'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { PermissionsGuard } from './common/guards/permission.guard'
import { RolesGuard } from './common/guards/role.guard'
import { PlanLimitGuard } from './common/guards/plan-limit.guard'
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
    ClientsModule,
    QuotationsModule,
    InvoicesModule,
    LeavesModule,
    PayrollModule,
    PerformanceReviewsModule,
    CampaignsModule,
    ProjectsModule,
    TasksModule,
    FilesModule,
    NotificationsModule,
    ExpensesModule,
    ExchangeRatesModule,
    DashboardModule,
    SearchModule,
    OnboardingModule,
    AssetsModule,
    BrandBriefsModule,
    ContentPillarsModule,
    AiModule,
    ContentPlansModule,
    ContentPiecesModule,
    FrameworksModule,
    IntegrationModule,
    PortalAuthModule,
    ClientPortalModule,
    TelegramModule,
    EquipmentModule,
    ExhibitionsModule,
    SubscriptionsModule,
    BillingModule,
    LifecycleModule,
    PlatformAuthModule,
    PlatformAdminModule,
    ReportsModule,
    ExternalWebhookModule,
    WhiteLabelModule,
    SupportModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: PlanLimitGuard },
    { provide: APP_GUARD, useClass: SubscriptionActiveGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
  ],
})
export class AppModule {}
