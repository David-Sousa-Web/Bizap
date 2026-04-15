import { Prisma } from '@prisma/client'
import { ApplicationError } from '../../../utils/errors.js'
import { generateApiKey } from '../../../utils/generate-api-key.js'
import type { ProjectRepository } from '../repositories/project-repository.js'
import type { CreateProjectBody } from '../schemas/project.schema.js'
import { transformImageUrl } from '../utils/transform-image-url.js'
import { env } from '../../../env.js'
import { slugifyProjectName } from '../utils/slugify-project-name.js'

export async function createProjectService(
  data: CreateProjectBody,
  userId: string,
  repository: ProjectRepository,
) {
  const apiKey = generateApiKey()
  const slug = slugifyProjectName(data.name)

  if (!slug) {
    throw new ApplicationError('Project name is invalid', 400)
  }

  try {
    const project = await repository.create({
      ...data,
      slug,
      apiKey,
      userId,
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
      throw new ApplicationError('Project name already exists', 409)
    }

    console.error(error)
    throw new ApplicationError('Failed to create project', 500)
  }
}
