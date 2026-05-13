-- Phase 4.8: External Webhook Subscriptions (tenant-registered integrations)

CREATE TABLE "webhook_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[] NOT NULL,
    "secret" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "last_delivery_at" TIMESTAMPTZ,
    "last_delivery_status" TEXT,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "webhook_subscriptions"
  ADD CONSTRAINT "webhook_subscriptions_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "idx_webhook_subs_company_id" ON "webhook_subscriptions"("company_id");

ALTER TABLE "webhook_subscriptions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "webhook_subscriptions"
  USING (company_id = current_setting('app.current_company_id')::uuid);
GRANT SELECT, INSERT, UPDATE, DELETE ON "webhook_subscriptions" TO "agencyos_app";

CREATE TABLE "webhook_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subscription_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "status_code" INTEGER,
    "response_body" TEXT,
    "error_message" TEXT,
    "succeeded" BOOLEAN NOT NULL DEFAULT FALSE,
    "next_retry_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "webhook_deliveries"
  ADD CONSTRAINT "webhook_deliveries_subscription_id_fkey"
    FOREIGN KEY ("subscription_id") REFERENCES "webhook_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "idx_webhook_deliveries_sub_id" ON "webhook_deliveries"("subscription_id");
CREATE INDEX "idx_webhook_deliveries_retry" ON "webhook_deliveries"("succeeded", "next_retry_at");

GRANT SELECT, INSERT, UPDATE, DELETE ON "webhook_deliveries" TO "agencyos_app";
