import type { FastifyInstance } from 'fastify'
import { twilioWebhookController } from '../controllers/twilio-webhook.controller.js'

export async function twilioWebhookRoute(app: FastifyInstance) {
  app.post('/webhook/twilio', {
    schema: {
      tags: ['Webhook'],
      summary: 'Twilio webhook for receiving message replies',
    },
    handler: twilioWebhookController,
  })
}
