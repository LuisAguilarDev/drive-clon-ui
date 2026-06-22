# Google Drive Clon - TerraNova Drive

A React single-page app (Vite + Tailwind CSS v4) for a Google Drive-style file
manager, with Keycloak (OIDC) authentication and UploadThing uploads.

## Tech stack

- **Build tool:** Vite 6
- **UI:** React 18 + React Router 6
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Auth:** Keycloak (OIDC via `keycloak-js`); Google sign-in is federated inside Keycloak
- **Uploads:** UploadThing

## Prerequisites

- Node.js 20+
- pnpm 10 (`corepack enable` activates the version pinned in `packageManager`)

## Setup

```bash
pnpm install
cp .env.example .env   # set the Keycloak/API endpoints (VITE_* vars)
```

## Usage

```bash
pnpm dev         # start the Vite dev server
pnpm build       # production build to dist/
pnpm preview     # preview the production build
pnpm typecheck   # run the TypeScript type checker
```

> Migrated from Next.js (App Router) to a Vite SPA. The former server-only
> pieces (`src/app/api/uploadthing`, `src/app/layout.tsx`) are no longer part of
> the build graph and are kept only for reference.

## TODO

- [x] Set up database and data model
- [x] Move folder open state to URL
- [x] Add auth
- [x] Add file uploading
- [x] Add analytics
- [x] Make sure sort order is consistent
- [x] Add delete
- [x] Real homepage + onboarding

## Fun follow ups

### Folder deletions

Make sure you fetch all of the folders that have it as a parent, and their children too

### Folder creations

Make a server action that takes a name and parentId, and creates a folder with that name and parentId (don't forget to set the ownerId).

### Access control

Check if user is owner before showing the folder page.

### Make a "file view" page

You get the idea. Maybe check out my last tutorial?

### Toasts!

### Gray out a row while it's being deleted
