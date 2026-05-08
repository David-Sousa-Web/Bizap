import { memo } from "react"
import { MoreHorizontal, Pencil, Trash2, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserRoleBadge } from "@/features/users/components/UserRoleBadge"
import type { User } from "@/features/users/types"

interface UsersTableProps {
  users: User[]
  currentUserEmail: string
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

interface UserRowProps {
  user: User
  isCurrentUser: boolean
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

const UserRow = memo(function UserRow({
  user,
  isCurrentUser,
  onEdit,
  onDelete,
}: UserRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {user.name}
          {isCurrentUser && (
            <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <UserCheck className="size-3" /> você
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-muted-foreground">
        {user.email}
      </TableCell>
      <TableCell>
        <UserRoleBadge role={user.role} />
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={`Ações para ${user.name}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuItem onSelect={() => onEdit(user)}>
              <Pencil className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(user)}
              disabled={isCurrentUser}
            >
              <Trash2 className="mr-2 size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
})

export function UsersTable({
  users,
  currentUserEmail,
  onEdit,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">E-mail</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isCurrentUser={user.email === currentUserEmail}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
