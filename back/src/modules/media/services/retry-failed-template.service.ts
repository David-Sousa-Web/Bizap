import type { Prisma } from '@prisma/client'
import { env } from '../../../env.js'
import { encryptionService } from '../../../lib/encryption.js'
import { twilioClient } from '../../../lib/twilio.js'
import { recordZabbixMetricEvent } from '../../metrics/services/record-zabbix-metric-event.js'
import type { MediaRepository } from '../repositories/media-repository.js'

type FailedTemplateMediaRequest = Prisma.MediaRequestGetPayload<{
  include: {
    number: true
    project: true
  }
}>

export async function retryFailedTemplateService(
  mediaRequest: FailedTemplateMediaRequest,
  repository: Pick<MediaRepository, 'updateStatus' | 'updateTemplateTracking'>,
) {
  const decryptedNumber = encryptionService.decrypt(mediaRequest.number.number)

  try {
    const message = await twilioClient.messages.create({
      from: `whatsapp:${mediaRequest.project.phoneNumber}`,
      to: `whatsapp:${decryptedNumber}`,
      contentSid: mediaRequest.project.templateSid,
      statusCallback: `${env.API_BASE_URL}/v1/webhook/twilio/status`,
    })

    await repository.updateTemplateTracking(mediaRequest.id, {
      twilioTemplateMessageSid: message.sid,
      twilioTemplateMessageStatus: message.status ?? null,
      twilioTemplateErrorCode: null,
      twilioTemplateErrorMessage: null,
    })
    const updatedRequest = await repository.updateStatus(mediaRequest.id, 'TEMPLATE_SENT')
    await recordZabbixMetricEvent({
      type: 'TEMPLATE_SENT',
      projectId: mediaRequest.projectId,
      mediaRequestId: mediaRequest.id,
    })

    return updatedRequest
  } catch (error) {
    await repository.updateStatus(mediaRequest.id, 'TEMPLATE_SEND_FAILED')
    throw error
  }
}
