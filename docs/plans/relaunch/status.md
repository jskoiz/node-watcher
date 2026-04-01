current_phase: phase-5-launch
phase_state: completed

phase_owner:
  agent: codex
  human: jerry

started_at: 2026-03-30
completed_at: 2026-03-31

blockers: []

exact_next_task: >
  Relaunch complete. Use the changelog-driven release workflow and the existing
  GitHub-first install path as the baseline for future releases.

files_allowed_to_change:
  - README.md
  - docs/dev-harness.md
  - docs/troubleshooting.md
  - docs/distribution.md
  - docs/plans/relaunch/**
  - site/**
  - VERSION
  - CHANGELOG.md
  - release-manifest.json
  - Scripts/extract_release_notes.py
  - .github/workflows/release.yml

files_forbidden_to_change:
  - Sources/PortpourriCore/**
  - Sources/PortpourriCLI/**
  - Sources/PortpourriApp/**
  - Tests/**
  - new end-user feature work

external_systems_required:
  - github-releases
  - vercel

validation_required:
  - swift build
  - swift test
  - swift run portpourri why 3000
  - swift run portpourri list --watched
  - swift run portpourri doctor
  - swift run portpourri snapshot --json
  - no stale 0.3.2 references remain outside changelog history and intentional release references
  - homepage version badge, README, manifest, and changelog all point to 0.4.0
  - post-merge: GitHub Release exists, release asset downloads, and the live site resolves to 0.4.0 links

stop_condition: >
  The launch branch is merged, tag v0.4.0 has been cut from clean main, the
  release workflow publishes Portpourri-0.4.0-mac.zip successfully, and the
  live site, README, changelog, release notes, and download/install paths all
  describe the same current 0.4.0 product.

validation_results:
  swift_build: pass
  swift_test: 23/23 pass
  snapshot_json: pass
  why_command: pass
  list_watched: pass
  doctor_command: pass
  sample_mode_launch: pass
  live_mode_launch: pass
  release_workflow: pass — GitHub Actions Release run 23839249734 completed successfully for tag v0.4.0
  github_release: pass — https://github.com/jskoiz/portpourri/releases/tag/v0.4.0 exists with asset Portpourri-0.4.0-mac.zip
  live_site_manifest: pass — https://www.portpourri.com/data/release-manifest.json serves version 0.4.0
  live_site_hero: pass — live site hero badge hydrates to v0.4.0 with the 0.4.0 highlight
  release_download_surface: pass — releases/latest now resolves to v0.4.0

noted_exceptions:
  - Per user direction, Phase 5 does not redesign the website; site changes are limited to manifest-driven versioning and small copy updates only

canonical_decisions:
  version: "0.4.0"
  website_url: "https://www.portpourri.com"
  repo_url: "https://github.com/jskoiz/portpourri"
  asset_naming: "Portpourri-{version}-mac.zip"
  phase3_pr_shape: "2 PRs"
  app_snapshot_role: "temporary adapter for one release line"
  inventory_boundary: "machine-wide Node inventory is separate from ownership capture"
  refresh_boundary: "main snapshot refresh is generation-gated; AI/worktree refresh remains separate"
  phase4_pr_shape: "1 PR"
  phase5_pr_shape: "1 PR plus immediate release tag"
  snapshot_schema_version: "0.1"
  doctor_output_mode: "human-readable only"
  homepage_install_surface: "GitHub Releases and build-from-source only"
  release_notes_source: "CHANGELOG.md"

handoff_notes: >
  Phase 5 is complete. v0.4.0 was tagged from merged main, the release
  workflow published Portpourri-0.4.0-mac.zip successfully, the GitHub Release
  body now comes from CHANGELOG.md, and the live site reflects the 0.4.0
  manifest-driven launch state without a site redesign.
