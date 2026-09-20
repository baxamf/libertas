import { getUsers } from "../_lib/get-users";
import { UsersTable } from "./users-table";
import { UsersPagination } from "./users-pagination";
import type { GetUsersQueryInput } from "@repo/shared-types";

export async function UsersTableServer({
  query,
}: {
  query: GetUsersQueryInput;
}) {
  const result = await getUsers(query);

  return (
    <div className="flex flex-col gap-4">
      <UsersTable users={result.data} />
      <UsersPagination
        page={result.page}
        totalPages={result.totalPages}
        query={query}
      />
    </div>
  );
}
