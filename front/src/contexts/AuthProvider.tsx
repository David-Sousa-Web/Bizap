import { useCallback, useEffect, useMemo, useState } from "react"
import { tokenStorage } from "@/utils/tokenStorage"
import { AuthContext, type AuthContextData } from "@/contexts/AuthContext"
import { AUTH_EXPIRED_EVENT } from "@/lib/api"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())

  const login = useCallback((newToken: string) => {
    tokenStorage.set(newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
  }, [])

  useEffect(() => {
    const handleExpired = () => setToken(null)
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired)
  }, [])

  const value = useMemo<AuthContextData>(
    () => ({
      token,
      isAuthenticated: token !== null,
      login,
      logout,
    }),
    [token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
