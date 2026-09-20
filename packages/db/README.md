# @repo/db

Database package for the monorepo, powered by **Prisma 8 (Prisma Next)** and PostgreSQL (`@prisma/orm-postgres`). It manages the contract-first data schema, migrations, seed data, and exports a type-safe runtime database client.

## Usage in Monorepo

Add `@repo/db` to an app's `package.json`:

```json
{
  "dependencies": {
    "@repo/db": "workspace:*"
  }
}
```

Import and query in your application:

```ts
import { db } from "@repo/db";

// ORM lane
const user = await db.orm.public.User.select(
  "userId",
  "email",
  "role",
  "createdAt",
  "updatedAt",
)
  .where({ email: "user@example.com" })
  .first();

// SQL lane
const rows = await db.sql.public.users
  .select("id", "email")
  .where({ email: "user@example.com" })
  .all();
```

## Turborepo Integration

Turborepo orchestrates contract compilation automatically:

- `turbo dev`, `turbo build`, and `turbo check-types` depend on `contract:emit`.
- Contract artifacts (`contract.json`, `contract.d.ts`) are cached based on inputs in `src/prisma/contract.prisma` and `prisma.config.ts`.

## Development Workflow

Run commands from the monorepo root using `pnpm --filter` or `pnpm turbo`:

| Task                 | Root Command                                                  | Description                                                         |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Emit Contract**    | `pnpm --filter @repo/db contract:emit`                        | Regenerate `contract.json` & `contract.d.ts` from `contract.prisma` |
| **Plan Migration**   | `pnpm --filter @repo/db migration:plan`                       | Generate a migration plan from contract diff                        |
| **Apply Migrations** | `pnpm turbo db:migrate` _(or `--filter @repo/db db:migrate`)_ | Apply pending migrations to the database                            |
| **Check Status**     | `pnpm --filter @repo/db migration:status`                     | Check applied migration status                                      |
| **Verify Schema**    | `pnpm --filter @repo/db db:verify`                            | Verify database schema against drift                                |
| **Seed Database**    | `pnpm --filter @repo/db db:seed`                              | Run database seed script (`src/seed.ts`)                            |
| **Typecheck**        | `pnpm --filter @repo/db check-types`                          | Run `tsc --noEmit` on the package                                   |

### 3-Step Schema Update

1. **Edit Contract:** Modify `src/prisma/contract.prisma`.
2. **Emit Artifacts:** Run `pnpm --filter @repo/db contract:emit`.
3. **Migrate:** Run `pnpm --filter @repo/db migration:plan` followed by `pnpm turbo db:migrate`.

## Environment Variables

| Variable       | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgres://user:pass@localhost:5432/db`) |
