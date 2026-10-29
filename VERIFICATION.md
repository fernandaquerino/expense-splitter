# Verification status

This records exactly what has and has not been executed, per the build's
requirement to report command results honestly and not claim unverified success.

## Status: NOT YET RUN

The code was authored in an environment where the disk was essentially full
(~1 GB free), so **no `npm install`, build, typecheck, lint, or test command has
been executed**. A full install (Next.js + NestJS + Prisma engines) plus the
Postgres image needs several GB. Installing on this machine would likely fail
partway, so it was deliberately deferred rather than run to a broken state.

As a result, there is **no execution evidence** for any command below. The code
is written to compile and pass, but that has not been demonstrated here.

## Commands to run (once ~5 GB of disk is free)

```bash
# from the repo root
npm install

# backend: generate client, then run DB-free tests
npm run prisma:generate --workspace apps/api
npm run typecheck --workspace apps/api
npm run lint --workspace apps/api
npm run test --workspace apps/api        # money / split / balance / services

# frontend
npm run typecheck --workspace apps/web
npm run lint --workspace apps/web
npm run test --workspace apps/web         # money/split mirrors, format, BalancePanel

# full build
npm run build

# end-to-end against a real database
npm run db:up
npm run db:migrate
npm run db:seed
npm run test:e2e --workspace apps/api
```

## What each check should confirm

| Command | Expectation |
|---------|-------------|
| `typecheck` (api, web) | No TypeScript errors (both are `strict`). |
| `lint` (api, web) | No lint errors. |
| `test` (api) | `money`, `SplitService`, `BalanceService`, `ExpensesService`, `GroupsService` suites pass — including the spec's rounding edge cases and the zero-sum balance invariant. |
| `test` (web) | Client money/split mirrors, formatting, and `BalancePanel` suites pass. |
| `build` | Both apps build. The web build needs the API reachable only if a route is statically evaluated at build; all data routes use `no-store` and render dynamically. |
| `test:e2e` (api) | With Postgres up + migrated: health check, group+expense creation, zero-sum balances, and amount validation all pass. |

## Known follow-ups to watch for on first run

- **Prisma client generation** must run before the API typechecks/builds
  (`@prisma/client` types come from `prisma generate`). The `postinstall` is not
  configured, so run `npm run prisma:generate --workspace apps/api` after install
  (the commands above do this).
- If `useSearchParams` in `ExpenseFilters` triggers a static-render warning in a
  future refactor, ensure the group page stays dynamic (it currently is, via
  `no-store` fetch + awaited `searchParams`).
