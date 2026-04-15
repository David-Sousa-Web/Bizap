import { twilioClient } from '../../../lib/twilio.js'
import { prisma } from '../../../lib/prisma.js'
import { getPresignedMediaUrl } from '../../../lib/s3.js'
import { logger } from '../../../lib/logger.js'
import { PrismaMediaRepository } from '../../media/repositories/prisma-media-repository.js'
import {
  DECLINED_EXPIRATION_HOURS,
  DECLINE_REPLY_MESSAGE,
  INVALID_REPLY_LIMIT,
  INVALID_REPLY_MESSAGE,
  isDeclineMediaConfirmationReply,
  isValidMediaConfirmationReply,
} from '../utils/media-confirmation.js'

export async function twilioWebhookService(
  from: string,
  body: string,
) {
  const phoneNumber = from.replace('whatsapp:', '')

  const number = await prisma.number.findFirst({
    where: { number: phoneNumber },
  })

  if (!number) {
    return
  }

  const repository = new PrismaMediaRepository()
  const mediaRequest = await repository.findPendingByNumberId(number.id)

  if (!mediaRequest) {
    return
  }

  const project = await prisma.project.findUnique({
    where: { id: mediaRequest.projectId },
  })

  if (!project) {
    return
  }

  const twilioFrom = `whatsapp:${project.phoneNumber}`

  // Branch 1: User previously declined — any message within 24h re-sends the template
  if (mediaRequest.status === 'DECLINED') {
    const expirationMs = DECLINED_EXPIRATION_HOURS * 60 * 60 * 1000
    const isExpired = Date.now() - mediaRequest.updatedAt.getTime() > expirationMs

    if (isExpired) {
      return
    }

    try {
      await twilioClient.messages.create({
        from: twilioFrom,
        to: from,
        contentSid: project.templateSid,
      })

      await repository.resetForReconfirmation(mediaRequest.id)

      logger.info({
        from,
        mediaRequestId: mediaRequest.id,
      }, 'Resent template after user declined')
    } catch (error) {
      logger.error({
        err: error,
        from,
        mediaRequestId: mediaRequest.id,
      }, 'Failed to resend template after decline')
    }

    return
  }

  const normalizedBody = body
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  // Branch 2: Valid confirmation — deliver media
  if (isValidMediaConfirmationReply(normalizedBody)) {
    await repository.updateStatus(mediaRequest.id, 'CONFIRMED')

    try {
      const presignedUrl = await getPresignedMediaUrl(mediaRequest.mediaUrl)

      await twilioClient.messages.create({
        from: twilioFrom,
        to: from,
        body: project.flowMessage,
      })

      await twilioClient.messages.create({
        from: twilioFrom,
        to: from,
        mediaUrl: [presignedUrl],
      })

      await repository.updateStatus(mediaRequest.id, 'MEDIA_SENT')
    } catch (error) {
      logger.error({
        err: error,
        from,
        mediaRequestId: mediaRequest.id,
        projectId: mediaRequest.projectId,
      }, 'Failed to send confirmed media reply')
      await repository.updateStatus(mediaRequest.id, 'FAILED')
    }

    return
  }

  // Branch 3: Decline reply
  if (isDeclineMediaConfirmationReply(normalizedBody)) {
    if (mediaRequest.status === 'RECONFIRMATION_SENT') {
      // Second chance already used — close silently
      await repository.updateStatus(mediaRequest.id, 'INVALID_RESPONSE_LIMIT')

      logger.info({
        from,
        mediaRequestId: mediaRequest.id,
      }, 'User declined on reconfirmation, closing request')

      return
    }

    // First decline — give 24h window
    await repository.updateStatus(mediaRequest.id, 'DECLINED')

    logger.info({
      from,
      mediaRequestId: mediaRequest.id,
    }, 'User declined media delivery')

    await twilioClient.messages.create({
      from: twilioFrom,
      to: from,
      body: DECLINE_REPLY_MESSAGE,
    })

    return
  }

  // Branch 4: Invalid reply
  const nextInvalidReplyCount = mediaRequest.invalidReplyCount + 1
  const shouldClose = nextInvalidReplyCount >= INVALID_REPLY_LIMIT

  const updatedRequest = await repository.registerInvalidReply(
    mediaRequest.id,
    shouldClose ? 'INVALID_RESPONSE_LIMIT' : undefined,
  )

  logger.warn({
    from,
    mediaRequestId: mediaRequest.id,
    normalizedBody,
    invalidReplyCount: updatedRequest.invalidReplyCount,
    status: updatedRequest.status,
  }, 'Received invalid media confirmation reply')

  if (!shouldClose) {
    await twilioClient.messages.create({
      from: twilioFrom,
      to: from,
      body: INVALID_REPLY_MESSAGE,
    })
  }
}
