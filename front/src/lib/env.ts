import { z } from "zod"

// Helper para converter string "true"/"false" para boolean corretamente
// z.coerce.boolean() não funciona como esperado para strings,
// pois Boolean("false") retorna true (qualquer string não-vazia é truthy)
const booleanFromString = (defaultValue: boolean) =>
    z
        .union([z.boolean(), z.string()])
        .transform((val) => {
            if (typeof val === "boolean") return val
            return val.toLowerCase() === "true"
        })
        .default(defaultValue)

const envSchema = z.object({
    VITE_API_BASE_URL: z.string().min(1, "VITE_API_BASE_URL é obrigatório"),
    VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(25000),
    VITE_AUTH_TOKEN_NAME: z.string().min(1, "VITE_AUTH_TOKEN_NAME é obrigatório"),
    VITE_AUTH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(20),
    VITE_APP_DEBUG: booleanFromString(false),
})

export type Env = z.infer<typeof envSchema>

type EnvValidationResult =
    | { success: true; data: Env; error: null }
    | { success: false; data: null; error: string }

function validateEnv(): EnvValidationResult {
    const parsed = envSchema.safeParse(import.meta.env)

    if (!parsed.success) {
        const issues = parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("\n")

        const errorMessage = `❌ Falha ao validar variáveis de ambiente:\n\n${issues}`

        // Log no console para debug
        console.error(errorMessage)

        return { success: false, data: null, error: errorMessage }
    }

    return { success: true, data: parsed.data, error: null }
}

export const envResult = validateEnv()

// Exporta env apenas se a validação foi bem-sucedida
// Para uso em componentes que dependem das variáveis de ambiente
export const env = envResult.success ? envResult.data : null

