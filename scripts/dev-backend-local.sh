#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
backend_dir="$repo_root/backend"
env_file="$backend_dir/.env"

if [[ ! -f "$env_file" ]]; then
  echo "backend/.env is required for local backend runs. Copy backend/.env.example first." >&2
  exit 1
fi

cd "$backend_dir"
set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

exec npm run start:dev
