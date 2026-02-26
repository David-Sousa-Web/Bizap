import { ApplicationError } from '../../../utils/errors.js'
import type { ProjectRepository } from '../repositories/project-repository.js'

export async function updateFlowMessageService(
  projectId: string,
  userId: string,
  flowMessage: string,
  repository: ProjectRepository,
) {
  const project = await repository.findById(projectId)

  if (!project) {
    throw new ApplicationError('Project not found', 404)
  }

  if (project.userId !== userId) {
    throw new ApplicationError('Project not found', 404)
  }

  return repository.update(projectId, { flowMessage })
}
