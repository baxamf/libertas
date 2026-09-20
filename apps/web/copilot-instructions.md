---
applyTo: "apps/web/**"
---

# Frontend App Standards (Next.js 16 — App Router)

## Component Model

- **Default to React Server Components (RSC).** Only add `'use client'` when using React hooks (`useState`, `useActionState`, `useQuery`) or browser APIs.
- Client Components live in `_components/` inside their feature folder. Shared client components go in `components/`.

## Data Fetching

- **Reads (RSC / Data Loaders):** call `serverFetchWithCookieForwarding()` from `@/lib/api/server` inside async Server Components or feature data loader functions (e.g. `_lib/get-*.ts`). No useEffect, no loading state — use `loading.tsx` for Suspense.
- **Reads (client):** use hooks that wrap `useQuery` from TanStack Query. Hooks live in `hooks/`. Use `clientFetch()` from `@/lib/api/client` (proxied through Next.js `/api/*` rewrite).
- **`useMe()`** from `hooks/use-me.ts` is the single source of truth for the current user on the client.

## Mutations — Server Actions

Use **native HTML `<form>` + Next.js Server Actions** for all mutations. No React Hook Form.

```ts
// lib/actions/feature.ts
'use server'
export async function myAction(_prev: State, formData: FormData): Promise<State> { ... }
```

```tsx
// _components/my-form.tsx
"use client";
const [state, formAction, isPending] = useActionState(myAction, null);
return <form action={formAction}>...</form>;
```

- Validate with Zod schemas from `@repo/shared-types` using `schema.safeParse(Object.fromEntries(formData))`.
- Return `{ errors: z.flattenError(parsed.error).fieldErrors }` on validation failure.
- On API failure, extract message via `getErrorMessage(response)` from `@/lib/utils/errors.utils` and return `{ errors: { _form: [errorMessage] } }`.
- Call `refresh()` from `next/cache` when mutating data on the current view, and return `null` on success.
- Call `redirect()` for navigation (e.g. after login/register); `redirect()` must be called **outside** try-catch blocks.
- **Action state types:** derive `FieldErrors<T>` / `ActionState<T>` from the generic in `lib/actions/action-state.ts` instead of redefining a local `FieldErrors` type per file:

```ts
import type { ActionState } from "./action-state";
export type MyActionState = ActionState<MyInput>; // MyInput from @repo/shared-types
```

## Admin CRUD Dialogs

For create/edit/delete on admin list pages (see `app/admin/users/` as the reference):

