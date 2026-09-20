import { z } from "zod";

export const PaginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
  })
  .meta({
    id: "PaginationQuerySchema",
    title: "Pagination Query Schema",
    description: "Common page/pageSize query parameters",
  });

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// Callers must give each instantiation its own `.meta({ id, title, description })`
// since the item schema (and therefore the component name) differs per call.
export function createPaginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    totalPages: z.number().int().min(0),
  });
}

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
