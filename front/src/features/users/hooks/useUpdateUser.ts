import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { userService } from "@/services/userService"
import type { UpdateUserPayload } from "@/features/users/types"

interface UpdateUserVariables {
  id: string
  data: UpdateUserPayload
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateUserVariables) =>
      userService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users", id] })
      toast.success("Usuário atualizado com sucesso!")
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 409) {
          toast.error("Já existe um usuário com esse e-mail.")
          return
        }
        if (error.response?.status === 404) {
          toast.error("Usuário não encontrado.")
          return
        }
      }
      toast.error("Não foi possível atualizar o usuário. Tente novamente.")
    },
  })
}
