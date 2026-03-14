---
name: brdg-roadmap-sync
description: Compare BRDG roadmap or review documents against the current codebase and operating docs, then surface drift clearly. Use when the task involves checking whether roadmap claims, review notes, release notes, or product-status docs still match the implementation.
---

# BRDG Roadmap Sync

Use this skill when BRDG product/status documents may be stale and need a grounded codebase comparison.

## Workflow

1. Read the target doc first.
2. Cross-check claims against current source files, package scripts, tests, and [`../../../docs/ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md).
3. Treat [`../../../APP_ROADMAP.md`](../../../APP_ROADMAP.md) and [`../../../CODEBASE_REVIEW.md`](../../../CODEBASE_REVIEW.md) as historical unless the user explicitly asks to refresh them.
4. Separate findings into:
   - still true
   - stale or contradicted by code
   - plausible but unverified from local artifacts
5. Recommend doc edits whenever the drift would mislead Codex or another engineer.

## Guardrails

- Quote concrete files and behavior, not general impressions.
- Prefer present-tense implementation facts over aspirational roadmap language.
- If a document mixes historical context with current guidance, preserve the history but add a clear status banner.
