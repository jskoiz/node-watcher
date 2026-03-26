#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
MOBILE_DIR="$ROOT_DIR/mobile"

if [[ -f "$BACKEND_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$BACKEND_DIR/.env"
  set +a
elif [[ -f "$BACKEND_DIR/.env.example" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$BACKEND_DIR/.env.example"
  set +a
fi

API_PORT="${API_PORT:-${PORT:-3010}}"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:${API_PORT}}"
HEALTH_URL="${HEALTH_URL:-${API_BASE_URL}/health}"
BACKEND_LOG="${BACKEND_LOG:-/tmp/brdg-backend-smoke.log}"
SCENARIO_LOG="${SCENARIO_LOG:-/tmp/brdg-ui-preview-smoke.json}"
BOOTSTRAP_LOG="${BOOTSTRAP_LOG:-/tmp/brdg-bootstrap-smoke.log}"
SMOKE_NOW_ISO="${SMOKE_NOW_ISO:-$(date -u +%Y-%m-%dT12:00:00.000Z)}"
CURRENT_STEP="init"
CURRENT_COMMAND=""

export SEED_NOW_ISO="${SEED_NOW_ISO:-$SMOKE_NOW_ISO}"
export SCENARIO_NOW_ISO="${SCENARIO_NOW_ISO:-$SMOKE_NOW_ISO}"

timestamp() {
  date -u +%Y-%m-%dT%H:%M:%SZ
}

print_log_tail() {
  local label="$1"
  local file="$2"
  if [[ -f "$file" ]]; then
    echo "--- ${label}: ${file} ---" >&2
    tail -n 120 "$file" >&2 || true
  fi
}

find_backend_listener() {
  lsof -tiTCP:"$API_PORT" -sTCP:LISTEN 2>/dev/null || true
}

kill_process_tree() {
  local parent_pid="$1"
  local child_pid

  for child_pid in $(pgrep -P "$parent_pid" 2>/dev/null || true); do
    kill_process_tree "$child_pid"
  done

  if kill -0 "$parent_pid" 2>/dev/null; then
    kill "$parent_pid" 2>/dev/null || true
  fi
}

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill_process_tree "$BACKEND_PID"
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

fail_step() {
  local exit_code="$1"
  echo "[$(timestamp)] Smoke failed during: ${CURRENT_STEP}" >&2
  if [[ -n "$CURRENT_COMMAND" ]]; then
    echo "Command: ${CURRENT_COMMAND}" >&2
  fi
  print_log_tail "Bootstrap log" "$BOOTSTRAP_LOG"
  print_log_tail "Scenario log" "$SCENARIO_LOG"
  print_log_tail "Backend log" "$BACKEND_LOG"
  exit "$exit_code"
}

trap 'fail_step $?' ERR

EXISTING_BACKEND_PID="$(find_backend_listener)"
if [[ -n "$EXISTING_BACKEND_PID" ]]; then
  echo "Port $API_PORT is already in use by PID $EXISTING_BACKEND_PID. Stop the existing backend before running smoke." >&2
  ps -o pid,ppid,command -p "$EXISTING_BACKEND_PID" >&2 || true
  exit 1
fi

echo "[1/6] Backend bootstrap (db up/wait/migrate/seed)"
CURRENT_STEP="backend bootstrap"
CURRENT_COMMAND="(cd \"$BACKEND_DIR\" && npm run dev:bootstrap)"
(
  cd "$BACKEND_DIR"
  npm run dev:bootstrap >"$BOOTSTRAP_LOG" 2>&1
)

echo "[2/6] Start backend"
CURRENT_STEP="backend start"
CURRENT_COMMAND="(cd \"$BACKEND_DIR\" && npm run start:dev >\"$BACKEND_LOG\" 2>&1)"
(
  cd "$BACKEND_DIR"
  npm run start:dev >"$BACKEND_LOG" 2>&1
) &
BACKEND_PID=$!

echo "[3/6] Wait for backend @ $HEALTH_URL"
CURRENT_STEP="backend health"
CURRENT_COMMAND="curl -fsS \"$HEALTH_URL\""
BACKEND_READY=0
HEALTH_RESPONSE=""
for _ in {1..45}; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Backend process exited before it became ready. Last logs:" >&2
    tail -n 120 "$BACKEND_LOG" >&2 || true
    fail_step 1
  fi

  if HEALTH_RESPONSE="$(curl -fsS "$HEALTH_URL" 2>/dev/null)"; then
    BACKEND_READY=1
    break
  fi
  sleep 1
done

if [[ "$BACKEND_READY" -ne 1 ]]; then
  echo "Backend did not become ready. Last logs:" >&2
  tail -n 120 "$BACKEND_LOG" >&2 || true
  fail_step 1
fi
echo "Health: $HEALTH_RESPONSE"

echo "[4/6] Reset seeded UI preview scenario"
CURRENT_STEP="ui-preview reset"
CURRENT_COMMAND="(cd \"$BACKEND_DIR\" && npm run dev:scenario -- ui-preview >\"$SCENARIO_LOG\")"
(
  cd "$BACKEND_DIR"
  npm run dev:scenario -- ui-preview >"$SCENARIO_LOG"
)

echo "[5/6] Mobile launch prerequisites"
CURRENT_STEP="mobile launch prerequisites"
CURRENT_COMMAND="(cd \"$MOBILE_DIR\" && npx expo-doctor && npm run typecheck)"
(
  cd "$MOBILE_DIR"
  npx expo-doctor
  npm run typecheck
)

echo "[6/6] Smoke complete"
echo "Backend log: $BACKEND_LOG"
echo "Bootstrap log: $BOOTSTRAP_LOG"
echo "Scenario log: $SCENARIO_LOG"
