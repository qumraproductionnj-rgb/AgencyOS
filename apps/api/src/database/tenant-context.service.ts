import { Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'node:async_hooks'

export interface TenantContext {
  companyId: string
  userId: string
  tier: 'TENANT' | 'PLATFORM_ADMIN' | 'EXTERNAL'
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>()

  run<T>(ctx: TenantContext, fn: () => T): T {
    return this.storage.run(ctx, fn)
  }

  get(): TenantContext | undefined {
    return this.storage.getStore()
  }

  getCompanyId(): string | undefined {
    return this.storage.getStore()?.companyId
  }
}
