# BRDG Backend

NestJS API for authentication, discovery, matches, chat, events, profile data, notifications, and release-support flows used by the BRDG mobile client.

## Local Setup

From [`backend`](/Users/jerry/Desktop/brdg/backend):

```bash
npm ci
cp .env.example .env
npm run dev:bootstrap
npm run start:dev
```

Or from repo root:

```bash
npm run dev:backend
```

`dev:bootstrap` starts local Postgres and Redis, waits for the database, runs migrations, and seeds the baseline dataset.

## Common Commands

```bash
npm run start:dev
npm run test
npm run test:e2e
npm run check
npm run check:full
npm run dev:scenario -- ui-preview
```

## Environment

- `DATABASE_URL`: Prisma Postgres connection
- `JWT_SECRET`: required signing secret
- `PORT`: backend port, defaults to `3010` in local `.env.example`
- `BASE_URL`: public asset base used for uploaded photo URLs and seed assets
- `API_BASE_URL`: base URL used by helper scripts

## Dev Scenarios

Use the deterministic preview/reset helper when you need a known-good state for mobile QA or Codex validation:

```bash
npm run dev:scenario -- ui-preview
```

This script assumes the backend is already running. It recreates fixed preview users, a match, chat history, notifications, and an event RSVP flow. Because notifications are stored in-memory today, rerun the scenario after restarting the backend.

## References

- Dev loop: [`docs/DEV_LOOP.md`](/Users/jerry/Desktop/brdg/docs/DEV_LOOP.md)
- Architecture: [`docs/ARCHITECTURE.md`](/Users/jerry/Desktop/brdg/docs/ARCHITECTURE.md)
- Functional matrix: [`docs/FUNCTIONAL_MATRIX.md`](/Users/jerry/Desktop/brdg/docs/FUNCTIONAL_MATRIX.md)
