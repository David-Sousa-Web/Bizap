import { ApplicationError } from '../../../utils/errors.js'
import { prisma } from '../../../lib/prisma.js'
import type { NumberRepository } from '../repositories/number-repository.js'

export async function listNumbersService(
  projectId: string,
  userId: string,
  repository: NumberRepository,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== userId) {
    throw new ApplicationError('Project not found', 404)
  }

  const numbers = await repository.findAllByProjectId(projectId)

  return numbers.map((number) => ({
    id: number.id,
    name: number.name,
    number: number.number,
    projectId: number.projectId,
  }))
}
