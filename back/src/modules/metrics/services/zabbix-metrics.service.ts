import type { ZabbixMetricEventType } from '@prisma/client'
import type { ZabbixMetricsRepository, ZabbixProjectMetrics } from '../repositories/zabbix-metrics-repository.js'

const ZABBIX_KEYS: Record<ZabbixMetricEventType, string> = {
  TEMPLATE_SENT: 'templates.enviados',
  YES_REPLY: 'respostas.sim',
  NO_REPLY: 'respostas.nao',
  INVALID_REPLY: 'respostas.invalidas',
  MEDIA_SENT: 'imagens.enviadas',
}

function formatZabbixHostName(hostName: string) {
  return `"${hostName.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export class ZabbixMetricsService {
  constructor(private readonly metricsRepository: ZabbixMetricsRepository) {}

  async getProjectMetrics(): Promise<ZabbixProjectMetrics[]> {
    return this.metricsRepository.collectProjectMetrics()
  }

  async generateZabbixDataFile(): Promise<string> {
    const projectMetrics = await this.getProjectMetrics()

    return projectMetrics
      .flatMap((project) => (
        Object.entries(ZABBIX_KEYS).map(([type, key]) => (
          `${formatZabbixHostName(project.zabbixHostName)} ${key} ${project.counts[type as ZabbixMetricEventType]}`
        ))
      ))
      .join('\n')
  }
}
