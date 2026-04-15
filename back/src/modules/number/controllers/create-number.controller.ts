import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { createNumberService } from '../services/create-number.service.js'
import { PrismaNumberRepository } from '../repositories/prisma-number-repository.js'
import type { CreateNumberBody } from '../schemas/number.schema.js'

export async function createNumberController(
  request: FastifyRequest<{ Params: { projectId: string }; Body: CreateNumberBody }>,
  reply: FastifyReply,
) {
  const repository = new PrismaNumberRepository()
  const observability = createObservabilityContext(request, {
    module: 'number',
    operation: 'create',
  })

  const number = await createNumberService(
    request.body,
    request.params.projectId,
    repository,
    observability,
  )

  return reply.status(201).send({
    success: true,
    message: 'Number created successfully',
    data: number,
  })
}
