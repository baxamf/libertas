import "server-only";

import { cookies, headers } from "next/headers";

interface ParsedCookie {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    path?: string;
    domain?: string;
    maxAge?: number;
    sameSite?: "strict" | "lax" | "none";
  };
}

/**
 * Parses a Set-Cookie header string into a ParsedCookie object.
 *
 * @param raw The raw Set-Cookie header string.
 * @returns A ParsedCookie object or null if parsing fails.
 */
export function parseSetCookie(raw: string): ParsedCookie | null {
  const parts = raw.split(";").map((p) => p.trim());
  if (parts === undefined || parts.length === 0) return null;
  const eqIdx = parts[0]!.indexOf("=");
  if (eqIdx === -1) return null;

  const name = parts[0]!.slice(0, eqIdx);
  const value = parts[0]!.slice(eqIdx + 1);
  const options: ParsedCookie["options"] = {};

  for (const attr of parts.slice(1)) {
    const [key, val = ""] = attr.split("=").map((p) => p.trim());
    switch (key!.toLowerCase()) {
      case "httponly":
        options.httpOnly = true;
        break;
      case "secure":
        options.secure = true;
        break;
      case "path":
        options.path = val;
        break;
      case "domain":
        options.domain = val;
        break;
      case "max-age":
        options.maxAge = Number(val);
        break;
      case "samesite":
        options.sameSite = val.toLowerCase() as "strict" | "lax" | "none";
        break;
    }
  }

  return { name, value, options };
}

/**
 * Forwards Set-Cookie headers from a Response to the current request's cookies.
 * This is useful for server-side fetches that return cookies that need to be set in the client's browser.
 *
 * @param response The Response object containing Set-Cookie headers.
 */
export async function forwardResponseCookies(response: Response) {
  const newCookies = response.headers.getSetCookie();

  if (newCookies.length === 0) return;

  const store = await cookies();

  for (const raw of newCookies) {
    const cookie = parseSetCookie(raw);
    if (cookie) {
      store.set(cookie.name, cookie.value, cookie.options);
    }
  }
}

/**
 * Returns a string of all cookies in the current request, formatted as "name=value; name2=value2".
 * This is useful for forwarding cookies to another server or API.
 *
 * @returns A promise that resolves to a string of all cookies in the current request.
 */
export async function getServerCookieString(): Promise<string> {
  const cookieString = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return cookieString;
}

/**
 * Returns a HeadersInit object containing common headers from the current request.
 * This includes the user-agent, accept-language, and cookie headers.
 *
 * @returns A promise that resolves to a HeadersInit object with common headers.
 */
export async function getCommonHeaders(): Promise<HeadersInit> {
  const reqHeaders = await headers();

  const userAgent = reqHeaders.get("user-agent");
  const acceptLanguage = reqHeaders.get("accept-language");
  const cookie = reqHeaders.get("cookie");
  const corsOrigin = reqHeaders.get("origin");

  // Cloudflare specific headers (highly reliable)
  const cfConnectingIp = reqHeaders.get("cf-connecting-ip");
  const cfIpCountry = reqHeaders.get("cf-ipcountry");

  // Fallback standard IP header if not routed through Cloudflare locally
  const xForwardedFor = reqHeaders.get("x-forwarded-for");

  return {
    ...(userAgent && {
      "user-agent": userAgent,
    }),
    ...(acceptLanguage && {
      "accept-language": acceptLanguage,
    }),
    ...(cookie && {
      cookie: cookie,
    }),
    ...(corsOrigin && {
      origin: corsOrigin,
    }),
    ...(cfConnectingIp && {
      "cf-connecting-ip": cfConnectingIp,
    }),
    ...(cfIpCountry && {
      "cf-ipcountry": cfIpCountry,
    }),
    ...(xForwardedFor && {
      "x-forwarded-for": xForwardedFor,
    }),
  };
}
