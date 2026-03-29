current_phase: phase-2-product-ui
phase_state: completed

phase_owner:
  agent: codex
  human: jerry

started_at: 2026-03-28
completed_at: 2026-03-28

blockers: []

exact_next_task: >
  Phase 2 is complete. The next phase is Phase 2.5 (safety gate) which
  covers destructive action boundaries, confirmation prompts, and
  AI tool cleanup actions.

files_allowed_to_change:
  - site/**
  - docs/ui.md
  - docs/plans/relaunch/**
  - Sources/PortpourriApp/**
  - screenshot assets

files_forbidden_to_change:
  - Sources/PortpourriCore/** except tiny local changes strictly required to
    express already-locked UI semantics safely
  - Sources/PortpourriCLI/**
  - release/version pipeline files unless a Phase 1 regression must be fixed

external_systems_required:
  - system: live-site
    required_state: homepage reflects the new literal watched-port story
    verification: live homepage copy, demo, and links match Phase 2 semantics

validation_required:
  - swift build
  - swift test
  - swift run portpourri snapshot --json
  - sample-mode app launch
  - live-mode app launch
  - docs, settings, tooltip, homepage, and screenshots describe the same Dot Matrix semantics

stop_condition: >
  The menu bar glyph, popover hierarchy, settings copy, screenshots, and
  website all reinforce the same watched-port ownership story.

validation_results:
  swift_build: pass
  swift_test: 11/11 pass (0 failures)
  snapshot_json: valid output with source "live"
  package_app_version: 0.3.2 matches VERSION
  homepage_version: 0.3.2 in hero badge fallback and release-manifest.json
  download_link: https://github.com/jskoiz/portpourri/releases/latest
  github_link: https://github.com/jskoiz/portpourri
  stale_string_scan: zero hits for "Kill all" or old "Free port" on Node processes
  ai_refresh_path: separate from main snapshot refresh
  show_non_node_toggle: restored — Other listeners section follows the Display setting
  sample_mode_launch: pass
  live_mode_launch: pass
  settings_structure: pass — General, Display, Ports, Advanced, About
  tooltip: pass — dynamic watched-port summary shown in live mode
  live_site: pass — homepage reflects the literal watched-port ownership story

noted_exceptions: []

canonical_decisions:
  version: "0.3.2"
  website_url: "https://www.portpourri.com"
  repo_url: "https://github.com/jskoiz/portpourri"
  asset_naming: "Portpourri-{version}-mac.zip"
  dot_matrix_states:
    free: "dim — port not busy"
    owned: "green — busy, single Node owner, no conflict"
    blocked: "amber — busy, non-Node owner"
    conflict: "red — busy, multiple Node owners"
  action_labels:
    node_owned: "Stop server"
    external_blocker: "Free port"
    ssh_tunnel: "Stop tunnel"
    generic: "Stop blocker"
    group: "Kill group"
  settings_tabs: "General, Display, Ports, Advanced, About"
  popover_sections: "Watched Ports, Other Listeners, Process Groups, AI Tools"

handoff_notes: >
  Phase 2 completed on 2026-03-28. The Dot Matrix contract, popover ordering,
  ownership-aware labels, settings restructure, tooltip, homepage rewrite, and
  docs updates are all implemented and manually verified. AI/worktree scanning
  now runs on its own async refresh path instead of blocking the main port
  snapshot refresh, the non-Node listener toggle is functional again, sample-
  mode and live-mode app launches passed, settings structure passed, the live
  tooltip showed a dynamic watched-port summary, and the live homepage now
  reflects the literal watched-port ownership story. Phase 2.5 should focus on
  destructive action boundaries, confirmation prompts, and AI tool cleanup
  actions.
