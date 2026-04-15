import { ApplicationError } from '../../../utils/errors.js'
import type { ProjectRepository } from '../repositories/project-repository.js'
import { transformImageUrl } from '../utils/transform-image-url.js'
import { env } from '../../../env.js'

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

  const updated = await repository.update(projectId, { flowMessage })

  return {
    id: updated.id,
    name: updated.name,
    image: transformImageUrl(updated.image, updated.id, env.API_BASE_URL),
    phoneNumber: updated.phoneNumber,
    agency: updated.agency,
    templateSid: updated.templateSid,
    flowMessage: updated.flowMessage,
    apiKey: updated.apiKey,
  }
}
