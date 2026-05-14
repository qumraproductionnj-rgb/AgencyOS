#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AgencyOS — Deploy script
# Run on every deploy (called by GitHub Actions or manually)
# Usage: bash scripts/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/app/agencyos"
COMPOSE="docker compose -f docker-compose.prod.yml"
TELEGRAM_BOT="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT="${TELEGRAM_CHAT_ID:-}"

notify() {
  local msg="$1"
  if [ -n "$TELEGRAM_BOT" ] && [ -n "$TELEGRAM_CHAT" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT}" \
      -d "text=${msg}" \
      -d "parse_mode=HTML" >/dev/null || true
  fi
}

cd "$APP_DIR"

echo "════════════════════════════════════════"
echo " AgencyOS Deploy — $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════"

# ── Pull latest code ──────────────────────────────────────────────────────────
echo "→ Pulling latest code..."
git pull origin main

COMMIT=$(git log -1 --pretty=format:"%h %s")
echo "   Commit: $COMMIT"

# ── Build images ──────────────────────────────────────────────────────────────
echo "→ Building Docker images..."
$COMPOSE build --no-cache --parallel

# ── Start/update services ─────────────────────────────────────────────────────
echo "→ Starting services..."
$COMPOSE up -d --remove-orphans

# ── Wait for API to be healthy ────────────────────────────────────────────────
echo "→ Waiting for API health check..."
RETRIES=15
until curl -sf http://localhost:3001/health >/dev/null || [ $RETRIES -eq 0 ]; do
  echo "   Waiting... ($RETRIES retries left)"
  RETRIES=$((RETRIES - 1))
  sleep 5
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ API health check failed!"
  notify "❌ <b>AgencyOS Deploy FAILED</b>%0A${COMMIT}%0AAPI did not become healthy"
  exit 1
fi

# ── Run migrations ────────────────────────────────────────────────────────────
echo "→ Running DB migrations..."
$COMPOSE exec -T api pnpm --filter @agencyos/database db:deploy

# ── Production seed (creates super admin if not exists) ───────────────────────
echo "→ Running production seed..."
$COMPOSE exec -T api pnpm --filter @agencyos/database seed:prod || true

# ── Cleanup old images ────────────────────────────────────────────────────────
echo "→ Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "════════════════════════════════════════"
echo " ✅ Deploy complete!"
echo " Commit: $COMMIT"
echo "════════════════════════════════════════"

notify "✅ <b>AgencyOS Deployed</b>%0A${COMMIT}%0A$(date '+%Y-%m-%d %H:%M')"
