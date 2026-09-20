import { UserPrivate } from "./user.schema";

export type JwtPayload = Pick<UserPrivate, "email" | "role"> & {
  sub: string;
  jti: string;
};
