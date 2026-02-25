import type { Number as NumberModel } from '@prisma/client'
import type { CreateNumberBody } from '../schemas/number.schema.js'

export interface NumberRepository {
  create(data: CreateNumberBody & { projectId: string }): Promise<NumberModel>
  findAllByProjectId(projectId: string): Promise<NumberModel[]>
  findById(id: string): Promise<NumberModel | null>
}
