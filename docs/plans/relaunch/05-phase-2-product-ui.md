# Phase 2 — Product Model + UI Semantics

## Goal

Make the app UI and the website explain the exact same product story.

## Scope

This phase covers:
- Dot Matrix semantics
- popover information hierarchy
- settings model and copy
- conflict-first site story
- screenshots, labels, legends, and tooltip semantics

This phase does **not** cover:
- major architecture refactors
- CLI expansion
- deep feature expansion

## Inputs / dependencies

- `01-product-contract.md`
- completed Phase 1
- current UI docs and screenshots
- current site content now living in `site/`

## Decisions already made

- Dot Matrix is a watched-port status glyph, not memory
- first-run default remains `countAndMemory`
- memory remains secondary in popover summaries and process groups
- Portpourri is a port-ownership tool, not a generic process monitor

## Task checklist

### Dot Matrix
- update Dot Matrix rendering to represent watched-port status
- define deterministic watched-port slot ordering
- use these fixed slot states:
  - free = dim
  - owned by your project = green
  - busy non-owned = amber
  - conflict = red
- render the first `5` watched ports in compact mode
- if more than `5` watched ports exist, do not add a separate overflow glyph in v1
- add tooltip text such as:
  `3 projects · 2 watched ports busy · 1 conflict`
- add settings legend for Dot Matrix mode
- add live rendered previews for all menu bar modes

### Popover
- make section order explicit:
  - Watched ports
  - Other listeners / blockers
  - Process groups
  - AI tools / workspace cleanup
- sort blockers and watched-port owners above irrelevant listeners
- make action labels ownership-aware
- keep the calm native visual style

### Settings
- flatten one container layer
- add a first-class `Ports` tab now
- merge `Notifications` into `General`
- prioritize docs/issues/release notes over social links in About

### Website
- rewrite hero headline and subhead to be literal
- replace healthy-state first impression with a conflict-first visual
- use the same product vocabulary as the app
- reorder the homepage:
  1. literal hero
  2. trust strip
  3. problem / solution
  4. primary demo
  5. install
  6. feature detail
  7. local-first / privacy / OSS trust
  8. changelog

## Files allowed to change

- `site/**`
- UI docs
- settings UI files
- status item / menu bar rendering files
- popover UI files
- screenshot assets

## Files forbidden to change

- core architecture files unless a tiny local change is required to express the agreed semantics
- CLI files
- release/version pipeline files unless a Phase 1 regression must be fixed

## Validation

### Product comprehension checks
A new user should be able to understand the menu bar icon from:
- settings preview
- tooltip
- homepage explanation

### Consistency checks
- docs, settings, tooltip, homepage, and screenshots all describe the same Dot Matrix semantics
- action labels correctly distinguish owned ports from blockers
- no screen positions Portpourri as a generic process monitor

### Build checks
- `swift build`
- `swift test`

## Stop condition

The menu bar glyph, popover hierarchy, settings copy, and website all reinforce the same watched-port ownership story.

## Artifacts to update

- `docs/ui.md`
- screenshots
- settings copy
- homepage copy
- `status.md`

## Decisions locked for this phase

- `Ports` becomes its own tab now
- Dot Matrix compact mode renders the first `5` watched ports only
- badge remains the only compact conflict-count indicator

## Next phase handoff

The next phase may assume:
- the semantic model is locked
- Dot Matrix 4-state contract is implemented and documented
- popover follows the contract section order (watched ports → other listeners → process groups → AI tools)
- action labels are ownership-aware (Stop server / Free port / Stop tunnel / Kill group)
- settings have a Ports tab, Notifications is merged into General, Display has live previews
- AI tools section is wired into the popover as read-only display
- tooltip is dynamic with port-status summary
- site homepage leads with literal conflict-first story
- screenshots and copy reflect the new story
- the website no longer leads with metaphor-heavy messaging
- docs/ui.md matches the implementation

### Phase 2 completion summary (2026-03-28)
Phase 2 is complete.

Manual verification passed:
- sample-mode app launch
- live-mode app launch
- settings structure
- `Show non-Node listeners` toggle behavior
- dynamic tooltip in live mode
- live-site verification after merge

Recent fixes:
- AI/worktree scanning moved off the main refresh loop onto a separate async refresh path
- `Show non-Node listeners` toggle behavior restored in the popover
Files changed:
- `Sources/PortpourriApp/Store.swift` — dotMatrix mode, separate AI refresh path
- `Sources/PortpourriApp/StatusBarController.swift` — DotMatrix renderer, dynamic tooltip, WatchedPortDotState
- `Sources/PortpourriApp/Views.swift` — popover reorder, WatchedPortsSection, AIToolsSection, action labels, settings restructure
- `site/index.html` — conflict-first hero, trust strip, problem/solution, contract-ordered mock
- `site/css/style.css` — new section styles
- `site/js/main.js` — toggleOther function
- `docs/ui.md` — full rewrite
- `docs/plans/relaunch/status.md` — phase completion

Validation: swift build pass, 11/11 tests pass, snapshot --json valid. Manual
launch and live-site verification passed.

## Agent instruction block

Phase 2 is complete. Do not re-enter this phase.
The next phase is Phase 2.5 (safety gate).
