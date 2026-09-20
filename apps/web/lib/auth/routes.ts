import type { UserRole } from "@repo/shared-types";

export interface RouteRule {
  pathPrefix: string;
  isPublic?: boolean;
  isAuthPage?: boolean;
  allowedRoles?: UserRole[];
}

export const ROUTE_RULES: RouteRule[] = [
  // Auth pages (redirect to '/' if already authenticated)
  { pathPrefix: "/login", isPublic: true, isAuthPage: true },
  { pathPrefix: "/register", isPublic: true, isAuthPage: true },

  // Public utility pages
  { pathPrefix: "/forbidden", isPublic: true },
  { pathPrefix: "/", isPublic: true },

  // Role-restricted pages
  { pathPrefix: "/admin", allowedRoles: ["ADMIN"] },
  { pathPrefix: "/profile", allowedRoles: ["USER", "ADMIN"] },
];

/**
 * Matches a given pathname against the defined route rules.
 * Matches by exact match or prefix boundary (e.g. /admin or /admin/*),
 * sorting by longest prefix first to guarantee most-specific matching.
 */
export function matchRouteRule(pathname: string): RouteRule | undefined {
  const sorted = [...ROUTE_RULES].sort(
    (a, b) => b.pathPrefix.length - a.pathPrefix.length,
  );

  return sorted.find((rule) => {
    if (rule.pathPrefix === "/") {
      return pathname === "/";
    }
    return (
      pathname === rule.pathPrefix || pathname.startsWith(`${rule.pathPrefix}/`)
    );
  });
}
