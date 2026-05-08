import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { userService } from "@/services/userService"
import type { CreateUserPayload } from "@/features/users/types"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserPayload) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Usuário criado com sucesso!")
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 409) {
          toast.error("Já existe um usuário com esse e-mail.")
          return
        }
      }
      toast.error("Não foi possível criar o usuário. Tente novamente.")
    },
  })
}
