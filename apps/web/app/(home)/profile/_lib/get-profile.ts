import "server-only";

import { serverFetchWithCookieForwarding } from "@/lib/api/server";
import { UserProfileSchema } from "@repo/shared-types";

export async function getProfile() {
  "use-cache: private";

  const response = await serverFetchWithCookieForwarding("users/profile", {});

  if (!response.ok) {
    console.error(
      `Failed to load data: ${response.status} ${response.statusText}`,
    );

    if (response.status === 403) {
      throw new Error("You do not have permission to view this page");
    }
    throw new Error("Failed to load users");
  }

  return UserProfileSchema.parse(await response.json());
}
