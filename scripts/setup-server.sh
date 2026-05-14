#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AgencyOS — First-time server setup
# Run once as root on a fresh Ubuntu 22.04 LTS Hetzner VPS
# Usage: bash setup-server.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="agencyos.app"
APP_DIR="/app/agencyos"
BACKUP_DIR="/backups"
LOG_DIR="/logs"

echo "════════════════════════════════════════"
echo " AgencyOS Server Setup"
echo "════════════════════════════════════════"

# ── System update ─────────────────────────────────────────────────────────────
echo "→ Updating system packages..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# ── Essential packages ────────────────────────────────────────────────────────
echo "→ Installing essentials..."
apt-get install -y \
  curl wget git unzip \
  ufw fail2ban \
  awscli \
  certbot python3-certbot-nginx \
  jq

# ── Firewall ──────────────────────────────────────────────────────────────────
echo "→ Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ── Fail2ban ──────────────────────────────────────────────────────────────────
echo "→ Enabling fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# ── Docker ────────────────────────────────────────────────────────────────────
echo "→ Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable docker
systemctl start docker

# ── Docker Compose (v2 plugin) ────────────────────────────────────────────────
echo "→ Installing Docker Compose plugin..."
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p "$DOCKER_CONFIG/cli-plugins"
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o "$DOCKER_CONFIG/cli-plugins/docker-compose"
chmod +x "$DOCKER_CONFIG/cli-plugins/docker-compose"

# ── Directories ───────────────────────────────────────────────────────────────
echo "→ Creating app directories..."
mkdir -p "$APP_DIR" "$BACKUP_DIR" "$LOG_DIR"
chmod 750 "$BACKUP_DIR"

# ── Swap (2GB) ────────────────────────────────────────────────────────────────
echo "→ Creating 2GB swap..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >>/etc/fstab
fi

# ── Cron: backup at 02:00 daily ───────────────────────────────────────────────
echo "→ Setting up backup cron..."
(crontab -l 2>/dev/null; echo "0 2 * * * /app/agencyos/scripts/backup.sh >> $LOG_DIR/backup.log 2>&1") | crontab -

# ── Log rotation ──────────────────────────────────────────────────────────────
cat >/etc/logrotate.d/agencyos <<EOF
$LOG_DIR/*.log {
  daily
  missingok
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 root root
}
EOF

echo ""
echo "════════════════════════════════════════"
echo " ✅ Server setup complete!"
echo ""
echo " Next steps:"
echo "  1. cd $APP_DIR"
echo "  2. git clone <repo> ."
echo "  3. cp .env.prod.example .env.prod"
echo "  4. nano .env.prod  (fill real values)"
echo "  5. bash scripts/deploy.sh"
echo "  6. certbot --nginx -d $DOMAIN -d app.$DOMAIN -d api.$DOMAIN"
echo "════════════════════════════════════════"
