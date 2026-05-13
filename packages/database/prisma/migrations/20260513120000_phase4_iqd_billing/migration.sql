-- Phase 4.3: Local Iraqi Payment Gateways + Manual Bank Transfer
-- Adds IQD pricing to plans + payment_intents table for FIB / ZainCash / FastPay / manual flows.

-- subscription_plans: IQD pricing + gateway-specific product refs
ALTER TABLE "subscription_plans"
  ADD COLUMN "price_monthly_iqd" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN "price_yearly_iqd"  BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN "gateway_product_refs" JSONB NOT NULL DEFAULT '{}';

-- Enum: payment intent lifecycle states
CREATE TYPE "payment_intent_status" AS ENUM (
  'PENDING',
  'AWAITING_VERIFICATION',
  'PAID',
  'FAILED',
  'EXPIRED',
  'CANCELLED',
  'REJECTED'
);

-- Table: payment_intents (tenant-scoped subscription payment attempts)
CREATE TABLE "payment_intents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "subscription_id" UUID,
    "plan_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_ref" TEXT,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IQD',
    "interval" TEXT NOT NULL,
    "status" "payment_intent_status" NOT NULL DEFAULT 'PENDING',
    "qr_code" TEXT,
    "redirect_url" TEXT,
    "receipt_file_id" UUID,
    "bank_reference" TEXT,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    "expires_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "payment_intents"
  ADD CONSTRAINT "payment_intents_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_intents_plan_id_fkey"
    FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "idx_payment_intents_company_id"     ON "payment_intents"("company_id");
CREATE INDEX "idx_payment_intents_status"          ON "payment_intents"("status");
CREATE INDEX "idx_payment_intents_provider_ref"    ON "payment_intents"("provider", "provider_ref");

-- RLS
ALTER TABLE "payment_intents" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "payment_intents"
  USING (company_id = current_setting('app.current_company_id')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON "payment_intents" TO "agencyos_app";
