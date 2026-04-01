# Dev Harness

## Why

This repo is structured for agent-first execution. The harness exists so changes can be validated mechanically instead of by intuition.

## Harness pieces

- Fixture-backed parser tests using captured `lsof`, `ps`, and `cwd` outputs.
- `portpourri snapshot --json` for live inspection.
- `portpourri fixtures --name mixed --json` for deterministic sample output.
- `swift run PortpourriApp --sample-data` for UI validation without live processes.
- `Scripts/dev_harness.sh` to create a small set of known listeners locally.

## Standard checks

```bash
swift build
swift test
swift run portpourri fixtures --name mixed --json
swift run portpourri snapshot --json
swift run portpourri why 3000
swift run portpourri list --watched
swift run portpourri list --all
swift run portpourri doctor
```

## Manual stability checks

After the standard checks, verify the shipped app path as well as the source path:

```bash
./Scripts/package_app.sh
open .build/Portpourri.app
```

Checklist:

- Launch `/Applications/Portpourri.app` from Finder and confirm the menu bar item appears without crashing.
- Open Settings and cycle `Display -> Theme` through `System`, `Light`, and `Dark`.
- Quit and relaunch, then confirm the selected theme persists and renders correctly.
- Open About and confirm the app identity, version/build, website, GitHub, issues, and release links are canonical.
- Confirm the popover still matches `docs/ui.md` for watched-port ordering, action labels, Process groups, and AI tools.
- If preparing a release, run `./Scripts/verify_release_bundle.sh` against both the packaged `.app` and the final zip.
