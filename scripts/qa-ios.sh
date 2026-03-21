#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
backend_dir="$repo_root/backend"
mobile_dir="$repo_root/mobile"
backend_env="$backend_dir/.env"
reset_preview=false

resolve_simulator_name() {
  if [[ -n "${IOS_SIMULATOR_NAME:-}" ]]; then
    printf '%s\n' "$IOS_SIMULATOR_NAME"
    return 0
  fi

  xcrun simctl list devices available -j | python3 -c '
import json, sys
data = json.load(sys.stdin)
for runtime in sorted(data.get("devices", {}).keys(), reverse=True):
    if "iOS" not in runtime:
        continue
    preferred = []
    fallback = []
    for device in data["devices"][runtime]:
        name = device.get("name", "")
        if "iPhone" not in name:
            continue
        if "SE" not in name:
            preferred.append(name)
        fallback.append(name)
    if preferred:
        print(preferred[0])
        sys.exit(0)
    if fallback:
        print(fallback[0])
        sys.exit(0)
sys.exit(1)
'
}

simulator_name="$(resolve_simulator_name)"

for arg in "$@"; do
  case "$arg" in
    --reset)
      reset_preview=true
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

xcrun simctl boot "$simulator_name" >/dev/null 2>&1 || true
open -a Simulator >/dev/null 2>&1 || true

if [[ "$reset_preview" == true ]]; then
  if [[ ! -f "$backend_env" ]]; then
    echo "backend/.env is required before resetting ui-preview. Copy backend/.env.example first." >&2
    exit 1
  fi

  (
    cd "$backend_dir"
    set -a
    # shellcheck disable=SC1090
    source "$backend_env"
    set +a

    backend_url=""
    if [[ -n "${API_BASE_URL:-}" ]]; then
      backend_url="$API_BASE_URL"
    elif [[ -n "${PORT:-}" ]]; then
      backend_url="http://localhost:${PORT}"
    fi

    if [[ -n "$backend_url" ]] && ! curl --silent --fail --max-time 2 "$backend_url" >/dev/null 2>&1; then
      echo "Backend at $backend_url is not reachable. Start it first with 'npm run dev:backend'." >&2
      exit 1
    fi

    npm run dev:scenario -- ui-preview
  )
fi

cd "$mobile_dir"
export SENTRY_DISABLE_AUTO_UPLOAD="${SENTRY_DISABLE_AUTO_UPLOAD:-true}"

exec npx expo start --dev-client --localhost --ios
