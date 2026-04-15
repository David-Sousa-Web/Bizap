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
import { appLogger } from './lib/logger.js'
import {
  createWideEvent,
  finalizeWideEvent,
  getWideEventLogLevel,
  setErrorContext,
  setRequestOutcome,
  setUnknownErrorContext,
} from './lib/wide-event.js'
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
import { getProjectImageRoute } from './modules/project/routes/get-project-image.route.js'

export function buildApp() {
  const app = fastify({
    loggerInstance: appLogger,
    disableRequestLogging: true,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.addHook('onRequest', async (request) => {
    request.startTimeNs = process.hrtime.bigint()
    request.wideEvent = createWideEvent(request)
    request.observability = {
      log: request.log,
      wideEvent: request.wideEvent,
    }
  })

  app.addHook('onResponse', async (request, reply) => {
    const summary = finalizeWideEvent(request, reply.statusCode)
    const level = getWideEventLogLevel(summary)

    request.log[level](summary, 'Request summary')
  })

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

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error instanceof ApplicationError
      ? error.statusCode
      : (error as { validation?: unknown; statusCode?: number }).validation
        ? 400
        : 500

    if (error instanceof ApplicationError) {
      setRequestOutcome(request.wideEvent, statusCode)
      if (!request.wideEvent.error) {
        setErrorContext(request.wideEvent, {
          type: 'ApplicationError',
          code: 'application_error',
          message: error.message,
        })
      }

      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
        data: null,
      })
    }

    const fastifyError = error as { validation?: unknown; message?: string }

    if (fastifyError.validation) {
      setRequestOutcome(request.wideEvent, statusCode)
      if (!request.wideEvent.error) {
        setErrorContext(request.wideEvent, {
          type: 'ValidationError',
          code: 'validation_error',
          message: fastifyError.message ?? 'Validation error',
        })
      }

      return reply.status(400).send({
        success: false,
        message: fastifyError.message ?? 'Validation error',
        data: null,
      })
    }

    setRequestOutcome(request.wideEvent, statusCode)
    if (!request.wideEvent.error) {
      setUnknownErrorContext(request.wideEvent, error, {
        type: 'InternalServerError',
        message: 'Internal server error',
        code: 'internal_server_error',
      })
    }

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
      v1App.register(getProjectImageRoute)

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
