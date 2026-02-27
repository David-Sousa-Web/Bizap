import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Bizap
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Envie mídias via WhatsApp de forma automatizada, com templates
          pré-aprovados e fluxo de opt-in integrado.
        </p>
      </div>

      <Button asChild size="lg">
        <Link to={isAuthenticated ? "/dashboard" : "/login"}>
          {isAuthenticated ? "Ir para o Dashboard" : "Entrar na plataforma"}
          <ArrowRight />
        </Link>
      </Button>
    </main>
  )
}
