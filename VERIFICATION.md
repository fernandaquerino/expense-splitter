# Verification status

This file records exactly which commands have been run and what they showed.
Nothing below is claimed without having been executed.

**Last run:** 2026-11-12, Linux, Node.js 22.23.4, npm 10.9.9.

## Results

| Command | Result | Notes |
|---------|--------|-------|
| `npm install` | ✅ | Dependencies install cleanly. |
| `npm run prisma:generate --workspace apps/api` | ✅ | Client types generated. |
| `npm run typecheck` (api + web) | ✅ | No TypeScript errors in either app. |
| `npm run lint` (api + web) | ✅ | No errors or warnings. |
| `npm run test --workspace apps/api` | ✅ | 5 suites, 44 tests passed (`money`, `SplitService`, `BalanceService`, `ExpensesService`, `GroupsService`). |
| `npm run test --workspace apps/web` | ✅ | 4 files, 14 tests passed (money/split mirrors, formatting, `BalancePanel`). |
| `npm run build` | ✅ | API (`nest build`) and web (`next build`) both build. |
| `npm run db:up`, `db:migrate`, `db:seed` | ⏭️ Not run | Needs Docker and the Prisma engine binaries, which were unavailable in the environment used for this run. |
| `npm run test:e2e --workspace apps/api` | ⏭️ Not run | Depends on the database steps above. |

## Fixes made during this run

- **Lint:** removed an unused `Link` import from the landing page, which failed
  `next lint --max-warnings 0`.
- **Fonts:** replaced the Google Fonts `<link>` tags in the root layout with
  locally bundled Fontsource packages (`@fontsource/manrope`,
  `@fontsource/ibm-plex-mono`). This removes the
  `@next/next/no-page-custom-font` warning and the runtime request to Google.
- **Security updates:** Next.js `15.1.3` → `15.5.29` (15.1.3 is affected by
  CVE-2025-66478) and NestJS `10.4.15` → `10.4.22` (patch releases).

## Still open

- Run the database steps and the e2e suite locally:

  ```bash
  npm run db:up
  npm run db:migrate
  npm run db:seed
  npm run test:e2e --workspace apps/api
  ```

- `npm audit` still reports advisories in transitive dependencies of NestJS 10
  and Next.js 15 that are only fixed in newer major versions. Tracked in the
  README roadmap.
