import { KeyRound, Mail, ShieldCheck, User } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ChangePasswordForm } from "@/features/users/components/ChangePasswordForm"
import { UserRoleBadge } from "@/features/users/components/UserRoleBadge"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export default function ProfilePage() {
  const user = useCurrentUser()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize seus dados de acesso e gerencie sua senha.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Informações da conta
          </CardTitle>
          <CardDescription>
            Para alterar nome ou e-mail, solicite a um administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground flex items-center gap-2">
                <User className="size-4" /> Nome
              </Label>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Mail className="size-4" /> E-mail
              </Label>
              <span className="text-sm font-medium break-all">
                {user.email}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="size-4" /> Função
              </Label>
              <UserRoleBadge role={user.role} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            Trocar senha
          </CardTitle>
          <CardDescription>
            Use uma combinação forte com pelo menos 6 caracteres. Você precisa
            informar a senha atual para confirmar a alteração.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
