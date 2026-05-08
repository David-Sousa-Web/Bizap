import { api } from "@/lib/api"
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams,
} from "@/types/api"
import type {
  CreateUserPayload,
  UpdateOwnPasswordPayload,
  UpdateUserPayload,
  User,
} from "@/features/users/types"

async function list(
  params?: PaginationParams,
): Promise<PaginatedApiResponse<User[]>> {
  const response = await api.get<PaginatedApiResponse<User[]>>("/users", {
    params,
  })
  return response.data
}

async function getById(id: string): Promise<ApiResponse<User>> {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`)
  return response.data
}

async function create(data: CreateUserPayload): Promise<ApiResponse<User>> {
  const response = await api.post<ApiResponse<User>>("/users", data)
  return response.data
}

async function update(
  id: string,
  data: UpdateUserPayload,
): Promise<ApiResponse<User>> {
  const response = await api.put<ApiResponse<User>>(`/users/${id}`, data)
  return response.data
}

async function remove(id: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/users/${id}`)
  return response.data
}

async function updateOwnPassword(
  data: UpdateOwnPasswordPayload,
): Promise<ApiResponse<null>> {
  const response = await api.patch<ApiResponse<null>>(
    "/users/me/password",
    data,
  )
  return response.data
}

export const userService = Object.freeze({
  list,
  getById,
  create,
  update,
  remove,
  updateOwnPassword,
})

export type UserService = typeof userService
