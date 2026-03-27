#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"

cd "$repo_root"

if [[ -f "$repo_root/symphony/.env" ]]; then
  set -a
  source "$repo_root/symphony/.env"
  set +a
fi

if [[ -z "${LINEAR_API_KEY:-}" ]]; then
  echo "LINEAR_API_KEY is required." >&2
  exit 1
fi

export LINEAR_PROJECT_SLUG="${LINEAR_PROJECT_SLUG:-c4e0e3663a68}"

npm run dev:symphony -- ./WORKFLOW.md
