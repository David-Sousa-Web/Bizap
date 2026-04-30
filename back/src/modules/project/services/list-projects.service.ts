import type { ObservabilityContext } from '../../../lib/wide-event.js'
import type { ProjectRepository } from '../repositories/project-repository.js'
import { transformImageUrl } from '../utils/transform-image-url.js'
import { env } from '../../../env.js'

export async function listProjectsService(
  userId: string,
  page: number,
  limit: number,
  search: string | undefined,
  repository: ProjectRepository,
  _observability: ObservabilityContext,
) {
  const result = await repository.findAllByUserId(userId, page, limit, search)

  return {
    items: result.items.map((project) => ({
      id: project.id,
      name: project.name,
      image: transformImageUrl(project.image, project.id, env.API_BASE_URL),
      phoneNumber: project.phoneNumber,
      agency: project.agency,
      templateSid: project.templateSid,
      flowMessage: project.flowMessage,
      apiKey: project.apiKey,
      zabbixHostName: project.zabbixHostName,
    })),
    meta: result.meta,
  }
}
