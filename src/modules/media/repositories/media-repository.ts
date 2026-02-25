import type { MediaRequest, MediaRequestStatus } from '@prisma/client'

export interface MediaRepository {
  create(data: {
    mediaUrl: string
    numberId: string
    projectId: string
  }): Promise<MediaRequest>
  findById(id: string): Promise<MediaRequest | null>
  updateStatus(id: string, status: MediaRequestStatus): Promise<MediaRequest>
  findPendingByNumberId(numberId: string): Promise<MediaRequest | null>
}
