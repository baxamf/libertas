"use server";

import { z } from "zod";
import {
  CreateUserSchema,
  UpdateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@repo/shared-types";
import { serverFetchWithCookieForwarding } from "@/lib/api/server";
import { getErrorMessage } from "@/lib/utils/errors.utils";
import { refresh } from "next/cache";
import type { ActionState } from "./action-state";

export type CreateUserActionState = ActionState<CreateUserInput>;
export type UpdateUserActionState = ActionState<UpdateUserInput>;
export type DeleteUserActionState = ActionState<Record<string, never>>;

export async function createUserAction(
  _prevState: CreateUserActionState,
  formData: FormData,
): Promise<CreateUserActionState> {
  const parsed = CreateUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const response = await serverFetchWithCookieForwarding("/users", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    return { errors: { _form: [errorMessage] } };
  }

  refresh();
  return null;
}

export async function updateUserAction(
  _prevState: UpdateUserActionState,
  formData: FormData,
): Promise<UpdateUserActionState> {
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) {
    return { errors: { _form: ["Missing user id"] } };
  }

  // blank password means "keep current" — drop empty strings so .partial() treats them as absent
  const entries = Object.entries(Object.fromEntries(formData)).filter(
    ([key, value]) => key !== "userId" && value !== "",
  );
  const parsed = UpdateUserSchema.safeParse(Object.fromEntries(entries));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const response = await serverFetchWithCookieForwarding(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    return { errors: { _form: [errorMessage] } };
  }

  refresh();
  return null;
}

export async function deleteUserAction(
  _prevState: DeleteUserActionState,
  userId: string,
): Promise<DeleteUserActionState> {
  const response = await serverFetchWithCookieForwarding(`/users/${userId}`, {
    method: "DELETE",
    body: JSON.stringify(null),
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    return { errors: { _form: [errorMessage] } };
  }

  refresh();
  return null;
}
