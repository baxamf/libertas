import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/dal";
import { matchRouteRule } from "@/lib/auth/routes";
import { getServerCookieString } from "@/lib/utils/cookie.utils";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  const session = await verifySession();

  const rule = matchRouteRule(pathname);

  // 1. Authenticated user visiting auth-only pages (/login, /register) → redirect to home
  if (rule?.isAuthPage && session?.role) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Public pages (e.g. /, /forbidden, unauthenticated /login, /register) → allow
  if (rule?.isPublic) {
    const cookieString = await getServerCookieString();
    requestHeaders.set("cookie", cookieString);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 3. Unauthenticated user hitting any protected route → redirect to login
  if (!session?.role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Role restriction check (e.g. /admin/* requires ADMIN)
  if (rule?.allowedRoles && !rule.allowedRoles.includes(session.role)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  // 5. Authenticated & authorized → forward cookies to RSC
  const cookieString = await getServerCookieString();
  requestHeaders.set("cookie", cookieString);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|.well-known).*)",
  ],
};
