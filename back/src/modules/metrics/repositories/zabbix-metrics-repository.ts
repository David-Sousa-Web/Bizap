import type { ZabbixMetricEventType } from '@prisma/client'

export interface ZabbixProjectMetrics {
  projectId: string
  zabbixHostName: string
  counts: Record<ZabbixMetricEventType, number>
}

export interface ZabbixMetricsRepository {
  collectProjectMetrics(): Promise<ZabbixProjectMetrics[]>
}
