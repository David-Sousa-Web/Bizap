import type { Project } from '@prisma/client'
import type { CreateProjectBody, UpdateProjectBody } from '../schemas/project.schema.js'
import type { PaginatedResult } from '../../../utils/pagination.js'

export type CreateProjectData = CreateProjectBody & {
  slug: string
  apiKey: string
  userId: string
}

export interface ProjectRepository {
  create(data: CreateProjectData): Promise<Project>
  findById(id: string): Promise<Project | null>
  findAllByUserId(userId: string, page: number, limit: number, search?: string): Promise<PaginatedResult<Project>>
  update(id: string, data: Partial<UpdateProjectBody & { flowMessage: string; image: string }>): Promise<Project>
  delete(id: string): Promise<void>
}
