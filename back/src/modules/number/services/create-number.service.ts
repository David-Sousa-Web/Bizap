import {
  maskActorPhone,
  type ObservabilityContext,
  setNumberContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import { encryptionService } from '../../../lib/encryption.js'
import type { NumberRepository } from '../repositories/number-repository.js'
import type { CreateNumberBody } from '../schemas/number.schema.js'

export async function createNumberService(
  data: CreateNumberBody,
  projectId: string,
  repository: NumberRepository,
  observability: ObservabilityContext,
) {
  setProjectContext(observability.wideEvent, {
    projectId,
  })
  setNumberContext(observability.wideEvent, {
    numberName: data.name,
    numberMasked: maskActorPhone(data.number),
  })

  const number = await repository.create({
    name: encryptionService.encrypt(data.name),
    number: encryptionService.encrypt(data.number),
    projectId,
  })

  setNumberContext(observability.wideEvent, {
    bizapId: number.id,
    numberMasked: maskActorPhone(data.number),
  })

  return {
    id: number.id,
    name: data.name,
    number: data.number,
    projectId: number.projectId,
    imageUrl: null,
    lastMediaRequestStatus: null,
    createdAt: number.createdAt.toISOString(),
    updatedAt: null,
  }
}