- **Create/Edit** share one `'use client'` dialog component keyed by a `mode: "create" | "edit"` prop, using shadcn `Dialog` + `useActionState` with the matching Server Action. Auto-close on success by tracking `isPending` in a `useRef` and closing when it transitions `true -> false` with no `state.errors` (there's no other reliable signal since the action returns `null` both initially and on success).
- **Delete** uses shadcn `AlertDialog` for confirmation. Since the action's second argument may not be `FormData` (e.g. a plain `userId: string`), dispatch it manually from a button `onClick` — don't wire it to `<form action>`.
- **Row actions** (edit/delete buttons per row) live in a small `'use client'` leaf component rendered from the otherwise-Server-Component table — keep the table itself a Server Component.
- shadcn `Dialog`/`AlertDialog` triggers use the `render` prop (Base UI), not `asChild`: `<DialogTrigger render={<Button>...</Button>} />`. The `trigger` prop type must be `React.ReactElement`, not `React.ReactNode`.

## Auth & Cookie Forwarding

JWT cookies (`jwt_access`, `jwt_refresh`) are set by NestJS via `Set-Cookie` headers.

- **Automatic Cookie & Header Forwarding:** Server Actions and server-side data fetching functions call `serverFetchWithCookieForwarding()` from `@/lib/api/server.ts`. It automatically:
  1. Attaches incoming request cookies and common headers (user-agent, accept-language, IP/Cloudflare headers) to backend requests via `getCommonHeaders()` from `lib/utils/cookie.utils.ts`.
  2. Forwards any `Set-Cookie` response headers from NestJS directly back to the client browser cookie store via `forwardResponseCookies()`.

```ts
// In Server Actions or server-only data functions:
const response = await serverFetchWithCookieForwarding("/auth/login", {
  method: "POST",
  body: JSON.stringify(parsed.data),
});
```

- **Data Access Layer (DAL):** `lib/auth/dal.ts` provides session verification helpers:
  - `verifySession()`: decrypts `jwt_access` via `decrypt()` from `lib/auth/jwt.ts`. If expired and `jwt_refresh` is present, calls `/auth/me` with `serverFetchWithCookieForwarding` to refresh tokens. Used in `proxy.ts`.
  - `getSession()`: cached per-request via React `cache()`, reads and decrypts the current session from cookies for RSCs without making an extra network request.
- **Proxy Cookie Pass-Through:** In `proxy.ts`, after verifying the session and checking route rules from `lib/auth/routes.ts`, `getServerCookieString()` from `lib/utils/cookie.utils.ts` sets the `cookie` header on forwarded request headers for downstream RSC rendering.

## TanStack Query

- **Provider:** `ReactQueryProvider` in `lib/query/provider.tsx` wraps `<body>` in the root layout.
- **Query client factory:** `makeQueryClient()` in `lib/query/client.ts` (staleTime 1 min, gcTime 5 min, no window-focus refetch).
- Browser uses a singleton `QueryClient`; server always creates a fresh one.

## Validation

Always import Zod schemas from `@repo/shared-types` — never redefine them locally:

```ts
import { LoginSchema, CreateUserSchema, UserSchema } from "@repo/shared-types";
```

## API & Utility Helpers

| Utility / Helper                               | File                        | Used in                                      | Purpose                                                                     |
| ---------------------------------------------- | --------------------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| `serverFetchWithCookieForwarding(path, init?)` | `lib/api/server.ts`         | Server Actions, Data Loaders (`_lib/*`), DAL | Server fetch with auto header passing and `Set-Cookie` forwarding to client |
| `serverFetch(path, init?)`                     | `lib/api/server.ts`         | `lib/api/server.ts`                          | Direct base fetch against backend `API_BASE`                                |
| `clientFetch<T>(path, init?)`                  | `lib/api/client.ts`         | `useQuery` hooks (`hooks/`)                  | Client fetch hitting Next.js `/api/*` rewrite with credentials              |
| `getCommonHeaders()`                           | `lib/utils/cookie.utils.ts` | `serverFetchWithCookieForwarding`            | Collects cookie, user-agent, language, origin, and IP headers               |
| `forwardResponseCookies(response)`             | `lib/utils/cookie.utils.ts` | `serverFetchWithCookieForwarding`            | Parses and sets response `Set-Cookie` headers into Next.js cookie store     |
| `getServerCookieString()`                      | `lib/utils/cookie.utils.ts` | `proxy.ts`                                   | Formats all current request cookies into a `name=val; ...` string           |
| `parseSetCookie(raw)`                          | `lib/utils/cookie.utils.ts` | `cookie.utils.ts`                            | Parses raw `Set-Cookie` header into name, value, and cookie options         |
| `getErrorMessage(response)`                    | `lib/utils/errors.utils.ts` | Server Actions                               | Extracts backend error message from response JSON                           |
| `verifySession()` / `getSession()`             | `lib/auth/dal.ts`           | `proxy.ts`, RSCs                             | Verifies tokens / retrieves cached session payload                          |

`serverFetch` hits `process.env.API_URL` (default `http://localhost:5000`) directly.  
`clientFetch` hits `/api/*` which Next.js rewrites to the backend.

## Feature Folder Structure

New features follow this layout (auth and admin/users are reference implementations):

```
app/
  (auth)/                     # route group — public auth pages
    layout.tsx                # Auth layout wrapper
    login/
      page.tsx                # RSC page
      _components/
        login-form.tsx        # 'use client': useActionState + form
    register/
      page.tsx
      _components/
        register-form.tsx
  (home)/                     # route group — main site pages
    layout.tsx                # Header + Footer layout wrapper
    page.tsx                  # Home page
    profile/
      page.tsx                # RSC profile page
      loading.tsx             # Profile Suspense skeleton
      _lib/
        get-profile.ts        # Server-only data loader ('server-only')
      _components/            # Feature client & presentation components
  admin/                      # protected route group
    layout.tsx                # Sidebar + TopNav layout wrapper
    loading.tsx
    page.tsx
    users/
      page.tsx                # Server Component table page
      loading.tsx
      _lib/
        get-users.ts          # Server-only paginated query loader
      _components/
        user-form-dialog.tsx  # 'use client' create/edit modal
        delete-user-dialog.tsx# 'use client' alert modal
        user-row-actions.tsx  # 'use client' row action buttons

lib/
  actions/                    # 'use server' Server Actions (auth.ts, users.ts, profile.ts)
  api/                        # server.ts, client.ts
  auth/                       # dal.ts, jwt.ts, routes.ts
  query/                      # client.ts, provider.tsx
  utils/                      # cookie.utils.ts, errors.utils.ts

hooks/
  use-me.ts                   # useQuery wrapper for GET /auth/me
```

## Global Files

- `proxy.ts` — Next.js Proxy (renamed from `middleware` in v16). Handles route protection, role authorization, and auth-page redirects using rules from `lib/auth/routes.ts`. Export must be named `proxy`, not `middleware`.
- `app/error.tsx` — `'use client'` error boundary for page segments
- `app/forbidden/page.tsx` — 403 Forbidden page for unauthorized role access
- `app/loading.tsx` — Suspense fallback (spinner)
- `app/not-found.tsx` — 404 page
