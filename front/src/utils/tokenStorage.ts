import { env } from "@/lib/env"

const STORAGE_KEY = env?.VITE_AUTH_TOKEN_NAME ?? "auth_token"
const ONE_DAY_MS = 86_400_000
const DEFAULT_TTL_DAYS = env?.VITE_AUTH_TOKEN_TTL_DAYS ?? 20

let inMemoryToken: string | null = null

type StoredToken = {
    value: string
    expiresAt: number
}

export function setToken(token: string, ttlDays = DEFAULT_TTL_DAYS) {
    inMemoryToken = token
    const expiresAt = Date.now() + ttlDays * ONE_DAY_MS
    const payload: StoredToken = { value: token, expiresAt }
    localStorage.setItem(STORAGE_KEY, btoa(JSON.stringify(payload)))
}

export function getToken(): string | null {
    if (inMemoryToken) return inMemoryToken

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    try {
        const parsed = JSON.parse(atob(raw)) as StoredToken
        if (parsed.expiresAt > Date.now()) {
            inMemoryToken = parsed.value
            return inMemoryToken
        }
    } catch {
        /* Token inválido ou malformado */
    }

    clearToken()
    return null
}

export function clearToken() {
    inMemoryToken = null
    localStorage.removeItem(STORAGE_KEY)
}

export const tokenStorage = Object.freeze({
    get: getToken,
    set: setToken,
    clear: clearToken,
})

export type TokenStorage = typeof tokenStorage
