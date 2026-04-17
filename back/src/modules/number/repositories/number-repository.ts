import type { Prisma, Number as NumberModel } from '@prisma/client'
import type { CreateNumberBody } from '../schemas/number.schema.js'
import type { PaginatedResult } from '../../../utils/pagination.js'

export type NumberWithLatestMediaRequest = Prisma.NumberGetPayload<{
  include: {
    mediaRequests: {
      orderBy: { createdAt: 'desc' }
      take: 1
    }
  }
}>

export interface NumberRepository {
  create(data: CreateNumberBody & { projectId: string }): Promise<NumberModel>
  findAllByProjectId(
    projectId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResult<NumberWithLatestMediaRequest>>
  findById(id: string): Promise<NumberModel | null>
}
