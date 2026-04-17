import type { MediaRequest, MediaRequestStatus } from '@prisma/client'

export interface MediaRepository {
  create(data: {
    mediaUrl: string
    numberId: string
    projectId: string
  }): Promise<MediaRequest>
  findById(id: string): Promise<MediaRequest | null>
  findActiveByPhoneNumber(phoneNumber: string): Promise<MediaRequest | null>
  updateStatus(id: string, status: MediaRequestStatus): Promise<MediaRequest>
  registerInvalidReply(id: string, status?: MediaRequestStatus): Promise<MediaRequest>
  resetForReconfirmation(id: string): Promise<MediaRequest>
  findPendingByNumberId(numberId: string): Promise<MediaRequest | null>
}
