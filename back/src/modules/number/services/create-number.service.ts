import type { NumberRepository } from '../repositories/number-repository.js'
import type { CreateNumberBody } from '../schemas/number.schema.js'

export async function createNumberService(
  data: CreateNumberBody,
  projectId: string,
  repository: NumberRepository,
) {
  const number = await repository.create({ ...data, projectId })

  return {
    id: number.id,
    name: number.name,
    number: number.number,
    projectId: number.projectId,
  }
}
