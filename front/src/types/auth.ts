export type UserRole = "ADMIN" | "EDITOR" | "USER"

export interface AuthenticatedUser {
  name: string
  email: string
  role: UserRole
}
