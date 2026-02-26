import { prisma } from '../../../lib/prisma.js'
import type { Number as NumberModel } from '@prisma/client'
import type { NumberRepository } from './number-repository.js'
import type { CreateNumberBody } from '../schemas/number.schema.js'

export class PrismaNumberRepository implements NumberRepository {
  async create(data: CreateNumberBody & { projectId: string }): Promise<NumberModel> {
    return prisma.number.create({ data })
  }

  async findAllByProjectId(projectId: string): Promise<NumberModel[]> {
    return prisma.number.findMany({ where: { projectId } })
  }

  async findById(id: string): Promise<NumberModel | null> {
    return prisma.number.findUnique({ where: { id } })
  }
}
