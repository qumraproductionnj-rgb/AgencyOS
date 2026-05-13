/**
 * Contract every local Iraqi payment gateway must satisfy.
 *
 * Implementations: FibService (full, mockable), ZainCashService (stub), FastPayService (stub).
 * Registry: GatewayRegistryService routes by `code`.
 *
 * Currency is always IQD (fils). Amount is BigInt.
 */
export type LocalGatewayCode = 'fib' | 'zaincash' | 'fastpay'

export interface CreateIntentInput {
  intentId: string // our internal PaymentIntent.id — sent to provider as merchant reference
  amountFils: bigint
  description: string
  callbackUrl: string // where the provider POSTs the webhook
}

export interface IntentResult {
  providerRef: string // provider's payment ID
  qrCode: string | null // base64 PNG data URL, or null for redirect-only providers
  redirectUrl: string | null // optional deep link / hosted page
  expiresAt: Date | null
}

export type ProviderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'

export interface LocalPaymentGateway {
  readonly code: LocalGatewayCode

  /** Whether this gateway is fully implemented or a stub. UI may surface "Coming soon" for stubs. */
  readonly isImplemented: boolean

  createPaymentIntent(input: CreateIntentInput): Promise<IntentResult>

  getPaymentStatus(providerRef: string): Promise<ProviderStatus>

  /** Verify webhook signature. Returns false instead of throwing so callers control error handling. */
  verifyWebhookSignature(payload: Buffer | string, signature: string | undefined): boolean

  /**
   * Parse a webhook payload into a normalized event. Returns null if the event is not relevant
   * (e.g., unrecognized type that should be acknowledged but not processed).
   */
  parseWebhookEvent(payload: Buffer | string): NormalizedWebhookEvent | null
}

export interface NormalizedWebhookEvent {
  providerRef: string
  status: ProviderStatus
  eventId: string // for idempotency in webhook_events
  eventType: string
  raw: unknown
}
