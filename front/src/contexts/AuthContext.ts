import { createContext } from "react"
import type { AuthenticatedUser, UserRole } from "@/types/auth"

export interface AuthContextData {
  token: string | null
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  login: (token: string, user: AuthenticatedUser) => void
  logout: () => void
  setUser: (user: AuthenticatedUser) => void
  hasRole: (...roles: UserRole[]) => boolean
}

export const AuthContext = createContext<AuthContextData | null>(null)
