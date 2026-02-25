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

  return app
}
