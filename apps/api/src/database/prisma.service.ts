import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'
import type { Env } from '../config/env.validation'
import { TenantContextService } from './tenant-context.service'

export type ExtendedTenantClient = ReturnType<typeof buildTenantClient>

/**
 * Two Prisma clients:
 *  - `system` (owner role; bypasses RLS): for auth flows and platform ops.
 *  - `tenant` (agencyos_app role; RLS enforced): dynamic getter that returns
 *    an extended client with the current request's companyId baked into the
 *    closure. Without a context, the pass-through client returns no rows
 *    (RLS sees NULL company_id → no match).
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  readonly system: PrismaClient
  private readonly _appClient: PrismaClient
  private readonly tenantContext: TenantContextService
  private readonly cache = new Map<string, ExtendedTenantClient>()
  private readonly noopClient: ExtendedTenantClient

  constructor(config: ConfigService<Env>, tenantContext: TenantContextService) {
    const appUrl = config.get('APP_DATABASE_URL', { infer: true })
    if (!appUrl) {
      throw new Error('APP_DATABASE_URL is required for the tenant client')
    }
    this.system = new PrismaClient()
    this._appClient = new PrismaClient({ datasourceUrl: appUrl })
    this.tenantContext = tenantContext
    this.noopClient = buildTenantClient(this._appClient, null)
  }

  /** Returns the tenant-scoped client for the current request's company. */
  get tenant(): ExtendedTenantClient {
    const companyId = this.tenantContext.getCompanyId()
    if (!companyId) return this.noopClient
    let client = this.cache.get(companyId)
    if (!client) {
      client = buildTenantClient(this._appClient, companyId)
      this.cache.set(companyId, client)
    }
    return client
  }

  async onModuleInit(): Promise<void> {
    await this.system.$connect()
    await this._appClient.$connect()
    this.logger.log('Database connected (system + tenant clients)')
  }

  async onModuleDestroy(): Promise<void> {
    await this.system.$disconnect()
    await this._appClient.$disconnect()
    this.logger.log('Database disconnected')
  }
}

function buildTenantClient(client: PrismaClient, companyId: string | null) {
  return client.$extends({
    name: 'tenant-rls',
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          if (!companyId) {
            return query(args)
          }
          const [, result] = await client.$transaction([
            client.$queryRawUnsafe(
              `SELECT set_config('app.current_company_id', $1, true)`,
              companyId,
            ),
            query(args),
          ])
          return result
        },
      },
    },
  })
}
