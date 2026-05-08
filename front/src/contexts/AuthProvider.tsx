import { useCallback, useEffect, useMemo, useState } from "react"
import { tokenStorage } from "@/utils/tokenStorage"
import { userStorage } from "@/utils/userStorage"
import { AuthContext, type AuthContextData } from "@/contexts/AuthContext"
import { AUTH_EXPIRED_EVENT } from "@/lib/api"
import type { AuthenticatedUser, UserRole } from "@/types/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())
  const [user, setUserState] = useState<AuthenticatedUser | null>(() =>
    userStorage.get(),
  )

  const login = useCallback(
    (newToken: string, newUser: AuthenticatedUser) => {
      tokenStorage.set(newToken)
      userStorage.set(newUser)
      setToken(newToken)
      setUserState(newUser)
    },
    [],
  )

  const logout = useCallback(() => {
    tokenStorage.clear()
    userStorage.clear()
    setToken(null)
    setUserState(null)
  }, [])

  const setUser = useCallback((nextUser: AuthenticatedUser) => {
    userStorage.set(nextUser)
    setUserState(nextUser)
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user],
  )

  useEffect(() => {
    const handleExpired = () => {
      tokenStorage.clear()
      userStorage.clear()
      setToken(null)
      setUserState(null)
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired)
  }, [])

  const value = useMemo<AuthContextData>(
    () => ({
      token,
      user,
      isAuthenticated: token !== null && user !== null,
      login,
      logout,
      setUser,
      hasRole,
    }),
    [token, user, login, logout, setUser, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
