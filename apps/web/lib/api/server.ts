import "server-only";

import { API_BASE } from "@/lib/constants";
import {
  forwardResponseCookies,
  getCommonHeaders,
} from "../utils/cookie.utils";

/**
 * Server-side fetch helper used in RSC.
 * Calls the NestJS backend directly (not through the Next.js /api rewrite).
 * Pass `headers: { Cookie: cookieHeader }` to forward auth cookies.
 */
export async function serverFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

/**
 * Server-side fetch helper used in RSC.
 * Calls the NestJS backend directly (not through the Next.js /api rewrite).
 * Passes through common headers (user-agent, accept-language, cookie) from the client request.
 * After the fetch, it forwards any Set-Cookie headers from the response to the client.
 */
export async function serverFetchWithCookieForwarding(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const commonHeaders = await getCommonHeaders();

  const response = await serverFetch(path, {
    ...init,
    headers: {
      ...commonHeaders,
      ...init?.headers,
    },
  });

  await forwardResponseCookies(response);

  return response;
}
