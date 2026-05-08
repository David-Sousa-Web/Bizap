import { useAuth } from "@/hooks/useAuth"
import type { AuthenticatedUser } from "@/types/auth"

/**
 * Atalho semântico para acessar o usuário autenticado dentro de rotas
 * protegidas (ProtectedRoute garante que `user` não é nulo).
 *
 * Use em componentes/p\u00e1ginas internas. Para checagens em rotas
 * p\u00fablicas, prefira `useAuth()`.
 */
export function useCurrentUser(): AuthenticatedUser {
  const { user } = useAuth()
  if (!user) {
    throw new Error(
      "useCurrentUser deve ser usado dentro de uma rota protegida",
    )
  }
  return user
}
