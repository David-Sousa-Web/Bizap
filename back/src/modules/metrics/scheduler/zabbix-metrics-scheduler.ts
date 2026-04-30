import { execFile } from 'node:child_process'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { promisify } from 'node:util'
import { schedule } from 'node-cron'
import { env } from '../../../env.js'
import { appLogger } from '../../../lib/logger.js'
import { PrismaZabbixMetricsRepository } from '../repositories/prisma-zabbix-metrics-repository.js'
import { ZabbixMetricsService } from '../services/zabbix-metrics.service.js'

const execFileAsync = promisify(execFile)

async function sendToZabbix(dataContent: string): Promise<void> {
  await mkdir(dirname(env.METRICS_TEMP_FILE), { recursive: true })
  await writeFile(env.METRICS_TEMP_FILE, dataContent, 'utf8')

  try {
    const { stdout, stderr } = await execFileAsync('zabbix_sender', [
      '-z',
      env.ZABBIX_SERVER_HOST,
      '-p',
      String(env.ZABBIX_SERVER_PORT),
      '-i',
      env.METRICS_TEMP_FILE,
      '-vv',
    ])

    if (stdout) {
      appLogger.info({
        event: 'zabbix.metrics.sender_stdout',
        stdout,
      }, 'zabbix_sender output')
    }

    if (stderr && !stderr.includes('processed')) {
      appLogger.warn({
        event: 'zabbix.metrics.sender_stderr',
        stderr,
      }, 'zabbix_sender stderr')
    }
  } finally {
    try {
      await unlink(env.METRICS_TEMP_FILE)
    } catch {
      appLogger.debug({
        event: 'zabbix.metrics.temp_file_missing',
        tempFilePath: env.METRICS_TEMP_FILE,
      }, 'Zabbix metrics temp file was already removed')
    }
  }
}

export function startZabbixMetricsScheduler() {
  if (!env.ZABBIX_METRICS_ENABLED) {
    appLogger.info({
      event: 'zabbix.metrics.scheduler_disabled',
    }, 'Zabbix metrics scheduler disabled')
    return
  }

  const metricsRepository = new PrismaZabbixMetricsRepository()
  const metricsService = new ZabbixMetricsService(metricsRepository)

  schedule(env.ZABBIX_METRICS_CRON, async () => {
    const startedAt = Date.now()

    try {
      const dataContent = await metricsService.generateZabbixDataFile()

      if (!dataContent) {
        appLogger.info({
          event: 'zabbix.metrics.no_configured_projects',
        }, 'No configured Zabbix project hosts found')
        return
      }

      await sendToZabbix(dataContent)

      appLogger.info({
        event: 'zabbix.metrics.sent',
        durationMs: Date.now() - startedAt,
      }, 'Zabbix metrics sent successfully')
    } catch (error) {
      appLogger.error({
        event: 'zabbix.metrics.send_failed',
        err: error,
        durationMs: Date.now() - startedAt,
      }, 'Failed to send Zabbix metrics')
    }
  }, {
    timezone: 'America/Sao_Paulo',
  })

  appLogger.info({
    event: 'zabbix.metrics.scheduler_started',
    cron: env.ZABBIX_METRICS_CRON,
    serverHost: env.ZABBIX_SERVER_HOST,
    serverPort: env.ZABBIX_SERVER_PORT,
  }, 'Zabbix metrics scheduler started')
}
