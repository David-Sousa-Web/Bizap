import type { ZabbixMetricEventType } from '@prisma/client'
import { appLogger } from '../../../lib/logger.js'
import { prisma } from '../../../lib/prisma.js'

export async function recordZabbixMetricEvent(data: {
  type: ZabbixMetricEventType
  projectId: string
  mediaRequestId?: string
}) {
  try {
    await prisma.zabbixMetricEvent.create({
      data: {
        type: data.type,
        projectId: data.projectId,
        mediaRequestId: data.mediaRequestId,
      },
    })
  } catch (error) {
    appLogger.warn({
      event: 'zabbix.metric_event.record_failed',
      err: error,
      metricType: data.type,
      projectId: data.projectId,
      mediaRequestId: data.mediaRequestId,
    }, 'Failed to record Zabbix metric event')
  }
}
