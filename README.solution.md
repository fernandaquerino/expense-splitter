# Expense Splitter — Solution

> Split shared costs with groups. This repository contains the **initial MVP**:
> a full-stack app with a NestJS + Prisma + PostgreSQL API and a Next.js (App
> Router) frontend.
>
> For the public submission repo, this file becomes `README.md` (the
> `README.md` currently in the root is the Frontend Mentor challenge brief, kept
> here as development reference).

**Value proposition:** _Split expenses. Settle up. Stay friends._

---

## What's in the MVP

Implemented end-to-end with persistent data:

1. **Responsive dashboard** — group summaries (total spent, members, expense
   count) and a cross-group recent-expenses feed, with sidebar / mobile-drawer
   navigation.
2. **Guest mode** — the database is seeded with 5 realistic groups (a JPY Japan
   trip, a USD roommate household, an office lunch crew, a one-off birthday
   collection, and a camping weekend), their members (including a **name-only**
   member with no account), and ~40 expenses.
3. **Groups** — create, edit, and list.
4. **Members** — add / edit / remove, including members without accounts;
   removal is blocked while a member is part of any expense.
5. **Expenses** — create with description, amount, date, category, payer, and
   participants; edit and delete.
6. **Equal splitting** — deterministic integer-minor-unit allocation; leftover
   minor units go to the payer; shares always sum to the total.
7. **Expense history & detail pages** — reverse-chronological list and a full
   per-expense breakdown.
8. **Group totals & per-member balances** — derived from persisted expenses;
   balances always sum to zero.
9. **Filtering** — by category and by date range (combinable), via URL query
   params.
10. **Empty / loading / validation / error states** throughout.
11. **Automated tests** — monetary calculations and API endpoint logic.

Plus: light/dark themes (OS preference + persisted manual toggle, no flash),
WCAG-minded markup (landmarks, labels, focus-visible, keyboard-operable
dialogs, color-plus-icon-plus-label balance direction), and a custom favicon.

### Intentionally deferred (future iterations)

Exact / percentage / shares splits · live currency conversion & rate snapshots ·
multi-currency group accounting · settlements, partial settlements, reversal &
audit · debt simplification · advanced analytics · full auth / registration ·
idempotency & concurrency handling.

> **Scope honesty:** because multi-currency accounting and advanced splits are
> deferred, each group uses a **single currency** and **equal splits only**. The
> guest seed is authored to match (no silently-incorrect placeholder math). A
> JPY group exercises zero-decimal rounding; the others are USD.

---

## Architecture

```
expense-splitter/
├── apps/
│   ├── api/                 # NestJS REST API
│   │   ├── prisma/          # schema, SQL migration, guest seed
│   │   └── src/
│   │       ├── domain/      # pure business rules (no I/O)
│   │       │   ├── money.ts, currency.ts, category.ts
│   │       │   ├── split/   # equal-split allocator
│   │       │   └── balance/ # balance & totals derivation
│   │       ├── groups/      # controller · service · repository · dto
│   │       ├── expenses/    # controller · service · repository · dto
│   │       ├── meta/        # currencies, categories, health
│   │       ├── prisma/      # PrismaService (data access)
│   │       └── common/      # view models, filters, avatar palette
│   └── web/                 # Next.js App Router frontend
│       └── src/
│           ├── app/         # routes (landing, dashboard, groups, expenses)
│           ├── components/  # ui, layout, groups, expenses, theme
│           └── lib/         # api client, types, money/split mirrors, format
├── docker-compose.yml       # PostgreSQL 16
└── .env.example
```

**Backend principles**

- **Money is always integer minor units** (cents, whole yen). No float columns;
  parsing goes string → integer to avoid binary rounding drift.
- **Layer separation:** controllers (HTTP) → services (orchestration + rules) →
  repositories (Prisma) → database models. DTOs validate input with
  `class-validator`.
- **Business rules live in domain services** (`SplitService`, `BalanceService`)
  that are pure and independently unit-tested.
- **Transactional writes:** an expense and its split rows are created/updated in
  a single Prisma transaction, so an expense can never persist without a
  complete, balanced set of splits.
- **Explicit domain types** for currencies, categories, splits, and balances.

**Equal-split allocation rule.** `base = floor(total / N)`,
`remainder = total − base·N`. The first `remainder` participants each get one
extra minor unit, ordered payer-first. Deterministic and exact: shares sum to
the total, and because balances are integer math their sum is exactly zero.

---

## Tech stack

