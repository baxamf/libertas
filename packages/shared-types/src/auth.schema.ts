import { z } from "zod";

export const LoginSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
  })
  .meta({
    id: "LoginSchema",
    title: "Login Schema",
    description: "Credentials payload for the login endpoint",
  });

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
  })
  .meta({
    id: "RegisterSchema",
    title: "Register Schema",
    description: "Credentials payload for the register endpoint",
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
  })
  .meta({
    id: "ChangePasswordSchema",
    title: "Change Password Schema",
    description: "Payload for changing the user's password",
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
