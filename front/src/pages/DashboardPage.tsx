import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardPage() {
  const { logout } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Você está autenticado. Esta página será construída em breve.
      </p>
      <Button variant="outline" onClick={logout}>
        <LogOut />
        Sair
      </Button>
    </main>
  )
}
