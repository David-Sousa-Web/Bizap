import type { Prisma, User } from '@prisma/client'
import { prisma } from '../../../lib/prisma.js'
import type {
  CreateUserData,
  UpdateUserData,
  UserRepository,
} from './user-repository.js'
import type { PaginatedResult } from '../../../utils/pagination.js'

export class PrismaUserRepository implements UserRepository {
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data })
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findAll(page: number, limit: number, search?: string): Promise<PaginatedResult<User>> {
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
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

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }
}
