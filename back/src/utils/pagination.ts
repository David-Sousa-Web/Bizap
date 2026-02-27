import { z } from 'zod'

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
})

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export interface PaginatedResult<T> {
  items: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
