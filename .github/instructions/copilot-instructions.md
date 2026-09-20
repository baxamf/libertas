# Turborepo Monorepo Architecture

## Workspace Structure

- `apps/backend`: NestJS 12 API (Fastify adapter, CQRS, nestjs-zod)
- `apps/frontend`: Next.js 16 (App Router, Server Components)
- `packages/db`: Prisma 8 (`@repo/db`)
- `packages/shared-types`: Shared Zod schemas & types export (`@repo/shared-types`)

## Monorepo Rules & Workflow

- **Package Management:** Use pnpm/npm workspaces. Internal packages are scoped as `@repo/*`.
- **Imports:** Always import shared models and DB client from `@repo/db` rather than direct file paths.
- **Commands:** Run commands via Turborepo (`pnpm build`, `pnpm test`, `pnpm dev`). If needed to run command for a specific package, use the `--filter` flag (e.g., `pnpm turbo build --filter=backend`).
- **Context Awareness:** Refer to specific scoped instructions when working inside `apps/backend`, `apps/frontend`, `packages/db` `packages/shared-types`.
