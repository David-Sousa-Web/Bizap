import { createBrowserRouter, Navigate } from "react-router-dom"
import { lazy } from "react"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { SuspenseWrapper } from "@/components/SuspenseWrapper"

const HomePage = lazy(() => import("@/pages/HomePage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <SuspenseWrapper>
        <HomePage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
