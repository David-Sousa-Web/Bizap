import { schedule } from 'node-cron'
import { env } from '../../../env.js'
import { appLogger } from '../../../lib/logger.js'
import { prisma } from '../../../lib/prisma.js'
import { buildErrorCode } from '../../../lib/wide-event.js'
import { PrismaMediaRepository } from '../repositories/prisma-media-repository.js'
import { retryFailedTemplateService } from '../services/retry-failed-template.service.js'

let isTemplateRetryRunning = false

async function runTemplateRetryWorker() {
  if (isTemplateRetryRunning) {
    appLogger.warn({
      event: 'media.template_retry.skipped',
      reason: 'previous_run_in_progress',
    }, 'Template retry worker skipped because a previous run is still in progress')
    return
  }

  isTemplateRetryRunning = true
  const startedAt = Date.now()
  const repository = new PrismaMediaRepository()
  let successCount = 0
  let failedCount = 0

  try {
    const failedTemplateRequests = await prisma.mediaRequest.findMany({
      where: {
        status: 'TEMPLATE_SEND_FAILED',
      },
      include: {
        number: true,
        project: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    })

    for (const mediaRequest of failedTemplateRequests) {
      const itemStartedAt = Date.now()

      try {
        await retryFailedTemplateService(mediaRequest, repository)
        successCount += 1

        appLogger.info({
          event: 'media.template_retry.item_sent',
          mediaRequestId: mediaRequest.id,
          projectId: mediaRequest.projectId,
          durationMs: Date.now() - itemStartedAt,
        }, 'Template resent by worker')
      } catch (error) {
        failedCount += 1

        appLogger.error({
          event: 'media.template_retry.item_failed',
          err: error,
          code: buildErrorCode(error),
          mediaRequestId: mediaRequest.id,
          projectId: mediaRequest.projectId,
          durationMs: Date.now() - itemStartedAt,
        }, 'Failed to resend template by worker')
      }
    }

    appLogger.info({
      event: 'media.template_retry.finished',
      totalCount: failedTemplateRequests.length,
      successCount,
      failedCount,
      durationMs: Date.now() - startedAt,
    }, 'Template retry worker finished')
  } catch (error) {
    appLogger.error({
      event: 'media.template_retry.failed',
      err: error,
      code: buildErrorCode(error),
      durationMs: Date.now() - startedAt,
    }, 'Template retry worker failed')
  } finally {
    isTemplateRetryRunning = false
  }
}

export function startTemplateRetryScheduler() {
  schedule(env.TEMPLATE_RETRY_CRON, runTemplateRetryWorker, {
    timezone: 'America/Sao_Paulo',
  })

  appLogger.info({
    event: 'media.template_retry.scheduler_started',
    cron: env.TEMPLATE_RETRY_CRON,
  }, 'Template retry scheduler started')
}
