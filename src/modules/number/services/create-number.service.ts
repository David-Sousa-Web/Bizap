import type { NumberRepository } from '../repositories/number-repository.js'
import type { CreateNumberBody } from '../schemas/number.schema.js'

export async function createNumberService(
  data: CreateNumberBody,
  projectId: string,
  repository: NumberRepository,
) {
  return repository.create({ ...data, projectId })
}
