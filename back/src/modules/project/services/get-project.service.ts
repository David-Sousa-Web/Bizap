import { ApplicationError } from '../../../utils/errors.js'
import type { ProjectRepository } from '../repositories/project-repository.js'

export async function getProjectService(
  id: string,
  userId: string,
  repository: ProjectRepository,
) {
  const project = await repository.findById(id)

  if (!project) {
    throw new ApplicationError('Project not found', 404)
  }

  if (project.userId !== userId) {
    throw new ApplicationError('Project not found', 404)
  }

  return {
    id: project.id,
    name: project.name,
    image: project.image,
    phoneNumber: project.phoneNumber,
    agency: project.agency,
    templateSid: project.templateSid,
    flowMessage: project.flowMessage,
    apiKey: project.apiKey,
  }
}
