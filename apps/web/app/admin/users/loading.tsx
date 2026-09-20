import { Skeleton } from "@/components/ui/skeleton";
import { UsersTableSkeleton } from "./_components/users-table-skeleton";

export default function UsersLoading() {
  return (
    <main className="flex flex-col gap-4 p-8">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-9 w-full max-w-md" />
      <UsersTableSkeleton />
    </main>
  );
}
