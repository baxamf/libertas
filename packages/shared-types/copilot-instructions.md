---
applyTo: "packages/shared-types/**"
---

# Shared Types Package (@repo/shared-types)

## Purpose

This package is the **single source of truth for all Zod schemas and their inferred TypeScript types** across the monorepo. Schemas mirror the Prisma models in `@repo/db`. The backend consumes the schemas directly (native NestJS v12 Standard Schema support — no DTO classes); the frontend imports the same schemas/types for form validation and to parse API responses.

## Schema Chain

```
packages/database/prisma/schema.prisma   ← ground truth (Prisma model)
        ↓  (manual, type-assertion verified)
packages/shared-types/src/<model>.schema.ts   ← Zod schemas + inferred types
        ↓  (compile-time guard)
packages/shared-types/src/<model>.type-assertions.ts   ← IsExact check against @repo/db types
        ↓  (barrel)
packages/shared-types/src/index.ts   ← public API of the package
        ↓
apps/backend  →  @Body/@Query/@Param({ schema }) + @SerializeOptions({ schema })  (decode on receive, encode on send)
apps/web       →  schema.parse() for API responses, schema.safeParse() for form validation
```

## Rules

### Adding a new Prisma model

For every model added to `schema.prisma`, create `src/<model>.schema.ts` with **exactly four exports**:

```ts
import { z } from "zod";
import { stringToDate } from "./codecs.js";

// 1. Private schema — mirrors the DB row exactly (same fields, same types).
export const <Model>PrivateSchema = z.object({ ... });
export type <Model>Private = z.infer<typeof <Model>PrivateSchema>;

// 2. Public schema — omit any sensitive fields (passwords, tokens, secrets).
export const <Model>Schema = <Model>PrivateSchema.omit({ sensitiveField: true });
export type <Model> = z.infer<typeof <Model>Schema>;

// 3. Create input — fields required/optional for creation.
export const Create<Model>Schema = z.object({ ... });
export type Create<Model>Input = z.infer<typeof Create<Model>Schema>;

// 4. Update input — all fields optional (PATCH semantics).
export const Update<Model>Schema = Create<Model>Schema.partial();
export type Update<Model>Input = z.infer<typeof Update<Model>Schema>;
```

### Type-assertion file (compile-time guard)

Create `src/<model>.type-assertions.ts` alongside every schema file:

```ts
import type { <Model> as Prisma<Model> } from "@repo/db";
import type { <Model>Private } from "./<model>.schema.js";

type IsExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;

// Fails at build time if UserPrivateSchema drifts from the Prisma model.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _Verify<Model>PrivateSchema = Assert<IsExact<<Model>Private, Prisma<Model>>>;
```

> The assertion targets the **Private schema only** (which maps 1:1 to the DB row). Input/update schemas are intentionally not asserted against `Prisma.<Model>CreateInput` — Prisma uses complex union operation types that cannot be matched exactly with `z.infer`.

### Barrel (`src/index.ts`)

Re-export **all schemas and types**. Do **not** re-export the type-assertion file (it has no runtime exports).

### Sensitive fields

- Fields like `password`, `refreshToken`, `secret` must **never** appear in the public `<Model>Schema`.
- Use `.omit({ ... })` on the private schema to derive the public one.

### `.meta()` on every schema exposed to the API (Swagger)

The backend's Swagger setup (`apps/backend/src/core/swagger/setup-swagger.ts`) converts schemas via `zod-openapi`'s `createSchema`, which only emits a named, de-duplicated `$ref` component when the schema has a registry `id`. Any schema used directly as a `@Body`/`@Query`/`@Param`/`@SerializeOptions` schema (or nested inside one) must therefore call `.meta({ id, title, description })`:

```ts
export const CreateUserSchema = z
  .object({ ... })
  .meta({
    id: "CreateUserSchema",
    title: "Create User Schema",
    description: "Input payload for creating a new user",
  });
```

- `id` must be unique across the whole app — it becomes the `components.schemas` key, so two different shapes must never share one.
- Private schemas (`<Model>PrivateSchema`) and pure building blocks that are only merged via `.shape`/`.extend()` into another schema (e.g. `UserFiltersSchema`) don't need `.meta()` — only the schema that's actually wired to a controller does.
- `createPaginatedSchema()` returns a fresh schema per call, so the caller must add its own `.meta({ id, title, description })` on the returned schema (the generic factory itself is not given an id).

### DateTime fields — use a `stringToXxx` codec, never `z.date()` directly

`z.date()`/rich domain types (e.g. `Temporal.Instant`) cannot be represented in JSON Schema. Instead, every `DateTime` field must use a codec from `./codecs.js` whose **`input` schema is always the wire format** (`z.iso.datetime()`) and whose **`output` schema is the rich domain type**:

```ts
import { stringToInstant } from "./codecs.js";

export const UserPrivateSchema = z.object({
  userId: z.cuid2(),
  // wire format is ISO string (input); rich domain value is Temporal.Instant (output)
  createdAt: stringToInstant,
  updatedAt: stringToInstant,
});
```

- `stringToDate` — `z.codec(z.iso.datetime(), z.date(), { decode, encode })` → rich type `Date`.
- `stringToInstant` — `z.codec(z.iso.datetime(), zInstant, { decode, encode })` → rich type `Temporal.Instant` (used for all Prisma `Timestamptz`/`DateTime` fields, since Prisma returns `Temporal.Instant`).

**Never use the inverted form** (`z.invertCodec(stringToInstant)`) for a shared model schema — it would flip `input`/`output`, breaking the decode-on-receive/encode-on-send convention described in `apps/backend/copilot-instructions.md`.

- `.parse()` / `.decode()`: wire value (string) → rich value (`Temporal.Instant`/`Date`). Used by the backend's request validation pipe and by `apps/web` when reading an API response.
- `.encode()`: rich value → wire value (string). Used by the backend's response-serialization interceptor and by `apps/web` when sending a rich value (e.g. a date-range filter) back to the API.

### Zod field conventions

| Prisma type                   | Zod schema                           |
| ----------------------------- | ------------------------------------ |
| `String @id @default(cuid())` | `z.cuid2()`                          |
| `String @unique` (email)      | `z.email()`                          |
| `String` (plain)              | `z.string()`                         |
| `DateTime` / `Timestamptz`    | `stringToInstant` (from `codecs.js`) |
| `Boolean`                     | `z.boolean()`                        |
| `Int`                         | `z.number().int()`                   |
| `Float`                       | `z.number()`                         |

### Verification

After any schema change, run `pnpm check-types` from this package. A type error in the assertion file means the Zod schema has drifted from the Prisma model.
