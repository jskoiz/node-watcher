#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREE_ROOT="$ROOT_DIR/.codex-worktrees"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <task-name> [base-ref]" >&2
  exit 1
fi

slug="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"
if [[ -z "$slug" ]]; then
  echo "Task name must contain letters or digits." >&2
  exit 1
fi

branch="codex/$slug"
target="$WORKTREE_ROOT/$slug"
base_ref="${2:-HEAD}"

mkdir -p "$WORKTREE_ROOT"

if [[ -e "$target" ]]; then
  echo "Target already exists: $target" >&2
  exit 1
fi

if git -C "$ROOT_DIR" show-ref --verify --quiet "refs/heads/$branch"; then
  git -C "$ROOT_DIR" worktree add "$target" "$branch"
else
  git -C "$ROOT_DIR" worktree add -b "$branch" "$target" "$base_ref"
fi

echo "$target"
