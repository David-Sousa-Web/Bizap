import { createBrowserRouter, Navigate } from "react-router-dom"
import { lazy } from "react"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { AppLayout } from "@/components/AppLayout"
import { SuspenseWrapper } from "@/components/SuspenseWrapper"
import { RoleProtectedRoute } from "@/features/access/components/RoleProtectedRoute"

const HomePage = lazy(() => import("@/pages/HomePage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const TemplatesPage = lazy(() => import("@/pages/TemplatesPage"))
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"))
const CreateProjectPage = lazy(() => import("@/pages/CreateProjectPage"))
const ProjectDetailsPage = lazy(() => import("@/pages/ProjectDetailsPage"))
const UsersPage = lazy(() => import("@/pages/UsersPage"))
const ProfilePage = lazy(() => import("@/pages/ProfilePage"))
const ForbiddenPage = lazy(() => import("@/pages/ForbiddenPage"))

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
