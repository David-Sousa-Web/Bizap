import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { LoginForm } from "@/features/auth/components/LoginForm"

export default function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginForm />
    </main>
  )
}
