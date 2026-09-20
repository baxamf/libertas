---
applyTo: "apps/web/components/**"
---

# Design Kit — UI/UX Standards

General design rules for building web components in `apps/web`. This file evolves over time with more specific areas (forms, charts, navigation, etc.) as the design kit grows.

## Skills & References

Before building or modifying any UI component:

- **Use the `shadcn` skill** for anything involving shadcn/ui components, registries, or the `components.json` config. Always run `npx shadcn@latest docs <component>` and fetch the returned docs/example URLs before writing or fixing a component — don't guess the API.
- **Read Next.js docs from `node_modules/next/dist/docs/`** before using any Next.js API or convention. This project runs Next.js 16, which has breaking changes vs. training data — do not assume older Next.js patterns (e.g. `middleware` is renamed `proxy`).
- Check `apps/web/components.json` for the current project config (`style: base-mira`, `iconLibrary: hugeicons`, `rsc: true`, Tailwind v4) before assuming defaults.

## Component Architecture

- **shadcn/ui first.** Search installed components (`components/ui/`) and the registry before writing custom markup. Compose existing primitives instead of reinventing them.
- **Default to Server Components.** Only add `'use client'` when using hooks, state, or browser APIs (see [copilot-instructions.md](../../apps/web/copilot-instructions.md) for the project's RSC/client-component rules).
- **Composition over configuration.** Build complex UI (settings pages, dashboards) by combining primitives (`Tabs` + `Card` + form controls) rather than one monolithic component.
- **Icons come from `hugeicons`** (per `iconLibrary` in `components.json`) — never hardcode `lucide-react` or other icon libraries.

## Theming & Color

- **Use semantic tokens only** — `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border`, etc. Never raw Tailwind color utilities like `bg-blue-500` or `text-red-600`.
- **No manual `dark:` overrides.** Semantic tokens already adapt to the active theme.
- **CSS variables live in `app/globals.css`** — edit that file for any new design tokens, never create a parallel theme file.
- **Status/feedback colors use component variants** (`Badge variant="destructive"`, `Alert variant="destructive"`) instead of raw colors.

## Typography

- Use the existing type scale (`text-sm`, `text-base`, `text-lg`, etc.) consistently — don't introduce arbitrary font sizes with `text-[13px]`.
- Use `font-medium` / `font-semibold` for emphasis instead of custom `font-weight` values.
- Use `truncate` for single-line overflow instead of manually combining `overflow-hidden text-ellipsis whitespace-nowrap`.
- Body copy defaults to `text-muted-foreground` for secondary/supporting text, `text-foreground` for primary text.

## Spacing & Layout

- **Use `gap-*` with flex/grid**, never `space-x-*`/`space-y-*`.
- **Use `size-*` when width and height match** (e.g. `size-10`), not `w-10 h-10`.
- Keep spacing on a consistent scale (multiples of `1` / `2` / `4` in Tailwind units) — avoid arbitrary values unless matching a specific design spec.
- Use `Separator` instead of `<hr>` or manual border divs.

## Accessibility (a11y)

- **Every `Dialog`, `Sheet`, and `Drawer` needs a `Title`** (`DialogTitle`, `SheetTitle`, `DrawerTitle`), even if visually hidden via `className="sr-only"`.
- Form fields must pair a `Field`/`FieldLabel` with their control via `htmlFor`/`id` — never a bare `<input>` without an associated label.
- Validation state uses `data-invalid` on `Field` and `aria-invalid` on the control; disabled state uses `data-disabled` on `Field` and `disabled` on the control.
- Interactive elements must be reachable and operable by keyboard (no click-only handlers on non-interactive elements like `div`).
- Maintain sufficient color contrast — rely on semantic tokens, which are already tuned for contrast; don't override with custom low-contrast colors.

## Responsive Design

- Design mobile-first: base classes target the smallest viewport, then layer `sm:`/`md:`/`lg:`/`xl:` overrides.
- Prefer Tailwind's responsive prefixes over fixed pixel breakpoints or JS-based viewport checks.
- Test layouts at common breakpoints (mobile, tablet, desktop) for any new page or reusable component.

## UI States

- **Loading:** use `Skeleton` for placeholders; use `Spinner` for inline pending indicators. Never hand-roll `animate-pulse` divs.
- **Empty states:** use the `Empty` component instead of a custom centered-text div.
- **Errors/callouts:** use `Alert` for inline errors and warnings; use `error.tsx` boundaries for segment-level failures.
- **Transient feedback:** use `toast` (sonner, per the project's Radix base) for one-off notifications — not custom banners.

## Forms

- Follow the mutation pattern in [copilot-instructions.md](../../apps/web/copilot-instructions.md): native `<form>` + Server Actions + `useActionState`, validated with Zod schemas from `@repo/shared-types`.
- Lay out forms with `FieldGroup` + `Field`, never raw `div` + `space-y-*`.
- Use `InputGroup` (`InputGroupInput`/`InputGroupTextarea`) when a field needs an adornment or inline button.
- Use `ToggleGroup` for 2–7 mutually exclusive choices instead of looping `Button` with manual active-state logic.
- **Base UI uncontrolled fields & keys:** When using uncontrolled inputs/controls (`defaultValue`) with Base UI primitives (`Input`, `Select`, etc.), always provide a dynamic `key` on the `<form>` or component (e.g., `key={entity?.id ?? "create"}`) whenever the initial data can change or revalidate across renders. Avoid static keys (like `key="email"`) on inputs with dynamic `defaultValue`, and always provide a defined fallback (e.g. `defaultValue={entity?.email ?? ""}`) to prevent Base UI runtime warnings about changing default values on initialized uncontrolled controls.

## Motion & Feedback

- Prefer CSS transitions/utilities over custom JS animation for simple state changes (hover, open/close).
- Respect `prefers-reduced-motion` — don't force animations that can't be disabled.
- Keep motion purposeful and short; avoid decorative animation that delays user interaction.
