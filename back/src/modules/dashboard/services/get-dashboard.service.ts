import type { MediaRequestStatus, ZabbixMetricEventType } from '@prisma/client'
import { prisma } from '../../../lib/prisma.js'
import { env } from '../../../env.js'
import { encryptionService } from '../../../lib/encryption.js'
import type { ObservabilityContext } from '../../../lib/wide-event.js'
import { setErrorContext, setProjectContext } from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import { transformImageUrl } from '../../project/utils/transform-image-url.js'
import type { DashboardQuery } from '../schemas/dashboard.schema.js'

const MEDIA_STATUSES: MediaRequestStatus[] = [
  'PENDING',
  'TEMPLATE_SENT',
  'RECONFIRMATION_SENT',
  'DECLINED',
  'CONFIRMED',
  'MEDIA_SENT',
  'INVALID_RESPONSE_LIMIT',
  'FAILED',
]

const EVENT_FIELDS: Record<ZabbixMetricEventType, keyof ReplyMetrics> = {
  TEMPLATE_SENT: 'templateSent',
  YES_REPLY: 'yesReply',
  NO_REPLY: 'noReply',
  INVALID_REPLY: 'invalidReply',
  MEDIA_SENT: 'mediaSent',
}

type MediaStatusCounts = Record<MediaRequestStatus, number>

type ReplyMetrics = {
  templateSent: number
  yesReply: number
  noReply: number
  invalidReply: number
  mediaSent: number
}

function createEmptyMediaStatusCounts(): MediaStatusCounts {
  return {
    PENDING: 0,
    TEMPLATE_SENT: 0,
    RECONFIRMATION_SENT: 0,
    DECLINED: 0,
    CONFIRMED: 0,
    MEDIA_SENT: 0,
    INVALID_RESPONSE_LIMIT: 0,
    FAILED: 0,
  }
}

function createEmptyReplyMetrics(): ReplyMetrics {
  return {
    templateSent: 0,
    yesReply: 0,
    noReply: 0,
    invalidReply: 0,
    mediaSent: 0,
  }
}

function calculateRate(part: number, total: number) {
  if (total === 0) {
    return 0
  }

  return Number((part / total).toFixed(4))
}

function buildDateWhere(from?: string, to?: string) {
  const createdAt: { gte?: Date; lte?: Date } = {}

  if (from) {
    createdAt.gte = new Date(from)
  }

  if (to) {
    createdAt.lte = new Date(to)
  }

  return Object.keys(createdAt).length > 0 ? { createdAt } : {}
}

function normalizeNumberKey(number: string) {
  const trimmedNumber = number.trim()
  const digits = trimmedNumber.replace(/\D/g, '')

  if (digits.length === 0) {
    return trimmedNumber
  }

  if (trimmedNumber.startsWith('+') && !digits.startsWith('55')) {
    return `+${digits}`
  }

  const nationalNumber = digits.startsWith('55') ? digits.slice(2) : digits

  return `55${nationalNumber}`
}

