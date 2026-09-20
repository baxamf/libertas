// Shared shape for useActionState-driven Server Actions validated with a Zod input type.
export type FieldErrors<T extends Record<string, unknown>> = Partial<
  Record<keyof T | "_form", string[]>
>;

export type ActionState<T extends Record<string, unknown>> = {
  errors: FieldErrors<T>;
} | null;
