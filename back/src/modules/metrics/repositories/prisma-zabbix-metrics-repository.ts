import type { ZabbixMetricEventType } from '@prisma/client'
import { prisma } from '../../../lib/prisma.js'
import type { ZabbixMetricsRepository, ZabbixProjectMetrics } from './zabbix-metrics-repository.js'

const EVENT_TYPES: ZabbixMetricEventType[] = [
  'TEMPLATE_SENT',
  'YES_REPLY',
  'NO_REPLY',
  'INVALID_REPLY',
  'MEDIA_SENT',
]

function createEmptyCounts(): Record<ZabbixMetricEventType, number> {
  return {
    TEMPLATE_SENT: 0,
    YES_REPLY: 0,
    NO_REPLY: 0,
    INVALID_REPLY: 0,
    MEDIA_SENT: 0,
  }
}

export class PrismaZabbixMetricsRepository implements ZabbixMetricsRepository {
  async collectProjectMetrics(): Promise<ZabbixProjectMetrics[]> {
    const projects = await prisma.project.findMany({
      where: {
        zabbixHostName: {
          not: null,
        },
      },
      select: {
        id: true,
        zabbixHostName: true,
      },
    })

    const configuredProjects = projects
      .map((project) => ({
        projectId: project.id,
        zabbixHostName: project.zabbixHostName?.trim() ?? '',
        counts: createEmptyCounts(),
      }))
      .filter((project) => project.zabbixHostName.length > 0)

    if (configuredProjects.length === 0) {
      return []
    }

    const projectMetricsById = new Map(
      configuredProjects.map((project) => [project.projectId, project]),
    )

    const groupedEvents = await prisma.zabbixMetricEvent.groupBy({
      by: ['projectId', 'type'],
      where: {
        projectId: {
          in: configuredProjects.map((project) => project.projectId),
        },
      },
      _count: {
        _all: true,
      },
    })

    for (const event of groupedEvents) {
      if (!EVENT_TYPES.includes(event.type)) {
        continue
      }

      const projectMetrics = projectMetricsById.get(event.projectId)

      if (projectMetrics) {
        projectMetrics.counts[event.type] = event._count._all
      }
    }

    return configuredProjects
  }
}
