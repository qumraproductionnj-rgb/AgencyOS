#!/usr/bin/env bash
# =============================================================
# Generate RS256 JWT keypairs for AgencyOS auth tiers
# =============================================================
# Outputs base64-encoded PEM strings ready to paste into .env
# Usage: ./scripts/generate-jwt-keys.sh [tier]
#   tier: tenant | platform | external (default: tenant)
# =============================================================

set -euo pipefail

TIER="${1:-tenant}"

case "$TIER" in
  tenant|platform|external) ;;
  *) echo "Error: tier must be one of: tenant, platform, external"; exit 1 ;;
esac

TIER_UPPER=$(echo "$TIER" | tr '[:lower:]' '[:upper:]')
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out "$TMP_DIR/priv.pem" 2>/dev/null

openssl rsa -in "$TMP_DIR/priv.pem" -pubout \
  -out "$TMP_DIR/pub.pem" 2>/dev/null

PRIV_B64=$(base64 -w0 < "$TMP_DIR/priv.pem")
PUB_B64=$(base64 -w0 < "$TMP_DIR/pub.pem")

echo "# === JWT $TIER_UPPER tier (RSA-2048 PEM, base64) ==="
echo "JWT_${TIER_UPPER}_PRIVATE_KEY=$PRIV_B64"
echo "JWT_${TIER_UPPER}_PUBLIC_KEY=$PUB_B64"
