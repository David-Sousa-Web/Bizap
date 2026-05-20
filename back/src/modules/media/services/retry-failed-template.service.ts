import type { Prisma } from '@prisma/client'
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
  repository: Pick<MediaRepository, 'updateStatus'>,
) {
  const decryptedNumber = encryptionService.decrypt(mediaRequest.number.number)

  try {
    await twilioClient.messages.create({
      from: `whatsapp:${mediaRequest.project.phoneNumber}`,
      to: `whatsapp:${decryptedNumber}`,
      contentSid: mediaRequest.project.templateSid,
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
