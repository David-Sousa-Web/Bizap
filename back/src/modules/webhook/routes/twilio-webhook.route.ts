import type { FastifyInstance } from 'fastify'
import { twilioWebhookController } from '../controllers/twilio-webhook.controller.js'
import { twilioStatusCallbackController } from '../controllers/twilio-status-callback.controller.js'

export async function twilioWebhookRoute(app: FastifyInstance) {
  app.post('/webhook/twilio', {
    schema: {
      tags: ['Webhook'],
      summary: 'Twilio webhook for receiving message replies',
    },
    handler: twilioWebhookController,
  })

  app.post('/webhook/twilio/status', {
    schema: {
      tags: ['Webhook'],
      summary: 'Twilio webhook for outbound message status updates',
    },
    handler: twilioStatusCallbackController,
  })
}