export async function getDashboardService(
  query: DashboardQuery,
  observability: ObservabilityContext,
) {
  if (query.projectId) {
    setProjectContext(observability.wideEvent, {
      projectId: query.projectId,
    })
  }

  if (query.from && query.to && new Date(query.from) > new Date(query.to)) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'invalid_dashboard_date_range',
      message: 'Invalid date range',
    })

    throw new ApplicationError('Invalid date range', 400)
  }

  const projectWhere = query.projectId ? { id: query.projectId } : {}

  const projects = await prisma.project.findMany({
    where: projectWhere,
    select: {
      id: true,
      name: true,
      image: true,
      agency: true,
      zabbixHostName: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (query.projectId && projects.length === 0) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'project_not_found',
      message: 'Project not found',
    })

    throw new ApplicationError('Project not found', 404)
  }

  const projectIds = projects.map((project) => project.id)
  const mediaStatus = createEmptyMediaStatusCounts()
  const replyMetrics = createEmptyReplyMetrics()
  const filters = {
    projectId: query.projectId ?? null,
    from: query.from ?? null,
    to: query.to ?? null,
  }

  if (projectIds.length === 0) {
    return {
      filters,
      summary: {
        totalProjects: 0,
        totalNumbers: 0,
        totalMediaRequests: 0,
        totalDeliveredMedia: 0,
        totalFailed: 0,
        confirmationRate: 0,
        deliveryRate: 0,
      },
      mediaStatus,
      replyMetrics,
      projects: [],
      recentActivity: [],
      attention: {
        pendingRequests: 0,
        declinedRequests: 0,
        invalidResponseLimit: 0,
        failedRequests: 0,
        projectsWithoutZabbixHost: 0,
      },
    }
  }

  const dateWhere = buildDateWhere(query.from, query.to)
  const projectFilter = { projectId: { in: projectIds } }
  const mediaWhere = { ...projectFilter, ...dateWhere }
  const eventWhere = { ...projectFilter, ...dateWhere }

  const [
    numbers,
    mediaStatusCounts,
    eventCounts,
    mediaStatusCountsByProject,
    eventCountsByProject,
    recentMediaRequests,
  ] = await Promise.all([
    prisma.number.findMany({
      where: projectFilter,
      select: {
        projectId: true,
        number: true,
      },
    }),
    prisma.mediaRequest.groupBy({
      by: ['status'],
      where: mediaWhere,
      _count: { _all: true },
    }),
    prisma.zabbixMetricEvent.groupBy({
      by: ['type'],
      where: eventWhere,
      _count: { _all: true },
    }),
    prisma.mediaRequest.groupBy({
      by: ['projectId', 'status'],
      where: mediaWhere,
      _count: { _all: true },
    }),
    prisma.zabbixMetricEvent.groupBy({
      by: ['projectId', 'type'],
      where: eventWhere,
      _count: { _all: true },
    }),
    prisma.mediaRequest.findMany({
      where: mediaWhere,
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        projectId: true,
        numberId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: {
            name: true,
          },
        },
      },
    }),
  ])

  for (const item of mediaStatusCounts) {
    if (MEDIA_STATUSES.includes(item.status)) {
      mediaStatus[item.status] = item._count._all
    }
  }

  for (const item of eventCounts) {
    replyMetrics[EVENT_FIELDS[item.type]] = item._count._all
  }

  const uniqueNumbers = new Set<string>()
  const uniqueNumbersByProjectId = new Map<string, Set<string>>()

  for (const number of numbers) {
    const numberKey = normalizeNumberKey(encryptionService.decrypt(number.number))
    uniqueNumbers.add(`${number.projectId}:${numberKey}`)

    const projectNumbers = uniqueNumbersByProjectId.get(number.projectId) ?? new Set<string>()
    projectNumbers.add(numberKey)
    uniqueNumbersByProjectId.set(number.projectId, projectNumbers)
  }

  const totalNumbers = uniqueNumbers.size
  const numberCountByProjectId = new Map(
    Array.from(uniqueNumbersByProjectId.entries()).map(([projectId, projectNumbers]) => [
      projectId,
      projectNumbers.size,
    ]),
  )
  const mediaCountsByProjectId = new Map<string, MediaStatusCounts>()
  const eventCountsByProjectId = new Map<string, ReplyMetrics>()

  for (const item of mediaStatusCountsByProject) {
    const counts = mediaCountsByProjectId.get(item.projectId) ?? createEmptyMediaStatusCounts()
    counts[item.status] = item._count._all
    mediaCountsByProjectId.set(item.projectId, counts)
  }

  for (const item of eventCountsByProject) {
    const counts = eventCountsByProjectId.get(item.projectId) ?? createEmptyReplyMetrics()
    counts[EVENT_FIELDS[item.type]] = item._count._all
    eventCountsByProjectId.set(item.projectId, counts)
  }

  const dashboardProjects = projects.map((project) => {
    const projectMediaStatus = mediaCountsByProjectId.get(project.id) ?? createEmptyMediaStatusCounts()
    const projectReplyMetrics = eventCountsByProjectId.get(project.id) ?? createEmptyReplyMetrics()
    const totalMediaRequests = Object.values(projectMediaStatus)
      .reduce((total, count) => total + count, 0)

    return {
      id: project.id,
      name: project.name,
      image: transformImageUrl(project.image, project.id, env.API_BASE_URL),
      agency: project.agency,
      totalNumbers: numberCountByProjectId.get(project.id) ?? 0,
      totalMediaRequests,
      deliveredMedia: projectMediaStatus.MEDIA_SENT,
      failed: projectMediaStatus.FAILED,
      confirmationRate: calculateRate(
        projectMediaStatus.CONFIRMED + projectMediaStatus.MEDIA_SENT,
        totalMediaRequests,
      ),
    }
  })

  dashboardProjects.sort((projectA, projectB) => (
    projectB.totalMediaRequests - projectA.totalMediaRequests
  ))

  const totalMediaRequests = Object.values(mediaStatus)
    .reduce((total, count) => total + count, 0)

  return {
    filters,
    summary: {
      totalProjects: projects.length,
      totalNumbers,
      totalMediaRequests,
      totalDeliveredMedia: mediaStatus.MEDIA_SENT,
      totalFailed: mediaStatus.FAILED,
      confirmationRate: calculateRate(
        mediaStatus.CONFIRMED + mediaStatus.MEDIA_SENT,
        totalMediaRequests,
      ),
      deliveryRate: calculateRate(mediaStatus.MEDIA_SENT, totalMediaRequests),
    },
    mediaStatus,
    replyMetrics,
    projects: dashboardProjects,
    recentActivity: recentMediaRequests.map((mediaRequest) => ({
      id: mediaRequest.id,
      projectId: mediaRequest.projectId,
      projectName: mediaRequest.project.name,
      numberId: mediaRequest.numberId,
      status: mediaRequest.status,
      createdAt: mediaRequest.createdAt.toISOString(),
      updatedAt: mediaRequest.updatedAt.toISOString(),
    })),
    attention: {
      pendingRequests: mediaStatus.PENDING
        + mediaStatus.TEMPLATE_SENT
        + mediaStatus.RECONFIRMATION_SENT,
      declinedRequests: mediaStatus.DECLINED,
      invalidResponseLimit: mediaStatus.INVALID_RESPONSE_LIMIT,
      failedRequests: mediaStatus.FAILED,
      projectsWithoutZabbixHost: projects.filter((project) => (
        !project.zabbixHostName || project.zabbixHostName.trim().length === 0
      )).length,
    },
  }
}
