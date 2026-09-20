"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { User } from "@repo/shared-types";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import type {
  CreateUserActionState,
  UpdateUserActionState,
} from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function UserFormDialog({
  mode,
  user,
  trigger,
}: {
  mode: "create" | "edit";
  user?: Pick<User, "userId" | "email" | "role">;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const action = mode === "create" ? createUserAction : updateUserAction;
  const [state, formAction, isPending] = useActionState<
    CreateUserActionState | UpdateUserActionState,
    FormData
  >(action, null);

  // close the dialog once a pending submission finishes without errors
  const wasPending = useRef(isPending);
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.errors) {
      setOpen(false);
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create user" : "Edit user"}
          </DialogTitle>
        </DialogHeader>
        <form
          key={user ? `${user.userId}-${user.email}` : "create"}
          action={formAction}
          className="flex flex-col gap-4"
        >
          {mode === "edit" && user && (
            <input type="hidden" name="userId" value={user.userId} />
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={user?.email}
              required
              aria-invalid={Boolean(state?.errors?.email)}
            />
            {state?.errors?.email && (
              <p className="text-xs text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-foreground"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required={mode === "create"}
              aria-invalid={Boolean(state?.errors?.password)}
            />
            {state?.errors?.password ? (
              <p className="text-xs text-destructive">
                {state.errors.password[0]}
              </p>
            ) : mode === "edit" ? (
              <p className="text-xs text-muted-foreground">
                Leave blank to keep the current password
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="role"
              className="text-xs font-medium text-foreground"
            >
              Role
            </label>
            <Select
              key={user?.role}
              name="role"
              defaultValue={user?.role ?? "USER"}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
            {state?.errors?.role && (
              <p className="text-xs text-destructive">{state.errors.role[0]}</p>
            )}
          </div>

          {state?.errors?._form && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {state.errors._form[0]}
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending
              ? "Saving…"
              : mode === "create"
                ? "Create user"
                : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
