# @repo/shared-types

Single source of truth for Zod schemas, serialization codecs, and inferred TypeScript types shared across the monorepo.

## Usage in Monorepo

Add `@repo/shared-types` to an app or package in `package.json`:

```json
{
  "dependencies": {
    "@repo/shared-types": "workspace:*"
  }
}
```

Import schemas and types in your application:

```ts
import {
  UserSchema,
  LoginSchema,
  type User,
  type LoginInput,
} from "@repo/shared-types";
```

### Monorepo Data Flow

```
@repo/db (Prisma Model)
   │
   ▼
@repo/shared-types (Zod Schemas + Codecs) ──► *.type-assertions.ts (Compile-time IsExact guard)
   │
   ├─► apps/backend (Standard Schema validation, response serialization & Swagger docs)
   └─► apps/web     (Form validation & type-safe API parsing)
```

## Turborepo Integration

This package builds to `dist/` with `tsc` and is integrated into Turbo pipelines:

- `turbo build`: Compiles TypeScript declarations and outputs to `dist/` after dependencies build.
- `turbo check-types`: Runs `tsc --noEmit` across all packages, verifying schema type-assertions against `@repo/db`.
- `turbo dev`: Runs `tsc --watch` in development mode.
- `turbo lint`: Lints schemas using `oxlint`.

## Development Commands

Run from the monorepo root:

| Command                                        | Description                           |
| ---------------------------------------------- | ------------------------------------- |
| `pnpm --filter @repo/shared-types build`       | Build TypeScript output to `dist/`    |
| `pnpm --filter @repo/shared-types dev`         | Run TypeScript compiler in watch mode |
| `pnpm --filter @repo/shared-types check-types` | Typecheck without emitting files      |
| `pnpm --filter @repo/shared-types lint`        | Lint source files with `oxlint`       |

## Conventions

- **Model Schemas:** Export 4 items per model (`<Model>PrivateSchema`, `<Model>Schema`, `Create<Model>Schema`, `Update<Model>Schema`) alongside inferred types.
- **Type Guards:** Maintain a `<model>.type-assertions.ts` using `IsExact<<Model>Private, Prisma<Model>>` to prevent schema drift from `@repo/db`.
- **Date Codecs:** Use `stringToInstant` / `stringToDate` from `./codecs.js` instead of `z.date()` to handle ISO wire strings and `Temporal.Instant` runtime values.
- **API Metadata:** Apply `.meta({ id, title, description })` to public endpoint schemas for OpenAPI / Swagger spec generation.
