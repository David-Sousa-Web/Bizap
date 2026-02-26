import { env } from "@/lib/env"

/**
 * Verifica se o modo debug está habilitado
 * Prioridade: localStorage > env.VITE_APP_DEBUG
 */
const isDebugEnabled = (): boolean => {
    try {
        const debugStorage = localStorage.getItem("DEBUG")
        if (debugStorage === "true" || debugStorage === "1") return true
        if (debugStorage === "false" || debugStorage === "0") return false
    } catch {
        /* localStorage não disponível */
    }

    return env?.VITE_APP_DEBUG ?? false
}

/**
 * Logger com diferentes níveis
 * Só imprime quando VITE_APP_DEBUG está habilitado (exceto error)
 */
export const logger = {
    log: (...args: unknown[]): void => {
        if (isDebugEnabled()) console.log("[DEBUG]", ...args)
    },

    info: (...args: unknown[]): void => {
        if (isDebugEnabled()) console.info("[INFO]", ...args)
    },

    warn: (...args: unknown[]): void => {
        if (isDebugEnabled()) console.warn("[WARN]", ...args)
    },

    /** Erros sempre são logados, independente do modo debug */
    error: (...args: unknown[]): void => {
        console.error("[ERROR]", ...args)
    },

    debug: (...args: unknown[]): void => {
        if (isDebugEnabled()) console.debug("[DEBUG]", ...args)
    },

    group: (label: string, fn: () => void): void => {
        if (isDebugEnabled()) {
            console.group(`[DEBUG] ${label}`)
            fn()
            console.groupEnd()
        }
    },

    table: (data: unknown): void => {
        if (isDebugEnabled()) console.table(data)
    },
}
