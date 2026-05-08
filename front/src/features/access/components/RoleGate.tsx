import type { ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"
import type { UserRole } from "@/types/auth"

interface RoleGateProps {
  allow: readonly UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { user } = useAuth()

  if (!user || !allow.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
