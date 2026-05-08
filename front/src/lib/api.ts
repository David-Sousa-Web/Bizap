import axios from "axios"
import { toast } from "sonner"
import { env } from "@/lib/env"
import { tokenStorage } from "@/utils/tokenStorage"

export const api = axios.create({
  baseURL: env?.VITE_API_BASE_URL,
  timeout: env?.VITE_API_TIMEOUT_MS ?? 25000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const AUTH_EXPIRED_EVENT = "auth:expired"

let lastForbiddenToastAt = 0
const FORBIDDEN_TOAST_THROTTLE_MS = 1500

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status

      if (status === 401) {
        tokenStorage.clear()
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
      }

      if (status === 403) {
        const now = Date.now()
        if (now - lastForbiddenToastAt > FORBIDDEN_TOAST_THROTTLE_MS) {
          lastForbiddenToastAt = now
          toast.error("Você não tem permissão para realizar esta ação.")
        }
      }
    }
    return Promise.reject(error)
  },
)
