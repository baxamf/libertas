import { z } from "zod";
import { stringToInstant } from "./codecs";

export const UserSessionPrivateSchema = z.object({
  sessionId: z.cuid2(),
  userId: z.cuid2(),
  jti: z.uuid(),
  device: z.string().min(1).nullable(),
  createdAt: stringToInstant,
  expiresAt: stringToInstant,
});

export type UserSessionPrivate = z.infer<typeof UserSessionPrivateSchema>;

export const UserSessionSchema = UserSessionPrivateSchema.omit({
  userId: true,
  jti: true,
})
  .extend({
    isCurrent: z.boolean().default(false),
  })
  .meta({
    id: "UserSessionSchema",
    title: "User Session Schema",
    description:
      "Public schema for the User Session model (sensitive fields omitted)",
  });

export type UserSession = z.infer<typeof UserSessionSchema>;
