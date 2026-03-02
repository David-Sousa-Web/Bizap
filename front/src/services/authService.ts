import { api } from "@/lib/api"
import type { ApiResponse } from "@/types/api"
import type { LoginRequest, LoginResponse } from "@/features/auth/types"

async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    data,
  )
  return response.data
}

export const authService = Object.freeze({ login })

export type AuthService = typeof authService
