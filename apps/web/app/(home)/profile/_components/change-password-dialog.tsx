"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { changePasswordAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ChangePasswordDialog({
  trigger,
}: {
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    null,
  );

  // Close the dialog once a pending change finishes without errors
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
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password with at least
            8 characters.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="oldPassword"
              className="text-xs font-medium text-foreground"
            >
              Current password
            </label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(state?.errors?.oldPassword)}
            />
            {state?.errors?.oldPassword && (
              <p className="text-xs text-destructive">
                {state.errors.oldPassword[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="newPassword"
              className="text-xs font-medium text-foreground"
            >
              New password
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(state?.errors?.newPassword)}
            />
            {state?.errors?.newPassword ? (
              <p className="text-xs text-destructive">
                {state.errors.newPassword[0]}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            )}
          </div>

          {state?.errors?._form && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {state.errors._form[0]}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating…" : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
