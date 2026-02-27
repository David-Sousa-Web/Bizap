import { api } from "@/lib/api"
import type { ApiResponse } from "@/types/api"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export const authService = {
  login: (data: LoginRequest) =>
    api
      .post<ApiResponse<LoginResponse>>("/auth/login", data)
      .then((res) => res.data),
}
