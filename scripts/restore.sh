#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AgencyOS — Restore database from R2 backup
# Usage: bash scripts/restore.sh db_20260515_020001.sql.gz
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

source /app/agencyos/.env.prod 2>/dev/null || true

FILENAME="${1:-}"
APP_DIR="/app/agencyos"
BACKUP_DIR="/backups"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.prod.yml"

if [ -z "$FILENAME" ]; then
  echo "Usage: $0 <backup-filename>"
  echo ""
  echo "Available backups in R2:"
  AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}" \
  AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}" \
  aws s3 ls "s3://${R2_BUCKET}/backups/" \
    --endpoint-url "${R2_ENDPOINT}" | sort -r | head -20
  exit 1
fi

FILEPATH="${BACKUP_DIR}/${FILENAME}"

echo "════════════════════════════════════════"
echo " AgencyOS Database Restore"
echo " File: $FILENAME"
echo "════════════════════════════════════════"
echo ""
echo "⚠️  WARNING: This will OVERWRITE the current database!"
read -r -p "Type 'YES' to confirm: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Aborted."
  exit 0
fi

# ── Download if not local ─────────────────────────────────────────────────────
if [ ! -f "$FILEPATH" ]; then
  echo "→ Downloading from R2..."
  AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}" \
  AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}" \
  aws s3 cp "s3://${R2_BUCKET}/backups/${FILENAME}" "$FILEPATH" \
    --endpoint-url "${R2_ENDPOINT}"
fi

# ── Stop API to prevent connections ───────────────────────────────────────────
echo "→ Stopping API..."
cd "$APP_DIR"
$COMPOSE stop api web

# ── Restore ───────────────────────────────────────────────────────────────────
echo "→ Restoring database..."
gunzip -c "$FILEPATH" | $COMPOSE exec -T postgres psql \
  -U agencyos agencyos_prod

# ── Restart services ──────────────────────────────────────────────────────────
echo "→ Restarting services..."
$COMPOSE start api web

echo ""
echo "✅ Restore complete from: $FILENAME"
