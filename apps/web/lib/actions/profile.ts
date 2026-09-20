"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import {
  type ChangePasswordInput,
  ChangePasswordSchema,
  UserSessionSchema,
} from "@repo/shared-types";
import { serverFetchWithCookieForwarding } from "@/lib/api/server";
import { getErrorMessage } from "@/lib/utils/errors.utils";
import type { ActionState } from "./action-state";
import { redirect } from "next/navigation";

export type ChangePasswordActionState = ActionState<ChangePasswordInput>;
export type DeleteSessionActionState = ActionState<Record<string, never>>;

export async function changePasswordAction(
  _prevState: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> {
  const parsed = ChangePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const response = await serverFetchWithCookieForwarding(
    "/auth/change-password",
    {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    },
  );

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    return { errors: { _form: [errorMessage] } };
  }

  refresh();
  redirect("/profile");
}

export async function deleteSessionAction(
  _prevState: DeleteSessionActionState,
  payload: FormData | string,
): Promise<DeleteSessionActionState> {
  const sessionId =
    typeof payload === "string" ? payload : payload.get("sessionId");
  if (typeof sessionId !== "string" || !sessionId) {
    return { errors: { _form: ["Missing session id"] } };
  }

  const response = await serverFetchWithCookieForwarding(
    `/auth/session/${sessionId}`,
    {
      method: "DELETE",
      body: JSON.stringify(null),
    },
  );

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    return { errors: { _form: [errorMessage] } };
  }

  const result = UserSessionSchema.safeParse(await response.json());

  if (result.error) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }
  const deletedSession = result.data;

  if (deletedSession.isCurrent) {
    redirect("/login");
  }

  refresh();
  return null;
}
