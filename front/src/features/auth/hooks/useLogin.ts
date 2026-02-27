import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { authService } from "@/services/authService"
import type { ApiResponse } from "@/types/api"
import type { LoginFormData } from "@/features/auth/schemas/loginSchema"

export function useLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (response) => {
      if (response.data?.token) {
        login(response.data.token)
        navigate("/", { replace: true })
      }
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const message =
        error.response?.data?.message ?? "Erro ao fazer login. Tente novamente."
      toast.error(message)
    },
  })
}
