import axios from "axios"
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.clear()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)
