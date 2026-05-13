-- Phase 4.9: White-label branding fields on companies

ALTER TABLE "companies"
  ADD COLUMN "custom_subdomain"      TEXT,
  ADD COLUMN "custom_domain"         TEXT,
  ADD COLUMN "brand_primary_color"   TEXT,
  ADD COLUMN "brand_secondary_color" TEXT,
  ADD COLUMN "hide_powered_by"       BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX "companies_custom_subdomain_key" ON "companies"("custom_subdomain");
CREATE UNIQUE INDEX "companies_custom_domain_key"    ON "companies"("custom_domain");
