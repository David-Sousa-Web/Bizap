import { ApplicationError } from '../../../utils/errors.js'
import {
  type ObservabilityContext,
  setErrorContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import type { ProjectRepository } from '../repositories/project-repository.js'

export async function deleteProjectService(
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
  })
  await repository.delete(id)
}
