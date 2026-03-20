import { api } from "@/lib/api"
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from "@/types/api"
import type {
  CreateProjectPayload,
  UpdateProjectPayload,
  UpdateFlowMessagePayload,
  Project,
} from "@/features/projects/types"

async function list(
  params?: PaginationParams,
): Promise<PaginatedApiResponse<Project[]>> {
  const response = await api.get<PaginatedApiResponse<Project[]>>(
    "/projects",
    { params },
  )
  return response.data
}

async function create(
  data: CreateProjectPayload,
): Promise<ApiResponse<Project>> {
  const response = await api.post<ApiResponse<Project>>("/projects", data)
  return response.data
}

async function getById(id: string): Promise<ApiResponse<Project>> {
  const response = await api.get<ApiResponse<Project>>(`/projects/${id}`)
  return response.data
}

async function update(
  id: string,
  data: UpdateProjectPayload,
): Promise<ApiResponse<Project>> {
  const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data)
  return response.data
}

async function remove(id: string): Promise<ApiResponse<void>> {
  const response = await api.delete<ApiResponse<void>>(`/projects/${id}`)
  return response.data
}

async function updateFlowMessage(
  id: string,
  data: UpdateFlowMessagePayload,
): Promise<ApiResponse<Project>> {
  const response = await api.put<ApiResponse<Project>>(
    `/projects/${id}/response-message`,
    data,
  )
  return response.data
}

async function uploadImage(
  projectId: string,
  file: File,
): Promise<ApiResponse<Project>> {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post<ApiResponse<Project>>(
    `/projects/${projectId}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  )
  return response.data
}

export const projectService = Object.freeze({
  list,
  create,
  getById,
  update,
  remove,
  updateFlowMessage,
  uploadImage,
})

export type ProjectService = typeof projectService
