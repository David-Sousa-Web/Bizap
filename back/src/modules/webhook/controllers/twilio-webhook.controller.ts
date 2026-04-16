import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { twilioWebhookService } from '../services/twilio-webhook.service.js'

export async function twilioWebhookController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { From, Body } = request.body as { From: string; Body: string }
  const observability = createObservabilityContext(request, {
    module: 'webhook',
    operation: 'process',
  })

  await twilioWebhookService(From, Body, observability)

  return reply
    .status(200)
    .header('Content-Type', 'text/xml')
    .send('<Response/>')
}
