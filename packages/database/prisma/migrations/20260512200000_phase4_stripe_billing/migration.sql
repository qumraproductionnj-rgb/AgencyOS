-- Phase 4.2: Stripe Billing Integration
-- Adds Stripe linkage to plans + extended subscription fields + webhook idempotency log.

-- subscription_plans: Stripe product/price linkage
ALTER TABLE "subscription_plans"
  ADD COLUMN "stripe_product_id" TEXT,
  ADD COLUMN "stripe_price_id_monthly" TEXT,
  ADD COLUMN "stripe_price_id_yearly" TEXT;

-- subscriptions: extended billing metadata
ALTER TABLE "subscriptions"
  ADD COLUMN "stripe_price_id" TEXT,
  ADD COLUMN "payment_method_last4" TEXT,
  ADD COLUMN "payment_method_brand" TEXT,
  ADD COLUMN "billing_interval" TEXT,
  ADD COLUMN "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT FALSE;

-- webhook_events: idempotency log (system-wide, no RLS)
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "uniq_webhook_provider_event" ON "webhook_events"("provider", "event_id");
CREATE INDEX "webhook_events_event_type_idx" ON "webhook_events"("event_type");

GRANT SELECT, INSERT, UPDATE, DELETE ON "webhook_events" TO "agencyos_app";
