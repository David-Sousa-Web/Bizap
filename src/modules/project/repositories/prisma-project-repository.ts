import { prisma } from '../../../lib/prisma.js'
import type { Project } from '@prisma/client'
import type { ProjectRepository } from './project-repository.js'
import type { CreateProjectBody, UpdateProjectBody } from '../schemas/project.schema.js'

export class PrismaProjectRepository implements ProjectRepository {
  async create(data: CreateProjectBody & { apiKey: string; userId: string }): Promise<Project> {
    return prisma.project.create({ data })
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } })
  }

  async findAllByUserId(userId: string): Promise<Project[]> {
    return prisma.project.findMany({ where: { userId } })
  }

  async update(id: string, data: Partial<UpdateProjectBody & { flowMessage: string; image: string }>): Promise<Project> {
    return prisma.project.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } })
  }
}
