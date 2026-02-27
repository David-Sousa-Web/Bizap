import { ApplicationError } from '../../../utils/errors.js'
import type { ProjectRepository } from '../repositories/project-repository.js'
import type { UpdateProjectBody } from '../schemas/project.schema.js'

export async function updateProjectService(
  id: string,
  userId: string,
  data: UpdateProjectBody,
  repository: ProjectRepository,
) {
  const project = await repository.findById(id)

  if (!project) {
    throw new ApplicationError('Project not found', 404)
  }

  if (project.userId !== userId) {
    throw new ApplicationError('Project not found', 404)
  }

  const updated = await repository.update(id, data)

  return {
    id: updated.id,
    name: updated.name,
    image: updated.image,
    phoneNumber: updated.phoneNumber,
    agency: updated.agency,
    templateSid: updated.templateSid,
    flowMessage: updated.flowMessage,
    apiKey: updated.apiKey,
  }
}
