import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { userService } from "@/services/userService"
import type { UpdateOwnPasswordPayload } from "@/features/users/types"

export function useUpdateOwnPassword() {
  return useMutation({
    mutationFn: (data: UpdateOwnPasswordPayload) =>
      userService.updateOwnPassword(data),
    onSuccess: () => {
      toast.success("Senha atualizada com sucesso!")
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Senha atual incorreta.")
          return
        }
      }
      toast.error("Não foi possível atualizar a senha. Tente novamente.")
    },
  })
}
