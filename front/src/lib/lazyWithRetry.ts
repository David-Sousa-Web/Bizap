import { lazy, type ComponentType, type LazyExoticComponent } from "react"
import { logger } from "@/utils/logger"

/**
 * Flag em sessionStorage que indica que já tentamos recarregar a página
 * por causa de um chunk obsoleto. Evita loop infinito de reload caso o
 * problema seja outro (ex.: rede caiu, arquivo realmente quebrado).
 */
const RELOAD_FLAG = "bizap:lazy-retry-reloaded"

/**
 * Detecta se um erro é causado por chunk de import dinâmico que falhou ao
 * carregar — tipicamente após um novo deploy, quando o arquivo com o hash
 * antigo deixou de existir no servidor.
 */
function isDynamicImportError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const message = error.message ?? ""
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /Loading chunk \S+ failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  )
}

/**
 * Wrapper em volta de `React.lazy()` que recupera automaticamente do erro
 * "Failed to fetch dynamically imported module". Quando o chunk não é
 * encontrado (normalmente porque houve um deploy enquanto a aba estava
 * aberta), força um único reload para o navegador buscar o `index.html`
 * atualizado e, com ele, os novos hashes de chunks.
 *
 * Se o erro persistir após o reload, o erro é propagado normalmente para
 * o `errorElement` do React Router.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await importer()
      try {
        sessionStorage.removeItem(RELOAD_FLAG)
      } catch {
        /* sessionStorage pode não estar disponível (modo privado etc.) */
      }
      return mod
    } catch (error) {
      if (!isDynamicImportError(error)) {
        throw error
      }

      let alreadyReloaded = false
      try {
        alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1"
      } catch {
        alreadyReloaded = false
      }

      if (alreadyReloaded) {
        logger.error(
          "Dynamic import falhou mesmo após reload. Propagando erro.",
          error,
        )
        throw error
      }

      logger.warn(
        "Dynamic import falhou (provável chunk obsoleto após deploy). Recarregando página...",
        error,
      )
      try {
        sessionStorage.setItem(RELOAD_FLAG, "1")
      } catch {
        /* sem sessionStorage, prosseguimos com o reload mesmo assim */
      }
      window.location.reload()

      // Mantém a Suspense pendente até o reload efetivamente acontecer.
      return new Promise<never>(() => {})
    }
  })
}
