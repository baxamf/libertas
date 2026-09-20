"use client";

import { useQuery } from "@tanstack/react-query";
import type { User } from "@repo/shared-types";
import { clientFetch } from "@/lib/api/client";

export function useMe() {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: () => clientFetch<User>("/auth/me"),
    staleTime: 5 * 60 * 1000, // 5 minutes — user data changes infrequently
    retry: false, // don't retry auth failures (401 = logged out)
  });
}
