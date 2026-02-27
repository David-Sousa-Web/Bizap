import { api } from "@/lib/api"
import type { ApiResponse } from "@/types/api"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    data,
  )
  return response.data
}

export const authService = Object.freeze({ login })

export type AuthService = typeof authService
