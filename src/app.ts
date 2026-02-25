import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  serializerCompiler,
  validatorCompiler,
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

export function buildApp() {
  const app = fastify()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(fastifyCors, { origin: '*' })

  app.register(fastifyJwt, { secret: env.JWT_SECRET })

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Bizap API',
        description: 'API para envio de mídias via WhatsApp/Twilio',
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

  app.register(fastifySwaggerUi, { routePrefix: '/docs' })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApplicationError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
        data: null,
      })
    }

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        message: error.message,
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

  app.register(loginRoute)

  app.register(createProjectRoute)
  app.register(listProjectsRoute)
  app.register(getProjectRoute)
  app.register(updateProjectRoute)
  app.register(deleteProjectRoute)
  app.register(updateFlowMessageRoute)

  app.register(createNumberRoute)
  app.register(listNumbersRoute)

  app.register(listTemplatesRoute)

  app.register(sendMediaRoute)

  return app
}
