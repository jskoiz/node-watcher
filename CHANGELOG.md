# Changelog

## v0.2.7

### New: AI Tools Section
- Shows Claude Code and Codex worktrees with count, session count, and total disk size
- Scans ~/.claude/, ~/.codex/, and per-project .claude/worktrees/ directories
- Expand to see individual worktrees sorted by size
- Actions: Reveal in Finder, Delete individual, Clear all
- Sizes over 1 GB highlighted in red
- Background async scanning — doesn't block the main snapshot refresh

### Fixes
- Fix popover dismiss animation snap (removed blanket .animation modifier)
- Add idle state view when no Node processes are running
- Scrollable worktree list (max 180pt) prevents popover overflow

## v0.2.6

### Visual Polish
- Lighter popover background with improved material vibrancy
- Better text contrast using system semantic colors (secondaryLabelColor)
- Semibold project names for faster scanning
- Animated chevron rotation on expand/collapse
- Hover highlights on project and process group rows

### UX Improvements
- Process group rows are now expandable — click to reveal Kill all + Copy PIDs
- ControlCenter filtered from port conflicts (macOS default, not actionable)
- Narrower popover width (330pt) for a tighter fit

### Sample Data
- More realistic process group counts and memory values

## v0.2.5

- Multi-owner conflict detail improvements
- Fix multi-owner conflict card labeling

## v0.2.1

- Fix launch crash when requesting notifications

## v0.1.1

- Release pipeline: code signing, notarization, Homebrew
- CI validation fixes

## v0.1.0

- Initial release
