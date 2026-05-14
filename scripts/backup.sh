#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AgencyOS — Database backup to Cloudflare R2
# Runs daily at 02:00 via cron
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

source /app/agencyos/.env.prod 2>/dev/null || true

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
FILENAME="db_${DATE}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"
APP_DIR="/app/agencyos"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.prod.yml"

notify_telegram() {
  local msg="$1"
  if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT_ID}" \
      -d "text=${msg}" \
      -d "parse_mode=HTML" >/dev/null || true
  fi
}

echo "$(date): Starting backup..."

# ── Dump PostgreSQL ───────────────────────────────────────────────────────────
cd "$APP_DIR"
$COMPOSE exec -T postgres pg_dump \
  -U agencyos \
  agencyos_prod | gzip >"$FILEPATH"

FILESIZE=$(du -sh "$FILEPATH" | cut -f1)
echo "$(date): Dumped $FILESIZE → $FILEPATH"

# ── Upload to Cloudflare R2 ───────────────────────────────────────────────────
if [ -n "${R2_ENDPOINT:-}" ] && [ -n "${R2_BUCKET:-}" ]; then
  AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}" \
  AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}" \
  aws s3 cp "$FILEPATH" "s3://${R2_BUCKET}/backups/${FILENAME}" \
    --endpoint-url "${R2_ENDPOINT}" \
    --no-progress

  echo "$(date): Uploaded to R2: backups/${FILENAME}"
else
  echo "$(date): WARNING — R2 not configured, backup stored locally only"
fi

# ── Delete local backups older than 7 days (R2 keeps 30) ─────────────────────
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +7 -delete
echo "$(date): Cleaned old local backups"

# ── Notify success ────────────────────────────────────────────────────────────
notify_telegram "✅ <b>AgencyOS Backup</b>%0ASize: ${FILESIZE}%0AFile: ${FILENAME}%0A$(date '+%Y-%m-%d %H:%M')"

echo "$(date): Backup complete ✅"
