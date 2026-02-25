import { prisma } from '../../../lib/prisma.js'
import type { MediaRequest, MediaRequestStatus } from '@prisma/client'
import type { MediaRepository } from './media-repository.js'

export class PrismaMediaRepository implements MediaRepository {
  async create(data: {
    mediaUrl: string
    numberId: string
    projectId: string
  }): Promise<MediaRequest> {
    return prisma.mediaRequest.create({ data })
  }

  async findById(id: string): Promise<MediaRequest | null> {
    return prisma.mediaRequest.findUnique({ where: { id } })
  }

  async updateStatus(id: string, status: MediaRequestStatus): Promise<MediaRequest> {
    return prisma.mediaRequest.update({
      where: { id },
      data: { status },
    })
  }

  async findPendingByNumberId(numberId: string): Promise<MediaRequest | null> {
    return prisma.mediaRequest.findFirst({
      where: {
        numberId,
        status: { in: ['PENDING', 'TEMPLATE_SENT'] },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
