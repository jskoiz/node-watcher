#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
shared_codex_home="${HOME}/.codex"
symphony_codex_home="$repo_root/.symphony/codex-home"
workspace_root="$repo_root/.symphony/workspaces"

cd "$repo_root"

append_trusted_project() {
  local config_path="$1"
  local project_path="$2"
  local escaped_path="${project_path//\\/\\\\}"
  escaped_path="${escaped_path//\"/\\\"}"

  {
    printf '\n[projects.\"%s\"]\n' "$escaped_path"
    printf 'trust_level = \"trusted\"\n'
  } >> "$config_path"
}

prepare_symphony_codex_home() {
  mkdir -p "$symphony_codex_home"

  for shared_entry in AGENTS.md auth.json cache plugins skills; do
    if [[ -e "$shared_codex_home/$shared_entry" && ! -e "$symphony_codex_home/$shared_entry" ]]; then
      ln -s "$shared_codex_home/$shared_entry" "$symphony_codex_home/$shared_entry"
    fi
  done

  local config_path="$symphony_codex_home/config.toml"
  if [[ -f "$shared_codex_home/config.toml" ]]; then
    cp "$shared_codex_home/config.toml" "$config_path"
  else
    : > "$config_path"
  fi

  append_trusted_project "$config_path" "$repo_root"
  if [[ -d "$workspace_root" ]]; then
    while IFS= read -r workspace_path; do
      append_trusted_project "$config_path" "$workspace_path"
    done < <(find "$workspace_root" -mindepth 1 -maxdepth 1 -type d | sort)
  fi
}

if [[ -f "$repo_root/symphony/.env" ]]; then
  set -a
  source "$repo_root/symphony/.env"
  set +a
fi

prepare_symphony_codex_home
export CODEX_HOME="$symphony_codex_home"

if [[ -z "${LINEAR_API_KEY:-}" ]]; then
  echo "LINEAR_API_KEY is required." >&2
  exit 1
fi

export LINEAR_PROJECT_SLUG="${LINEAR_PROJECT_SLUG:-c4e0e3663a68}"

npm run dev:symphony -- ./WORKFLOW.md
