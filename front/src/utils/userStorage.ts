import { env } from "@/lib/env"
import type { AuthenticatedUser } from "@/types/auth"

const TOKEN_KEY = env?.VITE_AUTH_TOKEN_NAME ?? "auth_token"
const STORAGE_KEY = `${TOKEN_KEY}_user`
const ONE_DAY_MS = 86_400_000
const DEFAULT_TTL_DAYS = env?.VITE_AUTH_TOKEN_TTL_DAYS ?? 20

let inMemoryUser: AuthenticatedUser | null = null

type StoredUser = {
  value: AuthenticatedUser
  expiresAt: number
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    (candidate.role === "ADMIN" ||
      candidate.role === "EDITOR" ||
      candidate.role === "USER")
  )
}

export function setUser(user: AuthenticatedUser, ttlDays = DEFAULT_TTL_DAYS) {
  inMemoryUser = user
  const expiresAt = Date.now() + ttlDays * ONE_DAY_MS
  const payload: StoredUser = { value: user, expiresAt }
  localStorage.setItem(STORAGE_KEY, btoa(JSON.stringify(payload)))
}

export function getUser(): AuthenticatedUser | null {
  if (inMemoryUser) return inMemoryUser

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(atob(raw)) as StoredUser
    if (parsed.expiresAt > Date.now() && isAuthenticatedUser(parsed.value)) {
      inMemoryUser = parsed.value
      return inMemoryUser
    }
  } catch {
    /* dado corrompido */
  }

  clearUser()
  return null
}

export function clearUser() {
  inMemoryUser = null
  localStorage.removeItem(STORAGE_KEY)
}

export const userStorage = Object.freeze({
  get: getUser,
  set: setUser,
  clear: clearUser,
})

export type UserStorage = typeof userStorage
