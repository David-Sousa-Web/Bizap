import { prisma } from '../../../lib/prisma.js'
import type { Number as NumberModel } from '@prisma/client'
import type { NumberRepository, NumberWithLatestMediaRequest } from './number-repository.js'
import type { CreateNumberBody } from '../schemas/number.schema.js'
import type { PaginatedResult } from '../../../utils/pagination.js'

export class PrismaNumberRepository implements NumberRepository {
  async create(data: CreateNumberBody & { projectId: string }): Promise<NumberModel> {
    return prisma.number.create({ data })
  }

  async findAllByProjectId(
    projectId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResult<NumberWithLatestMediaRequest>> {
    const where = {
      projectId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { number: { contains: search } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.number.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          mediaRequests: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.number.count({ where }),
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

  async findById(id: string): Promise<NumberModel | null> {
    return prisma.number.findUnique({ where: { id } })
  }
}
