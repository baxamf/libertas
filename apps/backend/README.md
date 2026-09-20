# Backend Application

NestJS v12 backend service for the Libertas platform, running within a Turborepo monorepo.

## Tech Stack & Architecture

- **NestJS v12 + Fastify:** Built on NestJS 12 using `@nestjs/platform-fastify` for high-throughput HTTP handling.
- **CQRS Architecture:** Command-Query-Responsibility Segregation with `@nestjs/cqrs`. Commands mutate state and publish domain events, while queries handle read projections.
- **Database Layer (`@repo/db`):** Powered by **Prisma 8 (Prisma Next)** with PostgreSQL (`@prisma/orm-postgres`), providing typed contract-first ORM and SQL queries.
- **Validation & Serialization:** Standard Schema validation via Zod schemas sourced from `@repo/shared-types` (using `GlobalZodValidationPipe` and `GlobalZodSerializerInterceptor`).
- **Authentication & Security:** JWT authentication stored in HTTP-only cookies (`jose`), password hashing with Argon2, role-based access control (`RolesGuard`), and rate limiting via `@nestjs/throttler`.
- **API Documentation:** Interactive Swagger / OpenAPI UI available at `/api`.

## Monorepo Integration

This service relies on workspace packages:

- `@repo/db` — Prisma 8 data contract, migrations, and database client.
- `@repo/shared-types` — Shared Zod schemas, types, and codecs.

---

## Getting Started

### 1. Prerequisites

- **Node.js**: `>= 22`
- **Package Manager**: `pnpm` (v12+)
- **PostgreSQL**: Running instance (v16+) or via Docker Compose

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Ensure `DATABASE_URL`, `COOKIE_SECRET`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` are properly set.

### 3. Database Preparation

Apply migrations and optionally seed the database via the `@repo/db` package:

```bash
# Apply pending migrations
pnpm --filter @repo/db db:migrate

# (Optional) Seed the database
pnpm --filter @repo/db db:seed
```

### 4. Running the Application

From the monorepo root:

```bash
# Start backend only in development watch mode
pnpm --filter backend dev

# Or start all workspace applications concurrently
pnpm dev
```

Alternatively, from the `apps/backend` directory:

```bash
pnpm dev
```

The server will start at `http://localhost:5000` (or the configured `PORT`).
Swagger documentation will be available at `http://localhost:5000/api`.

---

## Available Scripts

| Command            | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `pnpm dev`         | Start development server with file watching (`nest start --watch`) |
| `pnpm build`       | Compile the application (`nest build`)                             |
| `pnpm start:prod`  | Run the compiled production build (`node dist/main`)               |
| `pnpm lint`        | Lint codebase with `oxlint`                                        |
| `pnpm check-types` | Typecheck using `tsc --noEmit`                                     |
| `pnpm test`        | Run unit & integration tests with Vitest                           |
| `pnpm test:e2e`    | Run end-to-end tests with Vitest                                   |

---

## Running with Docker

You can run the full stack (backend, web, PostgreSQL, and migrations) using Docker Compose:

```bash
docker compose up -d
```
