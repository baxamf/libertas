"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import type { User } from "@repo/shared-types";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "./user-form-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

export function UserRowActions({
  user,
}: {
  user: Pick<User, "userId" | "email" | "role">;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <UserFormDialog
        mode="edit"
        key={user.userId}
        user={user}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Edit user">
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
          </Button>
        }
      />
      <DeleteUserDialog
        user={user}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Delete user">
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </Button>
        }
      />
    </div>
  );
}
