#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
mobile_dir="$repo_root/mobile"

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

xcrun simctl boot "$simulator_name" >/dev/null 2>&1 || true
open -a Simulator >/dev/null 2>&1 || true

cd "$mobile_dir"
export SENTRY_DISABLE_AUTO_UPLOAD="${SENTRY_DISABLE_AUTO_UPLOAD:-true}"

exec npx expo run:ios --device "$simulator_name" --no-bundler
