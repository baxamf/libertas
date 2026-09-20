import "server-only";

import { GetUsersQuerySchema, PaginatedUsersSchema } from "@repo/shared-types";
import type { GetUsersQueryInput, PaginatedUsers } from "@repo/shared-types";
import { serverFetchWithCookieForwarding } from "@/lib/api/server";

// raw shape Next.js hands us for `searchParams` — validate before using anywhere else
export type RawSearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

export function parseUsersQuery(raw: RawSearchParams): GetUsersQueryInput {
  return GetUsersQuerySchema.parse({
    page: toSingle(raw.page),
    pageSize: toSingle(raw.pageSize),
    email: toSingle(raw.email),
    role: toSingle(raw.role) === "all" ? undefined : toSingle(raw.role),
  });
}

export async function getUsers(
  query: GetUsersQueryInput,
): Promise<PaginatedUsers> {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  if (query.email) params.set("email", query.email);
  if (query.role) params.set("role", query.role);

  const response = await serverFetchWithCookieForwarding(
    `/users?${params.toString()}`,
    {},
  );

  if (!response.ok) {
    console.error(
      `Failed to load users: ${response.status} ${response.statusText}`,
    );

    if (response.status === 403) {
      throw new Error("You do not have permission to view this page");
    }
    throw new Error("Failed to load users");
  }

  return PaginatedUsersSchema.parse(await response.json());
}
