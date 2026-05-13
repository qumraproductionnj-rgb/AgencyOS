import { Injectable, NotImplementedException } from '@nestjs/common'
import type {
  CreateIntentInput,
  IntentResult,
  LocalGatewayCode,
  LocalPaymentGateway,
  NormalizedWebhookEvent,
  ProviderStatus,
} from './local-gateway.interface'

/**
 * FastPay stub — interface-compatible placeholder.
 *
 * Real integration deferred pending API documentation. Same contract as FIB/ZainCash —
 * swap this file for the full implementation when ready.
 */
@Injectable()
export class FastPayService implements LocalPaymentGateway {
  readonly code: LocalGatewayCode = 'fastpay'
  readonly isImplemented = false

  private fail(): never {
    throw new NotImplementedException(
      'FastPay integration is not yet enabled. Obtain merchant credentials, then enable this gateway.',
    )
  }

  async createPaymentIntent(_input: CreateIntentInput): Promise<IntentResult> {
    this.fail()
  }

  async getPaymentStatus(_providerRef: string): Promise<ProviderStatus> {
    this.fail()
  }

  verifyWebhookSignature(_payload: Buffer | string, _signature: string | undefined): boolean {
    return false
  }

  parseWebhookEvent(_payload: Buffer | string): NormalizedWebhookEvent | null {
    return null
  }
}
