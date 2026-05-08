import { useNavigate } from "react-router-dom"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 items-center justify-center">
      <Empty className="border max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Sem permissão</EmptyTitle>
          <EmptyDescription>
            Você não tem permissão para acessar esta página. Caso acredite que
            isso é um erro, entre em contato com um administrador.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => navigate("/dashboard", { replace: true })}>
            <ArrowLeft className="size-4" />
            Voltar para o dashboard
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
