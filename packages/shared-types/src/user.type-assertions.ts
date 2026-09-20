import type { FieldOutputTypes } from "@repo/db";
import type { UserPrivate } from "./user.schema.js";

type UserType = FieldOutputTypes["public"]["User"];

// ---------------------------------------------------------------------------
// Compile-time type assertion utilities (no runtime output).
// ---------------------------------------------------------------------------
type IsExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;

// ---------------------------------------------------------------------------
// Verify UserPrivateSchema exactly matches Prisma's generated User type.
// If the Prisma schema changes and user.schema.ts is not updated, this line
// will produce a type error at build time.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _VerifyUserPrivateSchema = Assert<IsExact<UserPrivate, UserType>>;
