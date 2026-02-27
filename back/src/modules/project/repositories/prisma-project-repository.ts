import { prisma } from '../../../lib/prisma.js'
import type { Project } from '@prisma/client'
import type { ProjectRepository } from './project-repository.js'
import type { CreateProjectBody, UpdateProjectBody } from '../schemas/project.schema.js'
import type { PaginatedResult } from '../../../utils/pagination.js'

export class PrismaProjectRepository implements ProjectRepository {
  async create(data: CreateProjectBody & { apiKey: string; userId: string }): Promise<Project> {
    return prisma.project.create({ data })
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } })
  }

  async findAllByUserId(userId: string, page: number, limit: number, search?: string): Promise<PaginatedResult<Project>> {
    const where = {
      userId,
      ...(search && {
        name: { contains: search },
      }),
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ])

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async update(id: string, data: Partial<UpdateProjectBody & { flowMessage: string; image: string }>): Promise<Project> {
    return prisma.project.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } })
  }
}
