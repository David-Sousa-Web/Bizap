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
import type { ListNumbersQuery } from '../schemas/number.schema.js'

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

const STATUS_FLOW_ORDER = [
  'NONE',
  'PENDING',
  'TEMPLATE_SENT',
  'RECONFIRMATION_SENT',
  'CONFIRMED',
  'MEDIA_SENT',
  'DECLINED',
  'INVALID_RESPONSE_LIMIT',
  'TEMPLATE_SEND_FAILED',
  'MEDIA_SEND_FAILED',
  'FAILED',
] as const

const STATUS_FLOW_INDEX = new Map<string, number>(
  STATUS_FLOW_ORDER.map((status, index) => [status, index]),
)
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const COLLATOR = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true })

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

function normalizeFilterValue(value: string | undefined) {
  const normalized = value?.trim().toLowerCase()

  return normalized ? normalized : undefined
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}

function matchesText(value: string, filter: string | undefined) {
  return !filter || value.toLowerCase().includes(filter)
}

function matchesNumber(value: string, filter: string | undefined) {
  if (!filter) {
    return true
  }

  const filterDigits = normalizeDigits(filter)

  return (
    value.toLowerCase().includes(filter) ||
    (filterDigits.length > 0 && normalizeDigits(value).includes(filterDigits))
  )
}

function parseDateBoundary(value: string | undefined, boundary: 'start' | 'end') {
  if (!value) {
    return undefined
  }

  if (DATE_ONLY_PATTERN.test(value)) {
    return new Date(`${value}T${boundary === 'start' ? '00:00:00.000' : '23:59:59.999'}Z`)
  }

  return new Date(value)
}

function getStatusSortIndex(status: string | null) {
  return STATUS_FLOW_INDEX.get(status ?? 'NONE') ?? STATUS_FLOW_ORDER.length
}

function compareDates(left: string, right: string) {
  return new Date(left).getTime() - new Date(right).getTime()
}

function compareNullableDates(left: string | null, right: string | null, sortOrder: ListNumbersQuery['sortOrder']) {
  if (!left && !right) {
    return 0
  }

  if (!left) {
    return 1
  }

  if (!right) {
    return -1
  }

  const comparison = compareDates(left, right)

  return sortOrder === 'asc' ? comparison : -comparison
}

function comparePrimarySort(left: ListedNumber, right: ListedNumber, query: ListNumbersQuery) {
  const sortBy = query.sortBy ?? 'createdAt'
  const sortOrder = query.sortOrder ?? 'desc'

  if (sortBy === 'updatedAt') {
    return compareNullableDates(left.updatedAt, right.updatedAt, sortOrder)
  }

  let comparison = 0

  switch (sortBy) {
    case 'id':
      comparison = COLLATOR.compare(left.id, right.id)
      break
    case 'name':
      comparison = COLLATOR.compare(left.name, right.name)
      break
    case 'number':
      comparison = COLLATOR.compare(left.number, right.number)
      break
    case 'lastMediaRequestStatus':
      comparison = getStatusSortIndex(left.lastMediaRequestStatus) - getStatusSortIndex(right.lastMediaRequestStatus)
      break
    case 'hasMedia':
      comparison = Number(left.imageUrl !== null) - Number(right.imageUrl !== null)
      break
    case 'createdAt':
    default:
      comparison = compareDates(left.createdAt, right.createdAt)
      break
  }

  return sortOrder === 'asc' ? comparison : -comparison
}

function compareListedNumbers(left: ListedNumber, right: ListedNumber, query: ListNumbersQuery) {
  const primaryComparison = comparePrimarySort(left, right, query)

  if (primaryComparison !== 0) {
    return primaryComparison
  }

  if (query.sortBy !== 'createdAt') {
    const createdAtComparison = compareDates(left.createdAt, right.createdAt)

    if (createdAtComparison !== 0) {
      return -createdAtComparison
    }
  }

  return COLLATOR.compare(left.id, right.id)
}

function filterNumbers(numbers: ListedNumber[], query: ListNumbersQuery) {
  const normalizedSearch = normalizeFilterValue(query.search)
  const normalizedName = normalizeFilterValue(query.name)
  const normalizedNumber = normalizeFilterValue(query.number)
  const createdAtFrom = parseDateBoundary(query.createdAtFrom, 'start')
  const createdAtTo = parseDateBoundary(query.createdAtTo, 'end')
  const updatedAtFrom = parseDateBoundary(query.updatedAtFrom, 'start')
  const updatedAtTo = parseDateBoundary(query.updatedAtTo, 'end')

  return numbers.filter((number) => {
    if (query.id && number.id !== query.id) {
      return false
    }

    if (
      normalizedSearch &&
      !matchesText(number.name, normalizedSearch) &&
      !matchesNumber(number.number, normalizedSearch)
    ) {
      return false
    }

    if (!matchesText(number.name, normalizedName) || !matchesNumber(number.number, normalizedNumber)) {
      return false
    }

    if (query.lastMediaRequestStatus && (number.lastMediaRequestStatus ?? 'NONE') !== query.lastMediaRequestStatus) {
      return false
    }

    if (typeof query.hasMedia === 'boolean' && (number.imageUrl !== null) !== query.hasMedia) {
      return false
    }

    const createdAt = new Date(number.createdAt)

    if ((createdAtFrom && createdAt < createdAtFrom) || (createdAtTo && createdAt > createdAtTo)) {
      return false
    }

    if (updatedAtFrom || updatedAtTo) {
      if (!number.updatedAt) {
        return false
      }

      const updatedAt = new Date(number.updatedAt)

      if ((updatedAtFrom && updatedAt < updatedAtFrom) || (updatedAtTo && updatedAt > updatedAtTo)) {
        return false
      }
    }

    return true
  })
}

export async function listNumbersService(
  projectId: string,
  query: ListNumbersQuery,
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

  const page = query.page
  const limit = query.limit
  const allNumbers = await repository.findManyByProjectId(projectId)
  const filteredItems = filterNumbers(allNumbers.map(mapDecryptedNumber), query)
  const sortedItems = [...filteredItems].sort((left, right) => compareListedNumbers(left, right, query))
  const total = sortedItems.length
  const start = (page - 1) * limit

  return {
    items: sortedItems.slice(start, start + limit),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
