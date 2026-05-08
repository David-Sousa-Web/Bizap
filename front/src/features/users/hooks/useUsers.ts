import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { userService } from "@/services/userService"
import type { PaginationParams } from "@/types/api"

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.list(params),
    placeholderData: keepPreviousData,
  })
}
