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
 * ZainCash stub — interface-compatible placeholder.
 *
 * Real integration requires a commercial merchant agreement with Zain Iraq.
 * Once credentials are obtained, replace this file with the full implementation.
 * The contract guarantees no caller changes will be needed.
 */
@Injectable()
export class ZainCashService implements LocalPaymentGateway {
  readonly code: LocalGatewayCode = 'zaincash'
  readonly isImplemented = false

  private fail(): never {
    throw new NotImplementedException(
      'ZainCash integration is not yet enabled. Contact Zain Iraq merchant onboarding to obtain credentials, then enable this gateway.',
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
