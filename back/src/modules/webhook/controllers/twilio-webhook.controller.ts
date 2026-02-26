import type { FastifyRequest, FastifyReply } from 'fastify'
import { twilioWebhookService } from '../services/twilio-webhook.service.js'

export async function twilioWebhookController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { From, Body } = request.body as { From: string; Body: string }

  await twilioWebhookService(From, Body)

  return reply.status(200).send({
    success: true,
    message: 'Webhook processed',
    data: null,
  })
}
