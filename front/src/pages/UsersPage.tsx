import { useState } from "react"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  Users as UsersIcon,
} from "lucide-react"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUsers } from "@/features/users/hooks/useUsers"
import { UsersTable } from "@/features/users/components/UsersTable"
import { UsersTableSkeleton } from "@/features/users/components/UsersTableSkeleton"
import { UserFormDialog } from "@/features/users/components/UserFormDialog"
import { DeleteUserDialog } from "@/features/users/components/DeleteUserDialog"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useDebounce } from "@/hooks/useDebounce"
import type { User } from "@/features/users/types"

type DialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; user: User }

export default function UsersPage() {
  const currentUser = useCurrentUser()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" })
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const debouncedSearch = useDebounce(search)

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
  })

  const users = response?.data ?? []
  const meta = response?.meta

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleLimitChange(value: string) {
    setLimit(Number(value))
    setPage(1)
  }

  function handleCloseDialog() {
    setDialog({ mode: "closed" })
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      handleCloseDialog()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <Button size="sm" onClick={() => setDialog({ mode: "create" })}>
            <Plus className="size-4" />
            Novo Usuário
          </Button>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && <UsersTableSkeleton />}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Erro ao carregar usuários</AlertTitle>
          <AlertDescription>
            Não foi possível carregar a lista de usuários. Tente novamente mais
            tarde.
          </AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw />
              Tentar novamente
            </Button>
          </AlertAction>
        </Alert>
      )}

      {!isLoading && !isError && users.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum usuário encontrado</EmptyTitle>
            <EmptyDescription>
              {debouncedSearch
                ? "Nenhum usuário corresponde à sua busca."
                : "Cadastre o primeiro usuário para começar a colaborar."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !isError && users.length > 0 && (
        <>
          <UsersTable
            users={users}
            currentUserEmail={currentUser.email}
            onEdit={(user) => setDialog({ mode: "edit", user })}
            onDelete={(user) => setUserToDelete(user)}
          />

          {meta && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Página {meta.page} de {meta.totalPages} ({meta.total}{" "}
                {meta.total === 1 ? "usuário" : "usuários"})
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm whitespace-nowrap">
                    Por página
                  </span>
                  <Select
                    value={String(limit)}
                    onValueChange={handleLimitChange}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {meta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próxima
                      <ChevronRight />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {dialog.mode === "create" && (
        <UserFormDialog
          mode="create"
          open
          onOpenChange={handleOpenChange}
        />
      )}
      {dialog.mode === "edit" && (
        <UserFormDialog
          mode="edit"
          open
          onOpenChange={handleOpenChange}
          user={dialog.user}
        />
      )}

      <DeleteUserDialog
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  )
}
