import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import type { UserRole } from "@/types/auth"

interface RoleProtectedRouteProps {
  allow: readonly UserRole[]
}

export function RoleProtectedRoute({ allow }: RoleProtectedRouteProps) {
  const { user } = useAuth()

  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/sem-permissao" replace />
  }

  return <Outlet />
}
