# Portpourri Agent Guide

This file is the map, not the manual. Treat `docs/` as the source of truth.

## Start here

- Product intent: `docs/product.md`
- Architecture and module boundaries: `docs/architecture.md`
- UI behavior and interaction rules: `docs/ui.md`
- Validation harnesses and fixtures: `docs/dev-harness.md`
- Active planning docs: `docs/plans/`

## Repo rules

- Keep `PortpourriCore` free of `AppKit` and `SwiftUI`.
- Parse shell output once at the edge, then operate on typed models.
- Prefer small, legible types over clever abstractions.
- When changing architecture or workflows, update the matching doc in `docs/`.
- Do not add privileged or force-kill behavior without an explicit user request.

## Prompting checklist

When working in this repo, keep four things explicit:

- Goal: what behavior should change?
- Context: which doc, fixture, or source area is authoritative?
- Constraints: module boundaries, UI behavior, safety rules.
- Done when: which tests, commands, or manual checks prove the change?

## Done when

- `swift build` succeeds.
- `swift test` succeeds.
- `swift run portpourri snapshot --json` produces a valid snapshot.
- The menu bar app can launch in sample mode and in live mode.

## Cursor Cloud specific instructions

Portpourri is a **macOS-only** product. The full "Done when" checklist above assumes a Mac
(the same as CI, which runs on `macos-15` with Xcode 16 — see `.github/workflows/ci.yml`).
Cursor Cloud agents run on Linux, so the standard `swift build` / `swift test` / `swift run`
flow does NOT work here. Do the real build/test/run on macOS or rely on CI; do not try to
"fix" the Linux build by editing source.

Why Linux can't build/test/run it (for reference, not to patch):
- `PortpourriApp` imports `SwiftUI`/`AppKit` (macOS-only), so it and `PortpourriAppTests`
  never compile on Linux. `swift build` / `swift test` fail here because they compile every
  target.
- `PortpourriCore` calls `NSString.abbreviatingWithTildeInPath` (Darwin Foundation only,
  in `AIToolProbe.swift`).
- `PortpourriCLI` uses the Glibc `stderr` global, which Swift 6 strict concurrency rejects on
  Linux.
- Live probes hardcode macOS tool paths (`/usr/sbin/lsof`, `/bin/ps` in
  `Parsers.swift` / `SnapshotService.swift`), so `snapshot`/`why`/`list`/`doctor` live probing
  won't find `lsof` on Linux (`doctor` reports this gracefully).

What DOES work on the Linux VM (Swift 6.0.3 toolchain is preinstalled in the image):
- `swift --version`, `swift package describe`, `swift package dump-package` for manifest and
  target inspection.
- Reading/searching source. Treat `docs/` as the source of truth per the sections above.

There are no third-party Swift dependencies (SwiftPM is the only build system, no
`Package.resolved` remotes), so there is nothing extra to install to work on the code here.
