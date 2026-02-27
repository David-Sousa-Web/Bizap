import type { ProjectRepository } from '../repositories/project-repository.js'

export async function listProjectsService(
  userId: string,
  repository: ProjectRepository,
) {
  const projects = await repository.findAllByUserId(userId)

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    image: project.image,
    phoneNumber: project.phoneNumber,
    agency: project.agency,
    templateSid: project.templateSid,
    flowMessage: project.flowMessage,
    apiKey: project.apiKey,
  }))
}
