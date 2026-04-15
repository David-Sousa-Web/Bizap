import { ApplicationError } from '../../../utils/errors.js'
import {
  maskActorPhone,
  type ObservabilityContext,
  setErrorContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import type { ProjectRepository } from '../repositories/project-repository.js'
import { transformImageUrl } from '../utils/transform-image-url.js'
import { env } from '../../../env.js'

export async function getProjectService(
  id: string,
  userId: string,
  repository: ProjectRepository,
  observability: ObservabilityContext,
) {
  setProjectContext(observability.wideEvent, {
    projectId: id,
  })

  const project = await repository.findById(id)

  if (!project) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'project_not_found',
      message: 'Project not found',
    })

    throw new ApplicationError('Project not found', 404)
  }

  if (project.userId !== userId) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'project_not_found',
      message: 'Project not found',
    })

    throw new ApplicationError('Project not found', 404)
  }

  setProjectContext(observability.wideEvent, {
    projectId: project.id,
    projectName: project.name,
    phoneNumberMasked: maskActorPhone(project.phoneNumber),
  })

  return {
    id: project.id,
    name: project.name,
    image: transformImageUrl(project.image, project.id, env.API_BASE_URL),
    phoneNumber: project.phoneNumber,
    agency: project.agency,
    templateSid: project.templateSid,
    flowMessage: project.flowMessage,
    apiKey: project.apiKey,
  }
}
