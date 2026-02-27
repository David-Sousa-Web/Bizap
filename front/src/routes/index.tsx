import { createBrowserRouter, Navigate } from "react-router-dom"
import { lazy } from "react"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { AppLayout } from "@/components/AppLayout"
import { SuspenseWrapper } from "@/components/SuspenseWrapper"

const HomePage = lazy(() => import("@/pages/HomePage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const TemplatesPage = lazy(() => import("@/pages/TemplatesPage"))
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"))

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
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: (
              <SuspenseWrapper>
                <DashboardPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "/templates",
            element: (
              <SuspenseWrapper>
                <TemplatesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "/projetos",
            element: (
              <SuspenseWrapper>
                <ProjectsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
