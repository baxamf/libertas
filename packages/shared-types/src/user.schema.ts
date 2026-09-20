import { z } from "zod";
import { stringToInstant } from "./codecs";
import {
  PaginationQuerySchema,
  createPaginatedSchema,
} from "./pagination.schema";
import { UserSessionSchema } from "./user-session.schema";

export const UserRoleEnum = z.enum(["USER", "ADMIN"]).meta({
  example: "USER",
  description: "Role of the user",
});
export type UserRole = z.infer<typeof UserRoleEnum>;

// ---------------------------------------------------------------------------
// Internal schema — matches the Prisma User model 1:1 (never expose directly).
// The compile-time assertion in user.type-assertions.ts ensures this stays in
// sync with @repo/db whenever the Prisma schema changes.
// ---------------------------------------------------------------------------
export const UserPrivateSchema = z
  .object({
    userId: z.cuid2(),
    email: z.email().meta({
      example: "example@example.com",
      description: "User's email address",
    }),
    role: UserRoleEnum,
    password: z.string().min(8).nullable().meta({
      example: "strongpassword123",
      description: "User's password",
    }),
    // wire format is ISO string (input); rich domain value is Temporal.Instant (output)
    createdAt: stringToInstant,
    updatedAt: stringToInstant,
  })
  .meta({
    id: "UserPrivateSchema",
    title: "User Private Schema",
    description: "Internal schema for the User model (includes password)",
  });

export type UserPrivate = z.infer<typeof UserPrivateSchema>;

// ---------------------------------------------------------------------------
// Public response schema — password is always omitted from API responses.
// ---------------------------------------------------------------------------
export const UserSchema = UserPrivateSchema.omit({ password: true }).meta({
  id: "UserSchema",
  title: "User Schema",
  description: "Public schema for the User model (password omitted)",
});

export type User = z.infer<typeof UserSchema>;

// ---------------------------------------------------------------------------
// Create input — used for POST /users or registration endpoints.
// ---------------------------------------------------------------------------
export const CreateUserSchema = z
  .object({
    email: UserPrivateSchema.shape.email,
    password: z.string().min(8),
    role: UserPrivateSchema.shape.role,
  })
  .meta({
    id: "CreateUserSchema",
    title: "Create User Schema",
    description: "Input payload for creating a new user",
  });

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// ---------------------------------------------------------------------------
// Update input — all fields optional, used for PATCH endpoints.
// ---------------------------------------------------------------------------
export const UpdateUserSchema = CreateUserSchema.partial().meta({
  id: "UpdateUserSchema",
  title: "Update User Schema",
  description: "Input payload for partially updating a user",
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// ---------------------------------------------------------------------------
// Filters + pagination for GET /users — merged into a single query schema.
// ---------------------------------------------------------------------------
export const UserFiltersSchema = z.object({
  email: z.string().trim().min(1).optional(),
  role: UserRoleEnum.optional(),
});

export type UserFilters = z.infer<typeof UserFiltersSchema>;

export const GetUsersQuerySchema = PaginationQuerySchema.extend(
  UserFiltersSchema.shape,
);

export type GetUsersQueryInput = z.infer<typeof GetUsersQuerySchema>;

export const PaginatedUsersSchema = createPaginatedSchema(UserSchema).meta({
  id: "PaginatedUsersSchema",
  title: "Paginated Users Schema",
  description: "Paginated list of users",
});

export type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;

// ---------------------------------------------------------------------------
// User profile including associated sessions.
// ---------------------------------------------------------------------------
export const UserProfileSchema = UserSchema.extend({
  userSessions: z.array(UserSessionSchema),
}).meta({
  id: "UserProfileSchema",
  title: "User Profile Schema",
  description: "User profile including associated sessions",
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
