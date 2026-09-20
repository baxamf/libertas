---
applyTo: "packages/db/**"
---

# Database Package (@repo/db) — Prisma 8 (Prisma Next)

## Overview & Skill Guidance

This package manages the database schema, data contract, migrations, and runtime database client using **Prisma 8 (Prisma Next)** with PostgreSQL (`@prisma/orm-postgres`).

> **AI Agents:** Always consult and load the `prisma-8` skill ([.agents/skills/prisma-8/SKILL.md](../../.agents/skills/prisma-8/SKILL.md)) for any tasks involving Prisma 8 contract editing, migrations, configuration, or query authoring. Do not rely on legacy Prisma ORM (v7 or earlier) conventions.

## Architecture & File Structure

Prisma 8 is contract-first. The database package is organized as follows:

```
packages/db/
├── prisma.config.ts            ← CLI & ORM configuration (definePrismaConfig)
├── src/
│   ├── index.ts                ← Package entrypoint exporting db & types
│   ├── seed.ts                 ← Seed script (tsx src/seed.ts)
│   └── prisma/
│       ├── contract.prisma     ← Data contract (ground truth for models & relations)
│       ├── contract.json       ← Compiled machine-readable contract artifact (committed)
│       ├── contract.d.ts       ← Generated contract types for IDE autocomplete (committed)
│       └── db.ts               ← Runtime client instance (`postgres<Contract>(...)`)
└── migrations/
    ├── app/                    ← Applied migrations & baseline
    │   └── refs/db.json        ← Migration ref pointer
    └── snapshots/              ← Contract snapshots per migration
```

## Three-Step Workflow

1. **Edit the Data Contract:** Modify [src/prisma/contract.prisma](src/prisma/contract.prisma).
2. **Emit Contract Artifacts:** Run `pnpm contract:emit` to update [src/prisma/contract.json](src/prisma/contract.json) and [src/prisma/contract.d.ts](src/prisma/contract.d.ts).
3. **Plan & Apply Migrations:**
   - Plan migration: `pnpm migration:plan`
   - Review/edit `migration.ts` if data transforms are needed.
   - Apply migration: `pnpm db:migrate`

## Modeling Conventions

- **Namespaces:** Wrap all PostgreSQL models inside schema namespaces (e.g. `namespace public { model User { ... } }`).
- **Database Mapping:** Always map tables with `@@map("table_name")` and columns with `@map("column_name")` to maintain snake_case in PostgreSQL and camelCase in TypeScript.
- **Primary Keys:** Use CUID2 (`@id(map: "<table>_pkey") @default(cuid(2)) @map("id")`) or UUID / autoincrement where appropriate. Always specify explicit constraint names with `map: "..."`.
- **Timestamps:** Use `temporal.createdAt() @map("created_at")` and `temporal.updatedAt() @map("updated_at")` for entity timestamps.
- **Foreign Keys & Relations:** Explicitly name foreign key constraints with `map: "<table>_<col>_fkey"` and specify `onDelete` / `onUpdate` referential actions.
- **Indexes:** Explicitly name indexes with `map: "<table>_<col>_idx"` (e.g. `@@index([email], map: "users_email_idx")`).

## Runtime Client & Querying

The runtime client is instantiated in [src/prisma/db.ts](src/prisma/db.ts) and exported from [src/index.ts](src/index.ts):

```ts
import { db } from "@repo/db";

// Typed ORM querying (Prisma 8 ORM lane)
const user = await db.orm.public.User.select(
  "userId",
  "email",
  "role",
  "createdAt",
  "updatedAt",
)
  .where({ email: "alice@example.com" })
  .first();

// Typed SQL builder (Prisma 8 SQL lane)
const rows = await db.sql.public.users
  .select("id", "email")
  .where({ email: "alice@example.com" })
  .all();
```

## Available Scripts

| Command                 | Action                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| `pnpm contract:emit`    | Regenerates `contract.json` and `contract.d.ts` from `contract.prisma` |
| `pnpm migration:plan`   | Plans a new migration based on contract diff                           |
| `pnpm migration:status` | Shows current migration status                                         |
| `pnpm db:migrate`       | Applies pending migrations (`prisma db migrate --advance-ref db`)      |
| `pnpm db:verify`        | Verifies database schema drift                                         |
| `pnpm db:seed`          | Executes database seed script ([src/seed.ts](src/seed.ts))             |
| `pnpm check-types`      | Typechecks package with `tsc --noEmit`                                 |
