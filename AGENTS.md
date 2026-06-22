# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

TerraNova Drive — a Google Drive-style file manager built as a **Vite + React SPA**. Keycloak (OIDC) handles auth with Google federated *inside* Keycloak; UploadThing handles uploads; a separate backend (reached via `VITE_API_URL`) owns the data and provisions a per-user organization on first sign-in.

The data layer is **not yet wired up**: folder/file listing renders empty collections and `src/lib/mock-data.ts` holds sample shapes. Commented `QUERIES`/`MUTATIONS` calls mark where backend integration belongs.

## Commands

```bash
pnpm dev         # Vite dev server on :5173 (host 0.0.0.0)
pnpm build       # production build to dist/
pnpm preview     # preview the production build
pnpm typecheck   # tsc --noEmit — the only type/lint gate; run before committing
```

There is **no test runner and no ESLint config** wired up. `pnpm typecheck` is the sole automated check. Use **pnpm** (pinned via `packageManager`; run `corepack enable`).

## Required environment (`.env`, all `VITE_`-prefixed)

`VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`, `VITE_API_URL`. No secrets belong in the client bundle — Google is federated inside Keycloak, not configured here.

## Architecture

**Migrated from Next.js App Router to a Vite SPA.** This leaves important footguns:

- The `src/app/**` tree keeps Next's folder-route *naming* (`(home)`, `f/[folderId]`, `page.tsx`, `layout.tsx`) but routing is now **manual** in `src/App.tsx` via `react-router-dom`. Adding a route means editing `App.tsx` — creating a `page.tsx` does nothing on its own.
- Next server-only files still exist but are **excluded from the build** (`tsconfig.json` excludes, plus a stale top-level `app/` dir). `src/app/api/uploadthing/core.ts` imports from `uploadthing/next` and its server logic does **not** run — uploads currently complete client-side with the backend persistence still commented out.

**Path aliases:** `~/*` → `./src/*`, `@/*` → repo root. Both are defined in *both* `vite.config.ts` and `tsconfig.json` — keep them in sync.

### Auth flow (the core of the app)

`src/lib/keycloak/` is the heart of the app. `main.tsx` wraps everything in `AuthProvider` (outside `BrowserRouter`). Consume auth only via the `useAuth()` hook.

Two module-level dedupe guards in `AuthProvider.tsx` are load-bearing and must not be removed:
- `initPromise` — `keycloak.init()` may only be called once per instance; React 18 StrictMode double-mounts effects in dev.
- `bootstrapPromise` — dedupes the `/auth/session` call so concurrent triggers don't race the backend into creating two organizations for one user.

**Organization provisioning is two-phase.** On a new user's first `/auth/session`, the backend creates their org but the *current* Keycloak token lacks the `organization` claim. `src/lib/api/client.ts` watches for an `X-Org-Provisioned: true` response header and forces a transparent `keycloak.updateToken(-1)` so the *next* token carries the claim. **Always make backend calls through `apiFetch`/`authorizedFetch`** in `client.ts` — they attach the Bearer token, refresh near-expiry tokens, and handle this re-provisioning.

Route guards are done per-page (`useEffect` redirect + `<Navigate>` to `/sign-in`), gated on `initialized` before checking `authenticated`. Follow the existing pattern in `drive/page.tsx` rather than inventing a new guard.

## Conventions

- TypeScript strict mode is on. Some source comments are in Spanish — match the language of surrounding comments when editing a file.
- Styling is **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config.js`); global styles live in `src/styles/globals.css`. UI primitives use shadcn-style `cva` + `cn()` (`src/lib/utils.ts`); `components.json` configures shadcn.
- Analytics via PostHog (`usePostHog()`); deploy target is Netlify (`netlify.toml`).
