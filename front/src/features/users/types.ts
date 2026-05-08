import type { UserRole } from "@/types/auth"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  role?: UserRole
}

export interface UpdateOwnPasswordPayload {
  currentPassword: string
  newPassword: string
}
