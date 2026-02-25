import type { Project } from '@prisma/client'
import type { CreateProjectBody, UpdateProjectBody } from '../schemas/project.schema.js'

export interface ProjectRepository {
  create(data: CreateProjectBody & { apiKey: string; userId: string }): Promise<Project>
  findById(id: string): Promise<Project | null>
  findAllByUserId(userId: string): Promise<Project[]>
  update(id: string, data: Partial<UpdateProjectBody & { flowMessage: string }>): Promise<Project>
  delete(id: string): Promise<void>
}
