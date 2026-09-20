"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import type { UserSession } from "@repo/shared-types";
import { deleteSessionAction } from "@/lib/actions/profile";
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

export function RevokeSessionDialog({
  session,
  trigger,
}: {
  session: Pick<UserSession, "sessionId" | "device" | "isCurrent">;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [state, dispatch, isPending] = useActionState(
    deleteSessionAction,
    null,
  );

  // Close the dialog once a pending revocation finishes without errors
  const wasPending = useRef(isPending);
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.errors) {
      setOpen(false);
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  const handleRevoke = () => {
    startTransition(() => {
      dispatch(session.sessionId);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {session.isCurrent
              ? "Log out of current session?"
              : "Revoke session?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {session.isCurrent
              ? "This is your active session. Revoking it will immediately log you out and require you to sign back in."
              : `This will terminate the session on ${session.device || "this device"}. You will need to sign in again from that device to access your account.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state?.errors?._form && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {state.errors._form[0]}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleRevoke}
          >
            {isPending
              ? "Revoking…"
              : session.isCurrent
                ? "Revoke & log out"
                : "Revoke session"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
