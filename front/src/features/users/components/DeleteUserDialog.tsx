import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteUser } from "@/features/users/hooks/useDeleteUser"
import type { User } from "@/features/users/types"

interface DeleteUserDialogProps {
  user: User | null
  onClose: () => void
}

export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser()
  const open = user !== null

  function handleOpenChange(next: boolean) {
    if (!next && !deleteUser.isPending) {
      onClose()
    }
  }

  async function handleConfirm() {
    if (!user) return
    try {
      await deleteUser.mutateAsync(user.id)
      onClose()
    } catch {
      /* erro já tratado no hook via toast */
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O usuário{" "}
            <strong>{user?.name}</strong> ({user?.email}) perderá imediatamente o
            acesso à plataforma.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteUser.isPending}
            onClick={(e) => {
              e.preventDefault()
              if (!deleteUser.isPending) handleConfirm()
            }}
          >
            {deleteUser.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Sim, excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
