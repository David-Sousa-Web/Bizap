import type { FastifyReply, FastifyRequest } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import {
  twilioStatusCallbackService,
  type TwilioStatusCallbackPayload,
} from '../services/twilio-status-callback.service.js'

export async function twilioStatusCallbackController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const observability = createObservabilityContext(request, {
    module: 'webhook',
    operation: 'twilio-status',
  })

  await twilioStatusCallbackService(
    request.body as TwilioStatusCallbackPayload,
    observability,
  )

  return reply
    .status(200)
    .header('Content-Type', 'text/xml')
    .send('<Response/>')
}
