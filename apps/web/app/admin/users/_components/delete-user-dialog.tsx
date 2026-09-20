"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import type { User } from "@repo/shared-types";
import { deleteUserAction } from "@/lib/actions/users";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteUserDialog({
  user,
  trigger,
}: {
  user: Pick<User, "userId" | "email" | "role">;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [state, dispatch, isPending] = useActionState(deleteUserAction, null);

  // close the dialog once a pending deletion finishes without errors
  const wasPending = useRef(isPending);
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.errors) {
      setOpen(false);
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  const handleDelete = () => {
    startTransition(() => {
      dispatch(user.userId);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {user.email}. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state?.errors?._form && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {state.errors._form[0]}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
