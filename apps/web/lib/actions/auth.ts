"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type RegisterInput,
} from "@repo/shared-types";
import { serverFetchWithCookieForwarding } from "@/lib/api/server";
import { getErrorMessage } from "@/lib/utils/errors.utils";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/constants";
import type { ActionState } from "./action-state";

export type LoginActionState = ActionState<LoginInput>;
export type RegisterActionState = ActionState<RegisterInput>;

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const response = await serverFetchWithCookieForwarding("/auth/login", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    return { errors: { _form: [errorMessage] } };
  }

  redirect("/");
}

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const response = await serverFetchWithCookieForwarding("/auth/register", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    return { errors: { _form: [errorMessage] } };
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  await serverFetchWithCookieForwarding("/auth/logout", {
    method: "POST",
    body: JSON.stringify(null),
  });

  cookieStore.delete(ACCESS_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);

  redirect("/login");
}
