# Libertas Monorepo

Enterprise-grade, type-safe full-stack monorepo managed with **Turborepo** and **pnpm** workspaces.

---

## 🏗 Workspace Architecture

```
libertas/
├── apps/
│   ├── backend/          # NestJS v12 + Fastify + CQRS API (Port 5000)
│   └── web/              # Next.js 16 (App Router) + React 19 + shadcn UI (Port 3000)
├── packages/
│   ├── db/               # Prisma 8 (Prisma Next) ORM & PostgreSQL contract
│   ├── shared-types/     # Shared Zod schemas, codecs, and type assertions
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/# Shared TSConfig definitions
├── docker-compose.yml    # Full-stack container orchestration
├── package.json          # Root workspace dependencies & scripts
├── pnpm-workspace.yaml   # pnpm monorepo workspace definition
└── turbo.json            # Turborepo pipeline orchestration
```

### Data Flow & Type Safety

```
┌─────────────────────────────────────────────────────────────┐
│                 @repo/db (Prisma 8 Contract)                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│   @repo/shared-types (Zod Schemas + Compile Type Guards)    │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│    apps/backend (NestJS)    │ │      apps/web (Next.js)     │
│  - Standard Schema Pipes    │ │  - Server Actions Validation│
│  - Swagger / OpenAPI Spec   │ │  - Typed API / DAL Handlers │
│  - CQRS Domain Commands     │ │  - TanStack Query Caching   │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- **Node.js**: `>= 22.0.0`
- **Package Manager**: `pnpm` (`v12+`)
- **PostgreSQL**: `v16+` (or via Docker Compose)

### 2. Environment Configuration

Copy example environment files across workspaces and configure required secrets:

```bash
# Root (used for Docker Compose and local services)
cp .env.example .env

# Backend application
cp apps/backend/.env.example apps/backend/.env

# Web application
cp apps/web/.env.example apps/web/.env

# Database package
cp packages/db/.env.example packages/db/.env
```

> **Important (Shared Auth):** Ensure `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_COOKIE_NAME`, and `JWT_REFRESH_COOKIE_NAME` match between `apps/backend/.env` and `apps/web/.env`.

---

## 💻 Running the Services

### Option A: Local Development (Recommended)

1. **Install Dependencies:**

   ```bash
   pnpm install
   ```

2. **Start PostgreSQL Database:**

   ```bash
   # Run only the PostgreSQL container in the background
   docker compose up -d db
   ```

3. **Initialize Database Schema & Seeds:**

   ```bash
   # Emit Prisma 8 contract artifacts
   pnpm --filter @repo/db contract:emit

   # Apply database migrations
   pnpm --filter @repo/db db:migrate

   # (Optional) Seed initial data
   pnpm --filter @repo/db db:seed
   ```

4. **Start All Applications Concurrently:**

   ```bash
   pnpm dev
   ```

   - **Web Application:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **Swagger / OpenAPI Documentation:** [http://localhost:5000/api](http://localhost:5000/api)

#### Running Specific Applications Individually

```bash
# Start backend in watch mode
pnpm --filter backend dev

# Start frontend in dev mode
pnpm --filter web dev

# Watch shared packages during development
pnpm --filter @repo/shared-types dev
```

---

### Option B: Full-Stack Docker Compose

Spin up the entire stack (PostgreSQL, automatic migrations/seed container, NestJS backend, and Next.js frontend) with a single command:

```bash
docker compose up --build
```

To stop and remove containers:

```bash
docker compose down
```

---

## 🗄 Prisma 8 Schema & Migration Workflow

The database layer uses **Prisma 8 (Prisma Next)** with contract-first development. Follow the 3-step lifecycle when modifying models:

1. **Edit Contract:** Modify [packages/db/src/prisma/contract.prisma](packages/db/src/prisma/contract.prisma).
2. **Emit Contract Artifacts:**
   ```bash
   pnpm --filter @repo/db contract:emit
   ```
3. **Plan and Apply Migration:**
   ```bash
   # Generate migration plan
   pnpm --filter @repo/db migration:plan

   # Apply pending migrations
   pnpm turbo db:migrate
   ```
4. **Update Shared Schemas:** Update [packages/shared-types/src/index.ts](packages/shared-types/src/index.ts) and verify compile-time type assertions:
   ```bash
   pnpm turbo check-types
   ```

---

## 🛠 Available Turborepo Scripts

Run standard Turborepo pipelines from the repository root:

| Command                          | Description                                                       |
| -------------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                       | Run all applications and watch services concurrently              |
| `pnpm build`                     | Build all packages and applications according to dependency graph |
| `pnpm lint`                      | Run oxlint/eslint across all workspaces                           |
| `pnpm check-types`               | Run TypeScript type checks across all apps and packages           |
| `pnpm format`                    | Format entire repository using Prettier                           |
| `pnpm --filter backend test`     | Run backend unit and integration tests (Vitest)                   |
| `pnpm --filter backend test:e2e` | Run backend end-to-end tests (Vitest)                             |

---

## 🧠 AI Agent Skills

To enhance Copilot and agent capabilities across this monorepo, install and sync the following skills:

- **shadcn UI:**
  ```bash
  pnpm dlx skills add shadcn/ui
  ```
- **Front-end Design:**
  ```bash
  npx skills add anthropics/skills@frontend-design
  ```
- **Prisma 8:**
  ```bash
  pnpm dlx prisma@latest skills sync
  ```
- **Design Taste Frontend:**
  ```bash
  npx skills add Leonxlnx/taste-skill@design-taste-frontend
  ```

---

## 🔌 Recommended Model Context Protocol (MCP) Servers

Leverage MCP servers for runtime context and automated tool execution:

- **Next.js MCP (`next-devtools` / built-in Next.js 16+ MCP):**
  Provides live dev server diagnostics, route inspection, component tree exploration, and runtime error analysis directly from the active Next.js development server.
- **Prisma MCP (`prisma-tools` / PostgreSQL inspection):**
  Enables database schema context queries, query plans, visual schema representations, and database state inspection.
- **shadcn MCP (`shadcn` registry tools):**
  Allows searching registry items, viewing code examples and component demos, and fetching CLI installation commands directly within assistant workflows.
