import { Suspense } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { parseUsersQuery, type RawSearchParams } from "./_lib/get-users";
import { UsersFilters } from "./_components/users-filters";
import { UsersTableServer } from "./_components/users-table-server";
import { UsersTableSkeleton } from "./_components/users-table-skeleton";
import { UserFormDialog } from "./_components/user-form-dialog";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Users" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const query = parseUsersQuery(await searchParams);

  return (
    <main className="flex flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Users
        </h1>
        <UserFormDialog
          mode="create"
          trigger={
            <Button>
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              New user
            </Button>
          }
        />
      </div>
      <UsersFilters
        key={`${query.email ?? ""}:${query.role ?? "all"}`}
        email={query.email}
        role={query.role}
      />
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTableServer query={query} />
      </Suspense>
    </main>
  );
}
