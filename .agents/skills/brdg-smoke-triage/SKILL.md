---
name: brdg-smoke-triage
description: Diagnose BRDG smoke, bootstrap, and local validation failures using the repo's deterministic commands and logs. Use when `npm run smoke`, backend bootstrap, Expo doctor, repo-root checks, or preview-scenario setup fail and the task is to identify the failing stage, the relevant logs, and the smallest follow-up fix.
---

# BRDG Smoke Triage

Use this skill to triage BRDG validation failures quickly and consistently.

## Workflow

1. Start with [`../../../docs/DEV_LOOP.md`](../../../docs/DEV_LOOP.md) for the expected local sequence.
2. Re-run the narrowest failing command first:
   - repo-wide: `npm run smoke`, `npm run check`
   - backend: `npm --prefix backend run dev:bootstrap`, `npm --prefix backend run check`
   - mobile: `npm --prefix mobile run check`
3. If `npm run smoke` fails, inspect `/tmp/brdg-backend-smoke.log` and the final smoke step output before changing code.
4. If the failure is preview-state related, run `npm --prefix backend run dev:scenario -- ui-preview` against a running backend and retry.
5. Separate infrastructure failures from code regressions:
   - Docker, Postgres, Redis, env vars, or missing backend process
   - Typecheck, test, lint, or runtime/API regressions

## Guardrails

- Do not treat in-memory notifications as durable state; recreate the preview scenario after backend restarts.
- Prefer fixing the first failing deterministic command instead of chasing downstream symptoms.
- When the issue is toolchain-only, update docs or scripts so Codex does not repeat the same misstep.
