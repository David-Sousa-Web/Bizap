import type { UserRole } from "@/types/auth"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  name: string
  email: string
  role: UserRole
}
