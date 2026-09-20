"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth";
import type { RegisterActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<
    RegisterActionState,
    FormData
  >(registerAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state?.errors?.email)}
        />
        {state?.errors?.email && (
          <p className="text-xs text-destructive">{state.errors.email[0]}</p>
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
          required
          aria-invalid={Boolean(state?.errors?.password)}
        />
        {state?.errors?.password ? (
          <p className="text-xs text-destructive">{state.errors.password[0]}</p>
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

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
