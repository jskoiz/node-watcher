# BRDG demo setup (local)

Goal: polished demo loop: **signup/login → swipe → match → chat**.

## 0) Prereqs
- Docker Desktop running (for Postgres).
- Node + npm.

## 1) Start database
From repo root:
```sh
docker compose up -d
```
Postgres will be on `localhost:5433`.

## 2) Backend
```sh
cd backend

# env (already present): DATABASE_URL, JWT_SECRET, PORT
npm i

# apply schema
npx prisma migrate deploy

# seed demo users + profile pictures
# BASE_URL is used to generate seeded photo URLs.
# - iOS Simulator: http://localhost:3010
# - Physical device: http://<your-mac-ip>:3010
BASE_URL=http://localhost:3010 npx prisma db seed

# run API
npm run start:dev
```
Backend serves profile images at:
- `http://localhost:3010/pfps/...`

## 3) Mobile (Expo)
```sh
cd mobile
npm i

# API base for the app:
# - iOS Simulator: http://localhost:3010
# - Android Emulator: http://10.0.2.2:3010
# - Physical device: http://<your-mac-ip>:3010
EXPO_PUBLIC_API_URL=http://localhost:3010 npm run ios
```

## Notes
- Chat uses **polling** (every 5s) for demo simplicity.
- The **Create** tab is UI-complete but intentionally disabled ("Coming soon") for a clean demo.
- For a one-shot hardening smoke check (bootstrap + backend readiness + mobile prereqs), run from repo root:
  ```sh
  ./scripts/smoke-e2e.sh
  ```
- See `docs/DEV_LOOP.md` for daily runbook + troubleshooting.
