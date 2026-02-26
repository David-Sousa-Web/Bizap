import type { FastifyRequest, FastifyReply } from 'fastify'
import { listNumbersService } from '../services/list-numbers.service.js'
import { PrismaNumberRepository } from '../repositories/prisma-number-repository.js'

export async function listNumbersController(
  request: FastifyRequest<{ Params: { projectId: string } }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaNumberRepository()

  const numbers = await listNumbersService(
    request.params.projectId,
    userId,
    repository,
  )

  return reply.status(200).send({
    success: true,
    message: 'Numbers retrieved successfully',
    data: numbers,
  })
}
