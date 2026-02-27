import type { ProjectRepository } from '../repositories/project-repository.js'

export async function listProjectsService(
  userId: string,
  page: number,
  limit: number,
  search: string | undefined,
  repository: ProjectRepository,
) {
  const result = await repository.findAllByUserId(userId, page, limit, search)

  return {
    items: result.items.map((project) => ({
      id: project.id,
      name: project.name,
      image: project.image,
      phoneNumber: project.phoneNumber,
      agency: project.agency,
      templateSid: project.templateSid,
      flowMessage: project.flowMessage,
      apiKey: project.apiKey,
    })),
    meta: result.meta,
  }
}
