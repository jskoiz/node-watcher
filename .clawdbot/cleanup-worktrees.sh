#!/usr/bin/env bash
# cleanup-worktrees.sh — prune merged git worktrees and remote-tracking branches
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREES_ROOT="$(cd "$REPO_ROOT/../brdg-worktrees" 2>/dev/null && pwd)" || true

echo "[cleanup] Starting worktree + branch cleanup at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

cd "$REPO_ROOT"

# 1. Fetch and prune remote-tracking branches
git fetch origin --prune --quiet
echo "[cleanup] Pruned stale remote-tracking refs"

# 2. Remove worktrees for branches that no longer exist on origin
if git worktree list --porcelain | grep -q 'worktree'; then
  git worktree prune --verbose
  echo "[cleanup] Pruned stale worktrees"
else
  echo "[cleanup] No worktrees to prune"
fi

# 3. Delete local branches whose upstream is gone (safely)
gone_branches=$(git branch -vv | grep ': gone]' | awk '{print $1}') || true
if [ -n "$gone_branches" ]; then
  echo "$gone_branches" | xargs git branch -d 2>/dev/null || true
  echo "[cleanup] Deleted local branches with gone upstreams: $gone_branches"
else
  echo "[cleanup] No gone branches to delete"
fi

# 4. Remove leftover worktree directories under brdg-worktrees/
if [ -n "$WORKTREES_ROOT" ] && [ -d "$WORKTREES_ROOT" ]; then
  find "$WORKTREES_ROOT" -mindepth 1 -maxdepth 1 -type d | while read -r dir; do
    branch=$(basename "$dir")
    if ! git show-ref --quiet "refs/remotes/origin/$branch"; then
      echo "[cleanup] Removing stale worktree dir: $dir"
      rm -rf "$dir"
    fi
  done
else
  echo "[cleanup] No brdg-worktrees directory found, skipping dir cleanup"
fi

echo "[cleanup] Done at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
