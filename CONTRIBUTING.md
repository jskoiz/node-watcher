# Contributing

## Local setup

### Repo root

```bash
npm run check
npm run smoke
```

### Backend

```bash
cd backend
npm ci
cp .env.example .env
npm run dev:bootstrap
npm run start:dev
```

### Mobile

```bash
cd mobile
npm ci
npm run start
```

## Quality gates

Run these before opening or updating a PR:

```bash
# local pre-PR gate (docs, policy, diff-driven fast lane)
npm run pre-submit
```

Use `npm run smoke` in addition when backend bootstrap, scenarios, or other integrated runtime assumptions changed.

### Backend

```bash
cd backend
npm run check
```

This runs:
- `npm run typecheck`
- `npm run check:boundaries`
- `npm run test`

Optional full gate:
- `npm run check:full` (includes lint)

### Mobile

```bash
cd mobile
npm run check
```

This runs:
- `npm run lint` (typecheck + boundaries)
- `npm run test`

## CI checks

GitHub Actions runs `.github/workflows/ci.yml` on pushes to `main` and all pull requests.

It executes the repo harness via `scripts/run-harness-lane.mjs`:
- **PR pushes:** lightweight remote-only checks such as backend migration rehearsal when path-gated
- **Main pushes:** `main-check` lane (complete validation across all packages)

The diff-driven `pr-fast` lane is intentionally local-only now. Run `npm run pre-submit` before opening or updating a PR instead of waiting for GitHub to run that validation remotely.

### Temporary skips

- **Backend lint is not yet in CI** because current ESLint rules fail on existing legacy `any` usage and unsafe access patterns. Lint remains available locally via `npm run lint` while technical debt is addressed incrementally.
- **Mobile lint currently aliases to typecheck** in this branch. Use `npm run check` in `mobile` and the repo-root `npm run check` as the source of truth until stricter linting is intentionally reintroduced.

## Codex workflow

- Work from the repo root by default and let Codex stay there too.
- Use one Codex thread per task and one git worktree per active task.
- Prefer [`scripts/codex-worktree.sh`](scripts/codex-worktree.sh) when you want a fresh worktree for a new Codex task.
- Keep durable repo instructions in [`AGENTS.md`](AGENTS.md) and review guidance in [`code_review.md`](code_review.md).
- Prefer the repo-root scripts over retyping package-local commands in prompts.
