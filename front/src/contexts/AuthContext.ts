import { createContext } from "react"

export interface AuthContextData {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextData | null>(null)
