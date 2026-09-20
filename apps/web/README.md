# Web Application

Next.js 16 frontend application for the Libertas platform, running within a Turborepo monorepo.

## Tech Stack & Architecture

- **Next.js 16 (App Router) & React 19:** Built with Turbopack for fast local builds and React 19 features (`useActionState`, Server Functions).
- **React Server Components (RSC):** Server-first component model for data fetching, layouts, and fast initial rendering.
- **Server Actions:** Native HTML `<form>` mutations handled via Next.js Server Actions with Zod validation.
- **shadcn UI & Tailwind CSS v4:** Modern UI component system built on Base UI primitives, styled with Tailwind CSS v4.
- **TanStack Query (v5):** Client-side state caching and background refetching via custom hooks.
- **Shared JWT Authentication:** Authenticates against the NestJS backend using HTTP-only cookies (`jose`). Session verification in `proxy.ts` and DAL requires matching JWT secrets and cookie names across frontend and backend.

## Monorepo Integration

- **Turborepo:** Workspace application orchestrated by Turborepo alongside `@repo/backend`.
- **`@repo/shared-types`:** Shared Zod validation schemas (e.g. `LoginSchema`, `CreateUserSchema`), TypeScript types, and codecs shared across frontend and backend.

## Shared Authentication & Environment Setup

The web application directly verifies sessions and proxies API requests. The following environment variables **must match** between `apps/web/.env` and `apps/backend/.env`:

| Variable                  | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `JWT_SECRET`              | Secret key used to sign and verify access tokens        |
| `JWT_REFRESH_SECRET`      | Secret key used for refresh tokens                      |
| `JWT_ACCESS_COOKIE_NAME`  | Cookie key name for access token (e.g., `access`)       |
| `JWT_REFRESH_COOKIE_NAME` | Cookie key name for refresh token (e.g., `refresh`)     |
| `API_URL`                 | Backend server URL for server-side fetches and rewrites |
| `NEXT_PUBLIC_API_URI`     | Public API base URI                                     |

## Useful Agent Skills

When developing or extending UI features, the following workspace skills can be invoked:

- `shadcn` — Adding, configuring, and composing shadcn UI components and registry items.
- `frontend-design` — Guidance for distinctive, intentional visual design, aesthetic direction, and typography.
- `design-taste-frontend` — Quality bar and anti-slop guidelines for landing pages, layouts, and redesigns.

---

## Getting Started

### 1. Prerequisites

- **Node.js**: `>= 22`
- **Package Manager**: `pnpm` (v12+)
- **Backend Service**: Running NestJS backend instance (default: `http://localhost:5000`)

### 2. Environment Setup

Copy the environment template and verify your credentials match the backend configuration:

```bash
cp apps/web/.env.example apps/web/.env
```

### 3. Running in Development

From the monorepo root:

```bash
# Run web app only
pnpm --filter web dev

# Or run full stack (web + backend) concurrently
pnpm dev
```

The web application will be accessible at [http://localhost:3000](http://localhost:3000).

### 4. Production Build & Start

```bash
# Build the standalone Next.js bundle
pnpm --filter web build

# Start the production server
pnpm --filter web start
```

### 5. Running with Docker Compose

To run the full stack (web, backend, db, and migrations) via Docker:

```bash
docker compose up --build
```
