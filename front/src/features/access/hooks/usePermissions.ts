import { useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"
import type { UserRole } from "@/types/auth"

export interface Permissions {
  role: UserRole | null
  isAdmin: boolean
  isEditor: boolean
  isUser: boolean
  canManageUsers: boolean
  canMutateProjects: boolean
  canDeleteProjects: boolean
  canCreateNumbers: boolean
  canSendMedia: boolean
  canViewApiKey: boolean
}

export function usePermissions(): Permissions {
  const { user } = useAuth()

  return useMemo(() => {
    const role = user?.role ?? null
    const isAdmin = role === "ADMIN"
    const isEditor = role === "EDITOR"
    const isUser = role === "USER"
    const canEditProjects = isAdmin || isEditor

    return {
      role,
      isAdmin,
      isEditor,
      isUser,
      canManageUsers: isAdmin,
      canMutateProjects: canEditProjects,
      canDeleteProjects: canEditProjects,
      canCreateNumbers: canEditProjects,
      canSendMedia: canEditProjects,
      canViewApiKey: canEditProjects,
    }
  }, [user])
}
