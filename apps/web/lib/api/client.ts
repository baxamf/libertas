/**
 * Client-side fetch helper used in TanStack Query hooks.
 * Calls /api/* which Next.js rewrites to the NestJS backend.
 * Auth cookies are forwarded automatically by the browser.
 */
export async function clientFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `/api${path.startsWith("/") ? "" : "/"}${path}`;

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    console.log("clientFetch error", {
      url,
      status: response.status,
      statusText: response.statusText,
    });
    const message = await response.text().catch(() => String(response.status));
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
