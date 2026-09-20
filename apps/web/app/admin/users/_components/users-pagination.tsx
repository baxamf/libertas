import type { GetUsersQueryInput } from "@repo/shared-types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function buildHref(query: GetUsersQueryInput, targetPage: number) {
  const params = new URLSearchParams();
  if (query.email) params.set("email", query.email);
  if (query.role) params.set("role", query.role);
  params.set("page", String(targetPage));
  return `users?${params.toString()}`;
}

export function UsersPagination({
  page,
  totalPages,
  query,
}: {
  page: number;
  totalPages: number;
  query: GetUsersQueryInput;
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildHref(query, Math.max(1, page - 1))}
            aria-disabled={page <= 1}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="px-2 text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={buildHref(query, Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
