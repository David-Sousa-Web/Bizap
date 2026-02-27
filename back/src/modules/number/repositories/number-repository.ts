import type { Number as NumberModel } from '@prisma/client'
import type { CreateNumberBody } from '../schemas/number.schema.js'
import type { PaginatedResult } from '../../../utils/pagination.js'

export interface NumberRepository {
  create(data: CreateNumberBody & { projectId: string }): Promise<NumberModel>
  findAllByProjectId(projectId: string, page: number, limit: number, search?: string): Promise<PaginatedResult<NumberModel>>
  findById(id: string): Promise<NumberModel | null>
}
