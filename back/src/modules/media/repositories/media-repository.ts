import type { MediaRequest, MediaRequestStatus } from '@prisma/client'

export type TemplateTrackingData = {
  twilioTemplateMessageSid?: string | null
  twilioTemplateMessageStatus?: string | null
  twilioTemplateErrorCode?: string | null
  twilioTemplateErrorMessage?: string | null
}

export interface MediaRepository {
  create(data: {
    mediaUrl: string
    numberId: string
    projectId: string
  }): Promise<MediaRequest>
  findById(id: string): Promise<MediaRequest | null>
  findByTemplateMessageSid(messageSid: string): Promise<MediaRequest | null>
  findActiveByPhoneNumber(phoneNumber: string): Promise<MediaRequest[]>
  updateStatus(id: string, status: MediaRequestStatus): Promise<MediaRequest>
  updateTemplateTracking(id: string, data: TemplateTrackingData): Promise<MediaRequest>
  registerInvalidReply(id: string, status?: MediaRequestStatus): Promise<MediaRequest>
  resetForReconfirmation(id: string): Promise<MediaRequest>
  findPendingByNumberId(numberId: string): Promise<MediaRequest | null>
}
