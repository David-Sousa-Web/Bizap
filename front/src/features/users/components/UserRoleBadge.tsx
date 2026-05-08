import { Pencil, ShieldCheck, User as UserIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/types/auth"

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string
    variant: ComponentProps<typeof Badge>["variant"]
    Icon: typeof ShieldCheck
  }
> = {
  ADMIN: { label: "Administrador", variant: "default", Icon: ShieldCheck },
  EDITOR: { label: "Editor", variant: "secondary", Icon: Pencil },
  USER: { label: "Usuário", variant: "outline", Icon: UserIcon },
}

interface UserRoleBadgeProps {
  role: UserRole
  className?: string
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const { label, variant, Icon } = ROLE_CONFIG[role]
  return (
    <Badge variant={variant} className={className}>
      <Icon />
      {label}
    </Badge>
  )
}
