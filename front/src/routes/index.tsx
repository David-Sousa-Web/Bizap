import { createBrowserRouter, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { AppLayout } from "@/components/AppLayout"
import { SuspenseWrapper } from "@/components/SuspenseWrapper"
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary"
import { RoleProtectedRoute } from "@/features/access/components/RoleProtectedRoute"
import { lazyWithRetry } from "@/lib/lazyWithRetry"

const HomePage = lazyWithRetry(() => import("@/pages/HomePage"))
const LoginPage = lazyWithRetry(() => import("@/pages/LoginPage"))
const DashboardPage = lazyWithRetry(() => import("@/pages/DashboardPage"))
const TemplatesPage = lazyWithRetry(() => import("@/pages/TemplatesPage"))
const ProjectsPage = lazyWithRetry(() => import("@/pages/ProjectsPage"))
const CreateProjectPage = lazyWithRetry(
  () => import("@/pages/CreateProjectPage"),
)
const ProjectDetailsPage = lazyWithRetry(
  () => import("@/pages/ProjectDetailsPage"),
)
const UsersPage = lazyWithRetry(() => import("@/pages/UsersPage"))
const ProfilePage = lazyWithRetry(() => import("@/pages/ProfilePage"))
const ForbiddenPage = lazyWithRetry(() => import("@/pages/ForbiddenPage"))

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <RouteErrorBoundary />,
    element: (
      <SuspenseWrapper>
        <HomePage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/login",
    errorElement: <RouteErrorBoundary />,
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteErrorBoundary />,
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
          {
            path: "/projetos/:id",
            element: (
              <SuspenseWrapper>
                <ProjectDetailsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "/perfil",
            element: (
              <SuspenseWrapper>
                <ProfilePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "/sem-permissao",
            element: (
              <SuspenseWrapper>
                <ForbiddenPage />
              </SuspenseWrapper>
            ),
          },
          {
            element: <RoleProtectedRoute allow={["ADMIN", "EDITOR"]} />,
            children: [
              {
                path: "/projetos/novo",
                element: (
                  <SuspenseWrapper>
                    <CreateProjectPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
          {
            element: <RoleProtectedRoute allow={["ADMIN"]} />,
            children: [
              {
                path: "/usuarios",
                element: (
                  <SuspenseWrapper>
                    <UsersPage />
                  </SuspenseWrapper>
                ),
              },
            ],
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
