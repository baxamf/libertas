import "server-only";

import { jwtVerify } from "jose";
import { JwtPayload } from "@repo/shared-types";
import { ACCESS_SECRET, REFRESH_SECRET } from "../constants";

const encodedAccessKey = new TextEncoder().encode(ACCESS_SECRET);
const encodedRefreshKey = new TextEncoder().encode(REFRESH_SECRET);

/**
 * Decrypts a JWT token (access or refresh) and returns its payload.
 *
 * @param token - The JWT token to decrypt. Defaults to an empty string if not provided.
 * @param tokenType - The type of token to decrypt, either "access" or "refresh". Defaults to "access".
 * @returns A promise that resolves to the payload of the decrypted token, or null if decryption fails.
 */
export async function decrypt(
  token: string | undefined = "",
  tokenType: "access" | "refresh" = "access",
) {
  const encodedSecretKey =
    tokenType === "access" ? encodedAccessKey : encodedRefreshKey;
  try {
    const { payload } = await jwtVerify<JwtPayload>(token, encodedSecretKey, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch (error) {
    if (error instanceof Error)
      console.warn(`Failed to verify ${tokenType} token: `, error.message);
    return null;
  }
}
