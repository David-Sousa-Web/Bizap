import {
  maskActorPhone,
  type ObservabilityContext,
  setNumberContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
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

  const number = await repository.create({ ...data, projectId })

  setNumberContext(observability.wideEvent, {
    bizapId: number.id,
    numberMasked: maskActorPhone(number.number),
  })

  return {
    id: number.id,
    name: number.name,
    number: number.number,
    projectId: number.projectId,
    lastMediaRequestStatus: null,
  }
}
