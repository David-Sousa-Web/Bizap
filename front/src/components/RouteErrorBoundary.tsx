import { useEffect } from "react"
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { env } from "@/lib/env"
import { logger } from "@/utils/logger"

const RELOAD_FLAG = "bizap:lazy-retry-reloaded"

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

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`
  }
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Erro desconhecido"
}

export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  const chunkError = isDynamicImportError(error)

  useEffect(() => {
    logger.error("RouteErrorBoundary capturou um erro:", error)
  }, [error])

  const handleReload = () => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG)
    } catch {
      /* ignora */
    }
    window.location.reload()
  }

  const handleGoHome = () => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG)
    } catch {
      /* ignora */
    }
    navigate("/", { replace: true })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Empty className="border max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle />
          </EmptyMedia>
          <EmptyTitle>
            {chunkError ? "Atualização disponível" : "Algo deu errado"}
          </EmptyTitle>
          <EmptyDescription>
            {chunkError
              ? "Uma nova versão do Bizap foi publicada enquanto você usava o sistema. Recarregue a página para continuar."
              : "Tivemos um problema inesperado ao abrir esta tela. Tente recarregar a página ou voltar para o início."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleReload}>
              <RotateCcw className="size-4" />
              Recarregar
            </Button>
            <Button variant="outline" onClick={handleGoHome}>
              <Home className="size-4" />
              Início
            </Button>
          </div>
          {env?.VITE_APP_DEBUG ? (
            <pre className="mt-4 max-h-40 w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
              {getErrorMessage(error)}
            </pre>
          ) : null}
        </EmptyContent>
      </Empty>
    </div>
  )
}
