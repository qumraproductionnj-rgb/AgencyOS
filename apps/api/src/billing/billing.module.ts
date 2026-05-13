import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { BillingController } from './billing.controller'
import { BillingService } from './billing.service'
import { StripeService } from './stripe.service'
import { WebhookController } from './webhook.controller'
// Phase 4.3 — Local Iraqi gateways + manual bank transfer
import { FibService } from './local/gateways/fib.service'
import { ZainCashService } from './local/gateways/zaincash.service'
import { FastPayService } from './local/gateways/fastpay.service'
import { GatewayRegistryService } from './local/gateways/gateway-registry.service'
import { PaymentIntentService } from './local/payment-intent.service'
import { ManualPaymentService } from './local/manual-payment.service'
import { LocalBillingController } from './local/local-billing.controller'
import { ManualPaymentController } from './local/manual-payment.controller'
import { LocalWebhookController } from './local/local-webhook.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [
    BillingController,
    WebhookController,
    LocalBillingController,
    ManualPaymentController,
    LocalWebhookController,
  ],
  providers: [
    BillingService,
    StripeService,
    FibService,
    ZainCashService,
    FastPayService,
    GatewayRegistryService,
    PaymentIntentService,
    ManualPaymentService,
  ],
  exports: [
    BillingService,
    StripeService,
    GatewayRegistryService,
    PaymentIntentService,
    ManualPaymentService,
  ],
})
export class BillingModule {}
