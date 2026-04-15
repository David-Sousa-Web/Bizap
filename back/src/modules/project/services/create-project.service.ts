import { Prisma } from '@prisma/client'
import { ApplicationError } from '../../../utils/errors.js'
import { generateApiKey } from '../../../utils/generate-api-key.js'
import {
  maskActorPhone,
  type ObservabilityContext,
  setErrorContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import type { ProjectRepository } from '../repositories/project-repository.js'
import type { CreateProjectBody } from '../schemas/project.schema.js'
import { transformImageUrl } from '../utils/transform-image-url.js'
import { env } from '../../../env.js'
import { slugifyProjectName } from '../utils/slugify-project-name.js'

export async function createProjectService(
  data: CreateProjectBody,
  userId: string,
  repository: ProjectRepository,
  observability: ObservabilityContext,
) {
  const apiKey = generateApiKey()
  const slug = slugifyProjectName(data.name)

  setProjectContext(observability.wideEvent, {
    projectName: data.name,
    phoneNumberMasked: maskActorPhone(data.phoneNumber),
  })

  if (!slug) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'invalid_project_name',
      message: 'Project name is invalid',
    })
    throw new ApplicationError('Project name is invalid', 400)
  }

  try {
    const project = await repository.create({
      ...data,
      slug,
      apiKey,
      userId,
    })

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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      setErrorContext(observability.wideEvent, {
        type: 'ApplicationError',
        code: 'project_name_conflict',
        message: 'Project name already exists',
      })

      throw new ApplicationError('Project name already exists', 409)
    }

    setErrorContext(observability.wideEvent, {
      type: error instanceof Error ? error.name : 'ProjectCreationError',
      code: 'project_create_failed',
      message: 'Failed to create project',
    })
    throw new ApplicationError('Failed to create project', 500)
  }
}
