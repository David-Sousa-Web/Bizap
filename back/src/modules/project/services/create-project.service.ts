import { generateApiKey } from '../../../utils/generate-api-key.js'
import type { ProjectRepository } from '../repositories/project-repository.js'
import type { CreateProjectBody } from '../schemas/project.schema.js'

export async function createProjectService(
  data: CreateProjectBody,
  userId: string,
  repository: ProjectRepository,
) {
  const apiKey = generateApiKey()

  const project = await repository.create({
    ...data,
    apiKey,
    userId,
  })

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
