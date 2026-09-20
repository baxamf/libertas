import "server-only";

import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "../constants";
import { decrypt } from "./jwt";
import { JwtPayload } from "@repo/shared-types";
import { serverFetchWithCookieForwarding } from "../api/server";
import { cache } from "react";

/**
 * Verifies the session by checking the access and refresh tokens in cookies.
 * If the access token is valid, it returns the session payload.
 * If the access token is invalid but the refresh token is valid, it fetches a new access token and returns the session payload.
 * If both tokens are invalid, it returns an empty session.
 *
 * @returns A promise that resolves to a partial JwtPayload containing the user's role, email, and sub (subject).
 */
export async function verifySession(): Promise<Partial<JwtPayload>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  let session: JwtPayload | null = null;

  if (accessToken) {
    session = await decrypt(accessToken, "access");
  }

  if (!session && refreshToken) {
    const response = await serverFetchWithCookieForwarding("/auth/me");

    if (response.ok) {
      const newAccessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

      session = await decrypt(newAccessToken, "access");
    }
  }

  return { role: session?.role, email: session?.email, sub: session?.sub };
}

/**
 * Retrieves the current session from cookies.
 * This is useful for server-side rendering where you want to access the session data without making additional requests.
 *
 * @returns A promise that resolves to a partial JwtPayload containing the user's role, email, and sub (subject).
 */
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  let session: JwtPayload | null = null;

  if (accessToken) {
    session = await decrypt(accessToken, "access");
  }

  return { role: session?.role, email: session?.email, sub: session?.sub };
});
