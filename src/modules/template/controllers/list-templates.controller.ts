import type { FastifyRequest, FastifyReply } from 'fastify'
import { listTemplatesService } from '../services/list-templates.service.js'

export async function listTemplatesController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const templates = await listTemplatesService()

  return reply.status(200).send({
    success: true,
    message: 'Templates retrieved successfully',
    data: templates,
  })
}
