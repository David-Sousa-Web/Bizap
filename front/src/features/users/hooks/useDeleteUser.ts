import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { userService } from "@/services/userService"

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.removeQueries({ queryKey: ["users", id] })
      toast.success("Usuário excluído com sucesso.")
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 400) {
          toast.error("Você não pode excluir o próprio usuário.")
          return
        }
        if (error.response?.status === 404) {
          toast.error("Usuário não encontrado.")
          return
        }
      }
      toast.error("Não foi possível excluir o usuário. Tente novamente.")
    },
  })
}
