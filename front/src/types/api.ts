export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface ListNumbersParams extends PaginationParams {
  id?: string
  name?: string
  number?: string
  lastMediaRequestStatus?: string
  hasMedia?: boolean
  createdAtFrom?: string
  createdAtTo?: string
  updatedAtFrom?: string
  updatedAtTo?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  meta: PaginationMeta
}
