import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod'
import { env } from './env.js'
import { ApplicationError } from './utils/errors.js'
import { loginRoute } from './modules/auth/routes/login.route.js'
import { createProjectRoute } from './modules/project/routes/create-project.route.js'
import { listProjectsRoute } from './modules/project/routes/list-projects.route.js'
import { getProjectRoute } from './modules/project/routes/get-project.route.js'
import { updateProjectRoute } from './modules/project/routes/update-project.route.js'
import { deleteProjectRoute } from './modules/project/routes/delete-project.route.js'
import { updateFlowMessageRoute } from './modules/project/routes/update-flow-message.route.js'
import { createNumberRoute } from './modules/number/routes/create-number.route.js'
import { listNumbersRoute } from './modules/number/routes/list-numbers.route.js'
import { listTemplatesRoute } from './modules/template/routes/list-templates.route.js'
import { sendMediaRoute } from './modules/media/routes/send-media.route.js'
import { twilioWebhookRoute } from './modules/webhook/routes/twilio-webhook.route.js'
import { uploadProjectImageRoute } from './modules/project/routes/upload-project-image.route.js'

export function buildApp() {
  const app = fastify()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  app.register(fastifyMultipart, { limits: { fileSize: 5 * 1024 * 1024 } })

  app.register(fastifyJwt, { secret: env.JWT_SECRET })

  if (env.NODE_ENV !== 'production') {
    app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Bizap API',
          description: 'API para envio de midias via WhatsApp/Twilio',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
            apiKeyAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'x-api-key',
            },
          },
        },
      },
      transform: jsonSchemaTransform,
    })

    app.register(fastifySwaggerUi, { routePrefix: '/v1/docs' })
  }

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApplicationError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
        data: null,
      })
    }

    const fastifyError = error as { validation?: unknown; message?: string }

    if (fastifyError.validation) {
      return reply.status(400).send({
        success: false,
        message: fastifyError.message ?? 'Validation error',
        data: null,
      })
    }

    console.error(error)

    return reply.status(500).send({
      success: false,
      message: 'Internal server error',
      data: null,
    })
  })

  app.register(
    async (v1App) => {
      v1App.register(loginRoute)

      v1App.register(createProjectRoute)
      v1App.register(listProjectsRoute)
      v1App.register(getProjectRoute)
      v1App.register(updateProjectRoute)
      v1App.register(deleteProjectRoute)
      v1App.register(updateFlowMessageRoute)
      v1App.register(uploadProjectImageRoute)

      v1App.register(createNumberRoute)
      v1App.register(listNumbersRoute)

      v1App.register(listTemplatesRoute)

      v1App.register(sendMediaRoute)

      v1App.register(twilioWebhookRoute)
    },
    { prefix: '/v1' },
  )

  return app
}
