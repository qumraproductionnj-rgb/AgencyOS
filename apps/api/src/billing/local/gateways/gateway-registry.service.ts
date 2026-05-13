import { Injectable, NotFoundException } from '@nestjs/common'
import { FibService } from './fib.service'
import { ZainCashService } from './zaincash.service'
import { FastPayService } from './fastpay.service'
import type { LocalGatewayCode, LocalPaymentGateway } from './local-gateway.interface'

@Injectable()
export class GatewayRegistryService {
  private readonly registry: Map<LocalGatewayCode, LocalPaymentGateway>

  constructor(
    private readonly fib: FibService,
    private readonly zaincash: ZainCashService,
    private readonly fastpay: FastPayService,
  ) {
    this.registry = new Map<LocalGatewayCode, LocalPaymentGateway>([
      ['fib', this.fib],
      ['zaincash', this.zaincash],
      ['fastpay', this.fastpay],
    ])
  }

  get(code: LocalGatewayCode): LocalPaymentGateway {
    const gateway = this.registry.get(code)
    if (!gateway) {
      throw new NotFoundException(`Unknown payment gateway: ${code}`)
    }
    return gateway
  }

  listAvailable(): { code: LocalGatewayCode; isImplemented: boolean }[] {
    return Array.from(this.registry.values()).map((g) => ({
      code: g.code,
      isImplemented: g.isImplemented,
    }))
  }
}
