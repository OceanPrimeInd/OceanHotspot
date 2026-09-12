#!/usr/bin/env bash
# Dump Supabase public schema + data for disaster recovery.
# Usage: ./scripts/backup-supabase.sh
# Output: backups/oceanhotspot-YYYY-MM-DD-HHMM.sql (gitignored)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/backups"
STAMP="$(date +%Y-%m-%d-%H%M)"
OUT="$ROOT/backups/oceanhotspot-${STAMP}.sql"

echo "Writing backup to $OUT ..."
supabase db dump --linked -f "$OUT"
echo "Done. Store this file securely; do not commit to git."
