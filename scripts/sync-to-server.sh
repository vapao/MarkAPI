#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/sync-to-server.sh <ssh-target> [remote-dir]

Examples:
  scripts/sync-to-server.sh root@example.com
  scripts/sync-to-server.sh deploy@example.com /data/dmark

Environment:
  SSH_OPTS   Extra ssh options, for example: -p 2222 -i ~/.ssh/id_ed25519
  DRY_RUN=1  Print what would be synced without changing the server
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage >&2
  exit 2
fi

SSH_TARGET="$1"
REMOTE_DIR="${2:-/data/dmark}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SSH_COMMAND="ssh ${SSH_OPTS:-}"
RSYNC_FLAGS=(-az --delete)

if [[ "${DRY_RUN:-}" == "1" ]]; then
  RSYNC_FLAGS+=(--dry-run --itemize-changes)
fi

ssh ${SSH_OPTS:-} "$SSH_TARGET" "mkdir -p '$REMOTE_DIR'"

rsync "${RSYNC_FLAGS[@]}" \
  -e "$SSH_COMMAND" \
  --exclude='.git/' \
  --exclude='.next/' \
  --exclude='node_modules/' \
  --exclude='data/*.db' \
  --exclude='data/*.db-*' \
  --exclude='.env' \
  --exclude='*.log' \
  "$PROJECT_DIR/" \
  "$SSH_TARGET:$REMOTE_DIR/"