Next.js (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
NestJS · Prisma · PostgreSQL · class-validator · Jest (API) · Vitest + React
Testing Library (web).

---

## Local setup

**Prerequisites:** Node ≥ 20, Docker (for PostgreSQL), npm.

```bash
# 1. Install all workspaces
npm install

# 2. Environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Start PostgreSQL
npm run db:up

# 4. Apply migrations and seed the guest data
npm run db:migrate
npm run db:seed

# 5. Run both apps (API on :3001, web on :3000)
npm run dev
```

Open http://localhost:3000 and click **Try as guest**.

### Useful scripts (run from the repo root)

| Script | What it does |
|--------|--------------|
| `npm run dev` | API + web together |
| `npm run build` | Build both apps |
| `npm run typecheck` | `tsc --noEmit` in both |
| `npm run lint` | ESLint in both |
| `npm run test` | API (Jest) + web (Vitest) unit/integration tests |
| `npm run db:up` / `db:down` | Start / stop PostgreSQL |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Seed the 5 guest groups |

API-only e2e (requires the DB to be up and migrated):

```bash
npm run test:e2e --workspace apps/api
```

---

## API reference

Base URL: `http://localhost:3001/api`. All money fields are integer minor units
of the entity's `currencyCode`.

### Meta

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness check |
| `GET` | `/meta/currencies` | Supported currencies (code, decimals, symbol, name) |
| `GET` | `/meta/categories` | Predefined expense categories |

### Groups

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/groups` | List groups with counts & total spent |
| `POST` | `/groups` | Create a group (optionally with initial members) |
| `GET` | `/groups/:id` | Group detail: members, totals, per-member balances |
| `PATCH` | `/groups/:id` | Update name / description / currency |
| `DELETE` | `/groups/:id` | Delete a group (only if it has no expenses) |

`POST /groups` body:

```json
{
  "name": "Trip to Japan",
  "description": "Two weeks in Japan",
  "currencyCode": "JPY",
  "members": [{ "name": "Alex", "email": "alex@example.com" }, { "name": "Dev" }]
}
```

### Members

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/groups/:id/members` | Add a member (email optional = name-only) |
| `PATCH` | `/groups/:id/members/:memberId` | Edit a member |
| `DELETE` | `/groups/:id/members/:memberId` | Remove (blocked if in any expense) |

### Expenses

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/groups/:id/expenses` | List (reverse-chronological), filterable |
| `POST` | `/groups/:id/expenses` | Create (amount in major units as a string) |
| `GET` | `/groups/:id/expenses/:expenseId` | Expense detail with split breakdown |
| `PATCH` | `/groups/:id/expenses/:expenseId` | Update (splits recomputed) |
| `DELETE` | `/groups/:id/expenses/:expenseId` | Delete |

Query params on list: `category`, `from` (ISO), `to` (ISO), `payerId`.

`POST /groups/:id/expenses` body:

```json
{
  "description": "Izakaya dinner",
  "amount": "21600",
  "date": "2024-03-20T20:00:00Z",
  "category": "Food & Drink",
  "payerId": "<memberId>",
  "participantIds": ["<memberId>", "<memberId>"],
  "notes": "optional"
}
```

Amount is a **string in major units** (e.g. `"42.50"`, or `"21600"` for JPY);
the server converts it to minor units using the group currency and rejects
values with too many decimal places. Errors return clean JSON
(`{ statusCode, message, error }`); validation errors are `400`, missing
records `404`, rule violations `409`.

---

## Design decisions (challenge write-up)

**Expense entry UX.** A single adaptive form with the amount as the prominent
first field. Smart defaults (today's date, group currency, everyone selected,
last category) make the common case — one payer, split evenly — the fast path.
Payer is a single-select avatar radiogroup; participants are multi-select avatar
chips with a live "N of M selected" count. A **live split preview** shows each
person's exact share as you type, using the same allocator the server persists —
so what you see is what's saved.

**Group dashboard.** Information hierarchy: on mobile the balance summary sits
above the expense list (balances first in the DOM); on desktop it moves to a
right-hand pane so the expense history leads. Balances use color **and** an
icon, a +/− sign, and a text label so direction never depends on color alone.
The all-settled state is a positive moment, not a bare zero.

**Settlement flow.** Settlements are deferred in this MVP, so the app presents
per-member net balances clearly rather than implementing placeholder settlement
math that could mislead. The balance panel is built to extend into pairwise
settlements next.

---

## Testing

- **API (Jest):** `money` (currency conversion, rounding, formatting),
  `SplitService` (the README edge cases — $24.50/4, $142.37/3, $34.99/5,
  ¥4,850/4 — plus the sum-to-total invariant and payer-first leftover rule),
  `BalanceService` (zero-sum invariant), and service-level tests for
  `ExpensesService` / `GroupsService` with mocked repositories (validation,
  conversion, allocation, mapping — no DB needed). An opt-in e2e suite
  (`test:e2e`) exercises the real HTTP + Prisma stack.
- **Web (Vitest + RTL):** client money/split mirrors (kept equivalent to the
  API), currency formatting, and a `BalancePanel` component test (direction
  labels, name-only badge, all-settled state).

See [VERIFICATION.md](VERIFICATION.md) for which commands have been run and
their status.

---

## Accessibility & theming

Semantic landmarks (`nav`/`main`/`aside`/`header`), a skip link, visible
`:focus-visible` rings, keyboard-operable native `<dialog>` modals (focus trap +
restore), labelled form fields, `aria-current` navigation, tabular monospace
figures, and `prefers-reduced-motion` support. Light/dark via the provided
tokens, honoring `prefers-color-scheme` with a persisted manual toggle and a
no-flash inline theme script.
