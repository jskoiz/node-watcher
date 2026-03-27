#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREE_ROOT="$ROOT_DIR/.release-worktrees"
TARGET="${WORKTREE_ROOT}/ios-release"
REMOTE_NAME="origin"
REMOTE_BRANCH="main"
LOCAL_BRANCH="main"

usage() {
  cat <<'EOF'
Usage: ./scripts/release-worktree.sh [--path <target>] [--remote <name>] [--branch <name>]

Create or refresh a dedicated clean release checkout that fast-forwards to origin/main.
EOF
}

fail() {
  echo "release-worktree: $*" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --path)
      shift
      TARGET="${1:-}"
      ;;
    --remote)
      shift
      REMOTE_NAME="${1:-}"
      ;;
    --branch)
      shift
      REMOTE_BRANCH="${1:-}"
      LOCAL_BRANCH="${1:-}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "unknown argument: $1"
      ;;
  esac
  shift
done

mkdir -p "$WORKTREE_ROOT"
git -C "$ROOT_DIR" fetch "$REMOTE_NAME" "$REMOTE_BRANCH"

if [[ -e "$TARGET" ]]; then
  branch_name="$(git -C "$TARGET" branch --show-current)"
  [[ -n "$branch_name" ]] || fail "existing release worktree is detached: $TARGET"
  [[ "$branch_name" == "$LOCAL_BRANCH" ]] || fail "existing release worktree is on '$branch_name', expected '$LOCAL_BRANCH'"
  status_output="$(git -C "$TARGET" status --porcelain --untracked-files=normal)"
  [[ -z "$status_output" ]] || fail "existing release worktree is dirty: $TARGET"

  git -C "$TARGET" checkout "$LOCAL_BRANCH" >/dev/null 2>&1 || true
  git -C "$TARGET" merge --ff-only "$REMOTE_NAME/$REMOTE_BRANCH"
else
  git -C "$ROOT_DIR" worktree add -B "$LOCAL_BRANCH" "$TARGET" "$REMOTE_NAME/$REMOTE_BRANCH"
fi

echo "$TARGET"
