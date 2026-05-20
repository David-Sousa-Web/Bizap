import { ApplicationError } from '../../../utils/errors.js'
import { prisma } from '../../../lib/prisma.js'
import { env } from '../../../env.js'
import {
  type ObservabilityContext,
  setErrorContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import { encryptionService } from '../../../lib/encryption.js'
import type { NumberRepository } from '../repositories/number-repository.js'

type ListedNumber = {
  id: string
  name: string
  number: string
  projectId: string
  imageUrl: string | null
  lastMediaRequestStatus: string | null
  createdAt: string
  updatedAt: string | null
}

function mapDecryptedNumber(number: Awaited<ReturnType<NumberRepository['findManyByProjectId']>>[number]): ListedNumber {
  const latestMediaRequest = number.mediaRequests[0] ?? null

  return {
    id: number.id,
    name: encryptionService.decrypt(number.name),
    number: encryptionService.decrypt(number.number),
    projectId: number.projectId,
    imageUrl: latestMediaRequest
      ? `${env.API_BASE_URL}/v1/projects/${number.projectId}/media-requests/${latestMediaRequest.id}/media`
      : null,
    lastMediaRequestStatus: latestMediaRequest?.status ?? null,
    createdAt: number.createdAt.toISOString(),
    updatedAt: latestMediaRequest?.updatedAt.toISOString() ?? null,
  }
}

export async function listNumbersService(
  projectId: string,
  page: number,
  limit: number,
  search: string | undefined,
  repository: NumberRepository,
  observability: ObservabilityContext,
) {
  setProjectContext(observability.wideEvent, {
    projectId,
  })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'project_not_found',
      message: 'Project not found',
    })

    throw new ApplicationError('Project not found', 404)
  }

  const normalizedSearch = search?.trim().toLowerCase()

  if (normalizedSearch) {
    const allNumbers = await repository.findManyByProjectId(projectId)
    const filteredItems = allNumbers
      .map(mapDecryptedNumber)
      .filter((number) => {
        return (
          number.name.toLowerCase().includes(normalizedSearch) ||
          number.number.toLowerCase().includes(normalizedSearch)
        )
      })
    const total = filteredItems.length
    const start = (page - 1) * limit

    return {
      items: filteredItems.slice(start, start + limit),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  const result = await repository.findAllByProjectId(projectId, page, limit)

  return {
    items: result.items.map(mapDecryptedNumber),
    meta: result.meta,
  }
}
